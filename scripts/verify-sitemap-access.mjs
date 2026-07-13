import { XMLParser } from "fast-xml-parser";

const CANONICAL_ORIGIN = (
  process.env.SITEMAP_ORIGIN || "https://forexfactory.cc"
).replace(/\/$/, "");
const CANONICAL_SITEMAP = `${CANONICAL_ORIGIN}/sitemap.xml`;
const CANONICAL_ROBOTS = `${CANONICAL_ORIGIN}/robots.txt`;
const GOOGLEBOT_UA =
  "Googlebot/2.1 (+http://www.google.com/bot.html)";

const sitemapVariants = [
  CANONICAL_SITEMAP,
  "http://forexfactory.cc/sitemap.xml",
  "https://www.forexfactory.cc/sitemap.xml",
  "http://www.forexfactory.cc/sitemap.xml",
];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function normalizeUrl(url) {
  return url.replace(/\/$/, "");
}

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  return { response, text };
}

async function resolveFinalUrl(url, maxRedirects = 5) {
  let currentUrl = url;

  for (let index = 0; index <= maxRedirects; index += 1) {
    const response = await fetch(currentUrl, {
      method: "HEAD",
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      assert(location, `${currentUrl} redirects without a Location header`);
      currentUrl = new URL(location, currentUrl).toString();
      continue;
    }

    return { finalUrl: currentUrl, status: response.status };
  }

  throw new Error(`${url} exceeded ${maxRedirects} redirects`);
}

function parseSitemap(xml) {
  assert(!/<html[\s>]/i.test(xml), "Sitemap returned an HTML page");

  const parser = new XMLParser({ ignoreAttributes: false });
  const parsed = parser.parse(xml);
  const urls = parsed?.urlset?.url;
  const urlList = Array.isArray(urls) ? urls : urls ? [urls] : [];

  assert(parsed?.urlset, "Sitemap is missing <urlset>");
  assert(urlList.length > 0, "Sitemap has zero URLs");

  return urlList;
}

async function verifyCanonicalSitemap(userAgent) {
  const headers = userAgent ? { "user-agent": userAgent } : undefined;
  const { response, text } = await fetchText(CANONICAL_SITEMAP, { headers });
  const contentType = response.headers.get("content-type") || "";

  assert(
    response.status === 200,
    `${CANONICAL_SITEMAP} returned HTTP ${response.status}`
  );
  assert(
    contentType.toLowerCase().includes("xml"),
    `${CANONICAL_SITEMAP} returned non-XML content type: ${contentType}`
  );

  const urls = parseSitemap(text);
  return { contentType, urlCount: urls.length };
}

async function verifyRobots() {
  const { response, text } = await fetchText(CANONICAL_ROBOTS);

  assert(
    response.status === 200,
    `${CANONICAL_ROBOTS} returned HTTP ${response.status}`
  );
  assert(
    text.includes(`Sitemap: ${CANONICAL_SITEMAP}`),
    `robots.txt does not point to ${CANONICAL_SITEMAP}`
  );

  return text;
}

async function verifyRedirects() {
  const results = [];

  for (const variant of sitemapVariants) {
    const { finalUrl, status } = await resolveFinalUrl(variant);

    assert(
      status === 200,
      `${variant} resolved to ${finalUrl} with HTTP ${status}`
    );
    assert(
      normalizeUrl(finalUrl) === normalizeUrl(CANONICAL_SITEMAP),
      `${variant} resolved to ${finalUrl}, expected ${CANONICAL_SITEMAP}`
    );

    results.push({ variant, finalUrl, status });
  }

  return results;
}

async function main() {
  console.log(`Checking canonical sitemap: ${CANONICAL_SITEMAP}`);

  const sitemap = await verifyCanonicalSitemap();
  console.log(`- Sitemap status: 200`);
  console.log(`- Sitemap content type: ${sitemap.contentType}`);
  console.log(`- Sitemap URL count: ${sitemap.urlCount}`);

  await verifyCanonicalSitemap(GOOGLEBOT_UA);
  console.log("- Googlebot sitemap access: 200");

  await verifyRobots();
  console.log(`- robots.txt points to: ${CANONICAL_SITEMAP}`);

  const redirects = await verifyRedirects();
  for (const item of redirects) {
    console.log(`- ${item.variant} -> ${item.finalUrl}`);
  }

  console.log("Sitemap access verification passed.");
}

main().catch((error) => {
  console.error("Sitemap access verification failed:");
  console.error(error.message);
  process.exit(1);
});
