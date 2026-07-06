import { ImageResponse } from "next/og";

import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

// Serves a branded 1200x630 social-share image at /og-image.png.
// Replaces the previously-missing static file that every page referenced
// via DEFAULT_OG_IMAGE (was returning HTTP 404 on all social shares).
export const runtime = "nodejs";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

// Cache aggressively at the CDN; the image only changes when the brand does.
export const revalidate = 86400;

export function GET() {
  const host = new URL(SITE_URL).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "radial-gradient(circle at 25% 15%, rgba(10,132,255,0.35), transparent 55%), linear-gradient(160deg, #0b1020 0%, #0a0f1c 55%, #05070d 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            fontSize: 34,
            fontWeight: 600,
            color: "#7db3ff",
            letterSpacing: "0.5px",
          }}
        >
          <span style={{ fontSize: 56 }}>🤖</span>
          <span>{host}</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "36px",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: "900px",
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "24px",
            fontSize: 40,
            fontWeight: 400,
            color: "#c7d2e4",
            maxWidth: "960px",
            lineHeight: 1.25,
          }}
        >
          {SITE_TAGLINE}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            fontSize: 28,
            color: "#8ea2c0",
          }}
        >
          Verified Forex robots & expert advisors · MT4 / MT5
        </div>
      </div>
    ),
    { ...size }
  );
}
