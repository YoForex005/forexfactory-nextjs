import {
  FALLBACK_BLOG_IMAGE,
  repairBlogFeaturedImageUrl,
  sanitizeBlogHtml,
} from "../src/lib/content-links";

const reportedImageUrls = [
  "https://yoforex.org/wp-content/uploads/2025/06/MM-Flip-CodePro-EA-V3.0.png",
  "https://yoforex.org/wp-content/uploads/2025/06/MM-Flip-CodePro-EA-V3.0-1.png",
  "https://yoforex.org/wp-content/uploads/2025/05/MANSAMUSSA-EA-V2.0-MT5.png",
  "https://yoforex.org/wp-content/uploads/2025/05/MANSAMUSSA-EA-V2.0-MT5-1.png",
  "https://forexfactory.cc/uploads/img_685e7d9bdf05f9.00894481.png",
  "https://forexfactory.cc/uploads/img_69368c6b071162.34546736.png",
  "https://forexfactory.cc/uploads/img_69368c81d89a88.58303989.png",
  "https://forexfactory.cc/uploads/img_69368ca5de3c04.70244373.png",
  "https://forexfactory.cc/uploads/img_6936c2c7dc41e5.05046663.png",
  "https://forexfactory.cc/uploads/img_6936c2eaeda508.03766880.png",
  "https://forexfactory.cc/uploads/img_6936c37ec1f2a8.60128288.png",
  "https://forexfactory.cc/uploads/img_6936bddd033229.47546476.png",
  "https://forexfactory.cc/uploads/img_6936bdffe4fea2.45233715.png",
  "https://forexfactory.cc/uploads/img_6936cf0b0da369.96278879.png",
  "https://forexfactory.cc/uploads/img_6936cf1d8123c4.51504320.png",
  "https://forexfactory.cc/uploads/img_6936ce0bbcdbc2.16388386.png",
  "https://forexfactory.cc/uploads/img_6936ce2acefab1.42538912.png",
  "https://forexfactory.cc/uploads/img_69365e2a393fd4.15003052.png",
  "https://forexfactory.cc/uploads/img_69365e3cdec404.79121744.png",
  "https://forexfactory.cc/uploads/img_69342978c59035.14738555.png",
  "https://forexfactory.cc/uploads/img_6934299510dfc6.70365107.png",
];

const reportedHrefUrls = [
  "https://wa.me/support",
  "https://api.whatsapp.com/send",
  "https://web.whatsapp.com/",
  "https://singaporeforexclub.com/how-to-stay-updated-with-forex-news-effectively",
  "https://www.mql5.com/en/signals/2389923",
  "https://www.mql5.com/en/market/product/186917?utm_source=chatgpt.com",
  "https://www.mql5.com/en",
  "https://www.mql5.com/en/market/product/189285?source=Site+Market+MT4+Expert+New+Rating006",
  "https://www.mql5.com/en/market/product/187117?source=External",
  "https://www.mql5.com/en/market/product/192009?source=Site+Market+MT5+Expert+New+Rating006",
  "https://forexfactory.cc/aicon-ea-v8-18-mt5",
  "https://forexfactory.cc/blog/TrendCandleEA",
  "Support & Disclaimer Support: If you need help installing or configuring your EA",
];

const source = [
  ...reportedImageUrls.map((url) => `<img src="${url}" alt="test" />`),
  ...reportedHrefUrls.map((url) => `<a href="${url}">test link</a>`),
].join("");

const repaired = sanitizeBlogHtml(source);
const stillPresent = reportedImageUrls.concat(reportedHrefUrls)
  .filter((url) => repaired.includes(url));

if (stillPresent.length > 0) {
  throw new Error(`Broken links still present: ${stillPresent.join(", ")}`);
}

if (!repaired.includes("img_683edd1784dd66.47870870.webp")
  || !repaired.includes("img_68270ce94d3fe0.94564354.webp")
  || !repaired.includes('href="https://t.me/yoforexrobot"')) {
  throw new Error("Expected replacements were not applied.");
}

if (repairBlogFeaturedImageUrl(reportedImageUrls[4]) !== FALLBACK_BLOG_IMAGE) {
  throw new Error("Broken featured images must use the local fallback image.");
}

console.log("All reported broken-link patterns are repaired.");
