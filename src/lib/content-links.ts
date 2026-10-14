const R2_IMAGE_BASE = "https://pub-9fc60e9b8d334d298b6a4a22f06229c0.r2.dev/images";

// This is a locally-served route, so it remains available even when an old
// post's featured image has been deleted from the legacy media host.
export const FALLBACK_BLOG_IMAGE = "/og-image.png";

// These assets were migrated from the old WordPress library.  Keep the map
// explicit: a replacement must be a verified asset, never a generic image.
const LEGACY_IMAGE_REPLACEMENTS: Record<string, string> = {
  "https://yoforex.org/wp-content/uploads/2025/06/MM-Flip-CodePro-EA-V3.0.png": `${R2_IMAGE_BASE}/img_683edd1784dd66.47870870.webp`,
  "https://yoforex.org/wp-content/uploads/2025/06/MM-Flip-CodePro-EA-V3.0-1.png": `${R2_IMAGE_BASE}/img_683edd1784dd66.47870870.webp`,
  "https://yoforex.org/wp-content/uploads/2025/05/MANSAMUSSA-EA-V2.0-MT5.png": `${R2_IMAGE_BASE}/img_68270ce94d3fe0.94564354.webp`,
  "https://yoforex.org/wp-content/uploads/2025/05/MANSAMUSSA-EA-V2.0-MT5-1.png": `${R2_IMAGE_BASE}/img_68270ce94d3fe0.94564354.webp`,
};

function decodeHtmlUrl(url: string) {
  return url.replace(/&amp;/gi, "&").trim();
}

function isLegacyBrokenImage(url: string) {
  const normalizedUrl = decodeHtmlUrl(url);
  return normalizedUrl.startsWith("https://forexfactory.cc/uploads/")
    || normalizedUrl.startsWith("http://forexfactory.cc/uploads/");
}

export function repairBlogImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const replacement = LEGACY_IMAGE_REPLACEMENTS[decodeHtmlUrl(url)];
  if (replacement) return replacement;
  return isLegacyBrokenImage(url) ? null : url;
}

/**
 * Featured images and social images need a real URL even when their historic
 * media file is gone. Inline article images are instead removed, which avoids
 * repeating a generic image inside editorial copy.
 */
export function repairBlogFeaturedImageUrl(url?: string | null): string {
  return repairBlogImageUrl(url) ?? FALLBACK_BLOG_IMAGE;
}

function replacementForImage(url: string) {
  return repairBlogImageUrl(url);
}

function isKnownBrokenHref(url: string) {
  const normalizedUrl = decodeHtmlUrl(url).toLowerCase();

  return normalizedUrl.includes("mql5.com/")
    || normalizedUrl.includes("singaporeforexclub.com/how-to-stay-updated-with-forex-news-effectively")
    || normalizedUrl.includes("/aicon-ea-v8-18-mt5")
    || normalizedUrl.includes("/trendcandleea")
    || normalizedUrl.includes("support & disclaimer");
}

function isLegacyWhatsAppHref(url: string) {
  const normalizedUrl = decodeHtmlUrl(url);
  return normalizedUrl.includes("wa.me/+443300272265")
    || normalizedUrl.includes("wa.me/443300272265")
    || normalizedUrl.includes("wa.me/917449454349")
    || normalizedUrl.includes("api.whatsapp.com/send/?phone=%2B443300272265")
    || normalizedUrl.includes("api.whatsapp.com/send/?phone=443300272265")
    || normalizedUrl.includes("api.whatsapp.com/send/?phone=917449454349");
}

/**
 * Repairs historic HTML at render time. This protects visitors immediately
 * after deployment, including posts that were created before the media
 * migration. The matching database migration uses this same function.
 */
export function sanitizeBlogHtml(content: string): string {
  let sanitized = content.replace(/<img\b[^>]*\bsrc\s*=\s*(["'])(.*?)\1[^>]*>/gi, (tag, quote, src) => {
    const replacement = replacementForImage(src);
    if (replacement) {
      return tag.replace(src, replacement);
    }

    // The legacy uploads host has no remaining media. Do not leave a broken
    // image request in the page; surrounding editorial copy is preserved.
    return replacement === null ? "" : tag;
  });

  sanitized = sanitized.replace(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi, (tag, attributes, children) => {
    const hrefMatch = attributes.match(/\bhref\s*=\s*(["'])(.*?)\1/i);
    if (!hrefMatch) return tag;

    const href = hrefMatch[2];
    if (isLegacyWhatsAppHref(href)) {
      return `<a href="/contact">${children}</a>`;
    }

    // Retain the editorial text but remove destinations that are confirmed
    // unavailable or malformed. This is safer than silently redirecting to an
    // unrelated page.
    return isKnownBrokenHref(href) ? children : tag;
  });

  return sanitized;
}

