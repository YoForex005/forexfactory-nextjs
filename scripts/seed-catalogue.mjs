import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const source = "MQL5 Code Base";
const catalogue = [
  {
    uuid: "mql5-macd-sample-mt5",
    title: "MACD Sample (MT5)",
    description: `<p>Official MetaQuotes example Expert Advisor for MetaTrader 5. It demonstrates an automated strategy using the MACD indicator, with inputs for lot size, take profit, trailing stop, and MACD levels.</p><p>Source: <a href="https://www.mql5.com/en/code/2154" rel="nofollow noopener" target="_blank">${source}</a>. Test on a demo account before any live use.</p>`,
    filePath: "https://www.mql5.com/en/code/download/2154.zip",
    mime: "application/zip",
    sizeBytes: 18412,
    createdAt: new Date("2014-06-02T11:22:00Z"),
    platform: "MT5",
    strategy: "trend_following",
    version: "5.20",
    requirements: "MetaTrader 5\nUse a demo account for evaluation",
    compatibility: "MetaTrader 5 (MQL5)",
  },
  {
    uuid: "mql5-bollinger-bands-mt5",
    title: "Bollinger Bands (MT5)",
    description: `<p>Official MetaQuotes Bollinger Bands technical indicator for MetaTrader 5. The bands adapt to volatility using a moving average and standard deviations.</p><p>Source: <a href="https://www.mql5.com/en/code/14" rel="nofollow noopener" target="_blank">${source}</a>. Use it as an analytical tool and validate any setup independently.</p>`,
    filePath: "https://www.mql5.com/en/code/download/14.zip",
    mime: "application/zip",
    sizeBytes: 5878,
    createdAt: new Date("2010-01-26T11:03:00Z"),
    platform: "MT5",
    strategy: "volatility",
    requirements: "MetaTrader 5\nReview indicator parameters before use",
    compatibility: "MetaTrader 5 (MQL5)",
  },
  {
    uuid: "mql5-moving-average-mt5",
    title: "Moving Average (MT5)",
    description: `<p>Official MetaQuotes example Expert Advisor for MetaTrader 5. It uses a Moving Average indicator to evaluate opening and closing conditions.</p><p>Source: <a href="https://www.mql5.com/en/code/1921" rel="nofollow noopener" target="_blank">${source}</a>. This is an educational example, not a performance guarantee.</p>`,
    filePath: "https://www.mql5.com/en/code/download/1921.zip",
    mime: "application/zip",
    sizeBytes: 0,
    createdAt: new Date("2013-12-24T00:00:00Z"),
    platform: "MT5",
    strategy: "trend_following",
    requirements: "MetaTrader 5\nUse a demo account for evaluation",
    compatibility: "MetaTrader 5 (MQL5)",
  },
  {
    uuid: "mql5-macd-sample-mt4",
    title: "MACD Sample (MT4)",
    description: `<p>Official MetaQuotes MACD Sample Expert Advisor for MetaTrader 4. This is a classical MACD-based example intended for learning and testing.</p><p>Source: <a href="https://www.mql5.com/en/code/7150" rel="nofollow noopener" target="_blank">${source}</a>. Test on a demo account before any live use.</p>`,
    filePath: "https://www.mql5.com/en/code/download/7150.zip",
    mime: "application/zip",
    sizeBytes: 7086,
    createdAt: new Date("2005-09-15T17:49:00Z"),
    platform: "MT4",
    strategy: "trend_following",
    requirements: "MetaTrader 4\nUse a demo account for evaluation",
    compatibility: "MetaTrader 4 (MQL4)",
  },
  {
    uuid: "mql5-moving-averages-mt4",
    title: "Moving Averages (MT4)",
    description: `<p>Official MetaQuotes Moving Averages technical indicator for MetaTrader 4. It supports simple, exponential, smoothed, and linear weighted moving averages.</p><p>Source: <a href="https://www.mql5.com/en/code/7534" rel="nofollow noopener" target="_blank">${source}</a>. Use it as an analytical tool and validate any setup independently.</p>`,
    filePath: "https://www.mql5.com/en/code/download/7534.zip",
    mime: "application/zip",
    sizeBytes: 5478,
    createdAt: new Date("2005-11-29T11:54:00Z"),
    platform: "MT4",
    strategy: "trend_following",
    requirements: "MetaTrader 4\nReview indicator parameters before use",
    compatibility: "MetaTrader 4 (MQL4)",
  },
  {
    uuid: "mql5-rsi-mt4",
    title: "Relative Strength Index (RSI) (MT4)",
    description: `<p>Official MetaQuotes Relative Strength Index technical indicator for MetaTrader 4. RSI is a momentum oscillator that ranges from 0 to 100.</p><p>Source: <a href="https://www.mql5.com/en/code/7898" rel="nofollow noopener" target="_blank">${source}</a>. Use it as an analytical tool and validate any setup independently.</p>`,
    filePath: "https://www.mql5.com/en/code/download/7898.zip",
    mime: "application/zip",
    sizeBytes: 4803,
    createdAt: new Date("2005-11-29T11:55:00Z"),
    platform: "MT4",
    strategy: "momentum",
    requirements: "MetaTrader 4\nReview indicator parameters before use",
    compatibility: "MetaTrader 4 (MQL4)",
  },
];

async function main() {
  let created = 0;
  let updated = 0;

  for (const item of catalogue) {
    const existing = await prisma.signal.findFirst({ where: { uuid: item.uuid }, select: { id: true } });
    const sourceData = {
      ...item,
      features: "Official source link\nNo performance claims included",
    };

    if (existing) {
      // Preserve publisher-maintained fields and real user metrics when the
      // source catalogue is refreshed.
      await prisma.signal.update({ where: { id: existing.id }, data: sourceData });
      updated += 1;
    } else {
      await prisma.signal.create({
        data: {
          ...sourceData,
          winRate: null,
          profitFactor: null,
          maxDrawdown: null,
          rating: null,
          downloadCount: 0,
          isPremium: false,
          price: null,
        },
      });
      created += 1;
    }
  }

  const [totalSignals, downloadStats, userDownloadRecords] = await Promise.all([
    prisma.signal.count(),
    prisma.signal.aggregate({ _sum: { downloadCount: true } }),
    prisma.userDownload.count(),
  ]);
  console.log(
    `Catalogue seed complete: ${created} created, ${updated} updated. ` +
    `Database totals: ${totalSignals} tools, ${downloadStats._sum.downloadCount ?? 0} tracked downloads, ${userDownloadRecords} user download records.`
  );
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
