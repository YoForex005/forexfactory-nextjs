import { XMLParser } from "fast-xml-parser";

const ORIGIN = (process.env.CONTENT_ORIGIN || "http://localhost:3000").replace(
  /\/$/,
  ""
);
const SITEMAP_URL = `${ORIGIN}/sitemap.xml`;
const SEARCH_URL = `${ORIGIN}/api/search?q=mt4`;
const USER_AGENT = "Googlebot/2.1 (+http://www.google.com/bot.html)";
const BLOG_SAMPLE_LIMIT = Number(process.env.CONTENT_BLOG_SAMPLE_LIMIT || 25);
const FULL_VERIFY = process.env.CONTENT_FULL_VERIFY === "1";
const FETCH_CONCURRENCY = Math.max(
  1,
  Number(process.env.CONTENT_FETCH_CONCURRENCY || 12)
);
const FETCH_RETRIES = Math.max(0, Number(process.env.CONTENT_FETCH_RETRIES || 2));
const FETCH_TIMEOUT_MS = Math.max(
  1000,
  Number(process.env.CONTENT_FETCH_TIMEOUT_MS || 30000)
);
const PROGRESS_EVERY = Math.max(
  1,
  Number(process.env.CONTENT_PROGRESS_EVERY || 250)
);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatFetchError(error) {
  const cause = error?.cause;
  const causeParts = [
    cause?.code,
    cause?.errno,
    cause?.syscall,
    cause?.address,
    cause?.port,
  ].filter(Boolean);

  return [error?.message || String(error), causeParts.join(" ")].filter(Boolean).join(" | ");
}

async function fetchText(url) {
  let lastError;

  for (let attempt = 0; attempt <= FETCH_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        headers: { "user-agent": USER_AGENT },
        signal: controller.signal,
      });
      const text = await response.text();
      return { response, text };
    } catch (error) {
      lastError = error;

      if (attempt < FETCH_RETRIES) {
        await wait(500 * (attempt + 1));
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error(`${url} fetch failed: ${formatFetchError(lastError)}`);
}

function parseSitemap(xml) {
  const parsed = new XMLParser({ ignoreAttributes: false }).parse(xml);
  const urls = parsed?.urlset?.url;
  const urlList = Array.isArray(urls) ? urls : urls ? [urls] : [];

  assert(parsed?.urlset, "Sitemap is missing <urlset>");
  assert(urlList.length > 0, "Sitemap has zero URLs");

  return urlList.map((item) => item.loc).filter(Boolean);
}

function toOriginUrl(url) {
  const parsed = new URL(url);
  return `${ORIGIN}${parsed.pathname}${parsed.search}`;
}

function assertNoDuplicateUrls(urls) {
  const seen = new Set();
  const duplicates = new Set();

  for (const url of urls) {
    if (seen.has(url)) {
      duplicates.add(url);
    }
    seen.add(url);
  }

  assert(
    duplicates.size === 0,
    `Sitemap has duplicate URLs: ${[...duplicates].slice(0, 10).join(", ")}`
  );
}

async function verifySearchApi() {
  const { response, text } = await fetchText(SEARCH_URL);

  assert(response.status === 200, `${SEARCH_URL} returned HTTP ${response.status}`);

  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error(`${SEARCH_URL} did not return valid JSON`);
  }

  assert(Array.isArray(payload.blogs), "Search API response is missing blogs[]");
  assert(Array.isArray(payload.signals), "Search API response is missing signals[]");
  assert(typeof payload.total === "number", "Search API response is missing numeric total");

  return payload.total;
}

async function verifyHtmlUrls(urls, label) {
  const failures = [];
  let nextIndex = 0;
  let completed = 0;

  async function worker() {
    while (nextIndex < urls.length) {
      const url = urls[nextIndex];
      nextIndex += 1;

      try {
        const { response, text } = await fetchText(url);
        const contentType = response.headers.get("content-type") || "";

        if (response.status !== 200) {
          failures.push(`${url} returned HTTP ${response.status}`);
          continue;
        }

        if (!contentType.toLowerCase().includes("html")) {
          failures.push(`${url} returned non-HTML content type: ${contentType}`);
          continue;
        }

        if (!/<html[\s>]/i.test(text) || !/<body[\s>]/i.test(text)) {
          failures.push(`${url} did not return a complete HTML document`);
        }
      } catch (error) {
        failures.push(`${url} failed: ${error.message}`);
      } finally {
        completed += 1;
        if (completed === urls.length || completed % PROGRESS_EVERY === 0) {
          console.log(`  ${label}: ${completed}/${urls.length}`);
        }
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(FETCH_CONCURRENCY, urls.length) }, () => worker())
  );

  assert(
    failures.length === 0,
    `${label} fetch failures:\n${failures.slice(0, 20).join("\n")}`
  );
}

async function main() {
  console.log(`Checking content fetches from: ${ORIGIN}`);

  const { response, text } = await fetchText(SITEMAP_URL);
  assert(response.status === 200, `${SITEMAP_URL} returned HTTP ${response.status}`);

  const sitemapUrls = parseSitemap(text);
  assertNoDuplicateUrls(sitemapUrls);
  console.log(`- Sitemap URLs: ${sitemapUrls.length}`);

  const searchTotal = await verifySearchApi();
  console.log(`- Search API: 200 (${searchTotal} results for mt4)`);

  const fetchUrls = sitemapUrls.map(toOriginUrl);

  const categoryUrls = fetchUrls.filter((url) => url.includes("/category/"));
  await verifyHtmlUrls(categoryUrls, "Category URLs");
  console.log(`- Category URLs: ${categoryUrls.length} passed`);

  const staticUrls = fetchUrls.filter(
    (url) => !url.includes("/blog/") && !url.includes("/category/")
  );
  await verifyHtmlUrls(staticUrls, "Static sitemap URLs");
  console.log(`- Static sitemap URLs: ${staticUrls.length} passed`);

  const blogUrls = fetchUrls.filter((url) => url.includes("/blog/"));
  const blogSample = FULL_VERIFY ? blogUrls : blogUrls.slice(0, BLOG_SAMPLE_LIMIT);
  await verifyHtmlUrls(blogSample, "Blog URLs");
  console.log(
    `- Blog URLs: ${blogSample.length} passed${FULL_VERIFY ? "" : " (sample)"}`
  );

  console.log("Content fetch verification passed.");
}

main().catch((error) => {
  console.error("Content fetch verification failed:");
  console.error(error.message);
  process.exit(1);
});
