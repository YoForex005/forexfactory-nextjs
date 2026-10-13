import { sanitizeBlogHtml } from "../src/lib/content-links";

const reportedImageUrls = [
  "https://yoforex.org/wp-content/uploads/2025/06/MM-Flip-CodePro-EA-V3.0.png",
  "https://yoforex.org/wp-content/uploads/2025/06/MM-Flip-CodePro-EA-V3.0-1.png",
  "https://yoforex.org/wp-content/uploads/2025/05/MANSAMUSSA-EA-V2.0-MT5.png",
  "https://yoforex.org/wp-content/uploads/2025/05/MANSAMUSSA-EA-V2.0-MT5-1.png",
  "https://forexfactory.cc/uploads/img_685e7d9bdf05f9.00894481.png",
];

const reportedHrefUrls = [
  "https://wa.me/+443300272265",
  "https://api.whatsapp.com/send/?phone=443300272265&text&type=phone_number&app_absent=0",
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
  || !repaired.includes('href="/contact"')) {
  throw new Error("Expected replacements were not applied.");
}

console.log("All reported broken-link patterns are repaired.");
