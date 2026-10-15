"use client";

import { ArrowDown } from "lucide-react";

export function BrowseCatalogueButton() {
  function scrollToCatalogue() {
    const catalogue = document.getElementById("catalogue");
    if (!catalogue) return;

    catalogue.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", "#catalogue");
  }

  return (
    <button
      type="button"
      onClick={scrollToCatalogue}
      className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-dark focus:outline-none focus:ring-4 focus:ring-brand/30"
    >
      Browse downloads <ArrowDown className="h-4 w-4" />
    </button>
  );
}
