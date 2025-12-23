"use client";

import { Brain, Target, User, Sparkles, HelpCircle } from "lucide-react";

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

    const hasMetadata = primaryKeyword || searchIntent || contentType || personaType || targetAudience || (tone && style);

    return (
        <div className="space-y-8 mt-12">
            {/* AI Generation Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 rounded-lg border border-brand/20">
                <Sparkles className="h-3.5 w-3.5" />
                AI Generated Content
            </div>

            {/* Content Metadata Grid */}
            {hasMetadata && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {primaryKeyword && (
                        <MetaCard icon={Target} label="Primary Keyword" value={primaryKeyword} />
                    )}
                    {searchIntent && (
                        <MetaCard icon={Brain} label="Search Intent" value={searchIntent} />
                    )}
                    {contentType && (
                        <MetaCard icon={Brain} label="Content Type" value={contentType} />
                    )}
                    {personaType && (
                        <MetaCard icon={User} label="Writing Persona" value={personaType} />
                    )}
                    {targetAudience && (
                        <MetaCard icon={Target} label="Target Audience" value={targetAudience} />
                    )}
                    {tone && style && (
                        <MetaCard icon={Sparkles} label="Tone & Style" value={`${tone} / ${style}`} />
                    )}
                </div>
            )}

            {/* LSI Keywords */}
            {parsedLsiKeywords.length > 0 && (
                <div className="p-5 bg-[#0d0d14] rounded-xl border border-white/5">
                    <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">LSI Keywords Used</p>
                    <div className="flex flex-wrap gap-2">
                        {parsedLsiKeywords.map((keyword, idx) => (
                            <span
                                key={idx}
                                className="px-2.5 py-1 text-xs text-zinc-400 bg-white/5 rounded-md border border-white/10"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}

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
function MetaCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
    return (
        <div className="p-4 bg-[#0d0d14] rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-brand" />
                <span className="text-xs uppercase tracking-wider text-zinc-500">{label}</span>
            </div>
            <p className="text-sm text-white font-medium">{value}</p>
        </div>
    );
}
