import type { MetadataRoute } from "next";

import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "ForexFactory",
    description: SITE_TAGLINE,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#05070d",
    theme_color: "#0a84ff",
    icons: [
      {
        src: `${SITE_URL}/favicon.png`,
        // public/favicon.png is a 48 × 48 image. Declaring it as 192 or 512
        // causes Chrome to reject the manifest icon.
        sizes: "48x48",
        type: "image/png",
      },
    ],
  };
}
