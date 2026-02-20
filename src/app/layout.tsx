import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Download verified Forex robots and expert advisors for MT4 / MT5. Simple access, clear details, and regular updates.",
  keywords: [
    "forex expert advisors",
    "mt4 robots",
    "mt5 ea",
    "automated trading",
    "forex signals",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "Download verified Forex robots and expert advisors for MT4 / MT5. Simple access, clear details, and regular updates.",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} hero image`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@forexfactorycc",
    site: "@forexfactorycc",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description:
      "Download verified Forex robots and expert advisors for MT4 / MT5. Simple access, clear details, and regular updates.",
    images: [`${SITE_URL}/og-image.png`],
  },
  verification: {
    google: "zaVCeEONH2MBblcEN1wrlJhwNvknYX-5JcCcpvJWChk",
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-100 text-white min-h-screen`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PRQRZ948"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {/* Google Tag Manager */}
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-PRQRZ948');`}
        </Script>
        {/* End Google Tag Manager */}
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W7H5FJT0YT"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-W7H5FJT0YT');
          `}
        </Script>

        <Providers>
          <div className="relative min-h-screen bg-gradient-to-b from-surface-50 via-surface-100 to-black">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(10,132,255,0.15),_transparent_55%)]" />
            <div className="relative z-10 flex min-h-screen flex-col">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
