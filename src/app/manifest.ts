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
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${SITE_URL}/favicon.png`,
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: `${SITE_URL}/favicon.png`,
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
