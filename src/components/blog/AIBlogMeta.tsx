"use client";

import { HelpCircle } from "lucide-react";

interface FAQItem {
    question: string;
    answer: string;
}

interface AIBlogMetaProps {
    isAiGenerated?: boolean;
    primaryKeyword?: string | null;
    searchIntent?: string | null;
    contentType?: string | null;
    personaType?: string | null;
    targetAudience?: string | null;
    lsiKeywords?: string | null;
    faqSchema?: string | null;
    tone?: string | null;
    style?: string | null;
}

export function AIBlogMeta({
    isAiGenerated,
    primaryKeyword,
    searchIntent,
    contentType,
    personaType,
    targetAudience,
    lsiKeywords,
    faqSchema,
    tone,
    style,
}: AIBlogMetaProps) {
    if (!isAiGenerated) return null;

    // Parse JSON fields safely
    let parsedLsiKeywords: string[] = [];
    let parsedFaqSchema: FAQItem[] = [];

    try {
        if (lsiKeywords) parsedLsiKeywords = JSON.parse(lsiKeywords);
    } catch {
        parsedLsiKeywords = [];
    }

    try {
        if (faqSchema) parsedFaqSchema = JSON.parse(faqSchema);
    } catch {
        parsedFaqSchema = [];
    }



    return (
        <div className="space-y-8 mt-12">
            {/* FAQ Schema Section */}
            {parsedFaqSchema.length > 0 && (
                <div className="mt-8 p-6 bg-gradient-to-br from-brand/5 to-transparent rounded-2xl border border-brand/10">
                    <div className="flex items-center gap-2 mb-6">
                        <HelpCircle className="h-5 w-5 text-brand" />
                        <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {parsedFaqSchema.map((faq, idx) => (
                            <details
                                key={idx}
                                className="group p-4 bg-[#0d0d14] rounded-xl border border-white/5 hover:border-brand/30 transition-colors"
                            >
                                <summary className="flex items-center justify-between cursor-pointer list-none text-white font-medium">
                                    <span className="pr-4">{faq.question}</span>
                                    <span className="ml-4 text-zinc-500 group-open:rotate-180 transition-transform shrink-0">▼</span>
                                </summary>
                                <p className="mt-3 pt-3 text-zinc-400 border-t border-white/5 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for metadata cards

