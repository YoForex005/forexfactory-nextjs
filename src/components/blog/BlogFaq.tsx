import { ChevronDown, HelpCircle } from "lucide-react";
import type { FAQItem } from "@/lib/seo";

interface BlogFaqProps {
  items: FAQItem[];
}

export function BlogFaq({ items }: BlogFaqProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="blog-faq-heading"
      className="mt-12 rounded-2xl border border-brand/10 bg-gradient-to-br from-brand/5 to-transparent p-6 md:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
          <HelpCircle className="h-5 w-5 text-brand" aria-hidden="true" />
        </div>
        <h2 id="blog-faq-heading" className="text-2xl font-bold text-white">
          Frequently Asked Questions
        </h2>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <details
            key={`${item.question}-${index}`}
            className="group rounded-xl border border-white/5 bg-[#0d0d14] open:border-brand/30"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-medium text-white transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
              <span>{item.question}</span>
              <ChevronDown
                className="h-5 w-5 shrink-0 text-zinc-500 transition-transform group-open:rotate-180 group-open:text-brand"
                aria-hidden="true"
              />
            </summary>
            <div className="border-t border-white/5 px-5 py-4">
              <p className="whitespace-pre-line leading-7 text-zinc-400">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
