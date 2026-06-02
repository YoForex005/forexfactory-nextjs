"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HelpCircle, ChevronDown, ChevronUp, Cpu, TrendingUp, HeadphonesIcon } from "lucide-react";
import { generateFAQPageSchema } from "@/lib/seo";
import Script from "next/script";

const faqCategories = [
    {
        title: "General",
        icon: HelpCircle,
        color: "brand",
        faqs: [
            {
                question: "What is ForexFactory.cc?",
                answer: "ForexFactory.cc is a platform that provides free Expert Advisors (EAs), trading signals, MT4/MT5 indicators, and educational resources for Forex traders. Our mission is to democratize algorithmic trading by making professional-grade tools accessible to everyone."
            },
            {
                question: "Are all Expert Advisors really free?",
                answer: "Yes! All our Expert Advisors, indicators, and trading tools are 100% free to download and use. We believe that quality trading tools should be accessible to all traders, regardless of their budget. There are no hidden fees or premium versions."
            },
            {
                question: "Do I need to create an account to download EAs?",
                answer: "For most downloads, you can access them directly without an account. However, creating a free account gives you access to exclusive content, download history, and personalized recommendations."
            },
            {
                question: "How often do you add new Expert Advisors?",
                answer: "We add new Expert Advisors and update existing ones regularly. Our team continuously tests and optimizes EAs to ensure they perform well in current market conditions. Subscribe to our newsletter to stay updated on new releases."
            }
        ]
    },
    {
        title: "Expert Advisors",
        icon: Cpu,
        color: "purple",
        faqs: [
            {
                question: "What platforms do your EAs support?",
                answer: "Our Expert Advisors are primarily designed for MetaTrader 4 (MT4) and MetaTrader 5 (MT5). Each EA clearly indicates which platform it's compatible with on its download page."
            },
            {
                question: "How do I install an Expert Advisor?",
                answer: "To install an EA: 1) Download the EA file (.ex4 or .ex5), 2) Open MetaTrader, 3) Go to File > Open Data Folder, 4) Navigate to MQL4/5 > Experts folder, 5) Paste the EA file, 6) Restart MetaTrader, 7) Find the EA in Navigator and drag it to a chart. Detailed installation guides are available in our blog."
            },
            {
                question: "Can I use EAs on multiple accounts?",
                answer: "Yes, our EAs can be used on multiple trading accounts. However, we recommend thorough testing on a demo account before deploying to live accounts. Each broker may have different conditions that affect EA performance."
            },
            {
                question: "Do EAs work with any broker?",
                answer: "Most of our EAs work with any broker that supports MetaTrader 4 or 5. However, EA performance can vary based on broker spreads, execution speed, and server location. We recommend using brokers with low spreads and fast execution."
            },
            {
                question: "What should I do if an EA isn't working?",
                answer: "First, ensure that Expert Advisors are enabled in MetaTrader (Tools > Options > Expert Advisors > Allow automated trading). Check that the EA is attached to the correct chart and timeframe. Review our troubleshooting guide or contact support if issues persist."
            }
        ]
    },
    {
        title: "Trading",
        icon: TrendingUp,
        color: "emerald",
        faqs: [
            {
                question: "Are the backtest results accurate?",
                answer: "We provide backtest results as historical performance indicators. Backtests are conducted using quality historical data with realistic spread and slippage settings. However, past performance does not guarantee future results. Always test on a demo account before live trading."
            },
            {
                question: "What's the minimum capital required?",
                answer: "The minimum capital depends on the specific EA and your broker's requirements. Most EAs can work with accounts as small as $100-$500, but we recommend $1,000+ for proper risk management. Each EA page includes recommended minimum balance."
            },
            {
                question: "How much profit can I expect?",
                answer: "Profitability varies based on market conditions, broker, account size, and risk settings. We never guarantee specific profits. Trading involves substantial risk of loss. Always use proper risk management and never invest more than you can afford to lose."
            },
            {
                question: "Can I modify EA settings?",
                answer: "Yes, all our EAs come with adjustable parameters. You can modify lot sizes, stop loss, take profit, and other settings to match your risk tolerance and trading style. Each EA includes documentation explaining available settings."
            }
        ]
    },
    {
        title: "Technical Support",
        icon: HeadphonesIcon,
        color: "blue",
        faqs: [
            {
                question: "How can I contact support?",
                answer: "You can reach our support team through the Contact page, or email us directly at support@forexfactory.cc. We typically respond within 24 hours. For urgent issues, include detailed information about your setup and the problem you're experiencing."
            },
            {
                question: "Do you provide VPS recommendations?",
                answer: "Yes, for optimal EA performance, we recommend using a VPS (Virtual Private Server) located near your broker's server. This ensures 24/7 operation and minimal latency. Check our blog for VPS recommendations and setup guides."
            },
            {
                question: "Can I request a specific EA or feature?",
                answer: "Absolutely! We welcome suggestions from our community. Use our contact form to submit EA requests or feature suggestions. While we can't guarantee all requests will be fulfilled, popular requests are added to our development roadmap."
            },
            {
                question: "Is my download history saved?",
                answer: "If you create an account, your download history is saved so you can easily re-download EAs or track what you've tried. Guest downloads are not tracked."
            }
        ]
    }
];

// Flatten FAQs for schema
const allFaqs = faqCategories.flatMap(cat => cat.faqs);

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-brand"
            >
                <span className="pr-8 font-medium text-white">{question}</span>
                {isOpen ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-brand" />
                ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-zinc-400" />
                )}
            </button>
            {isOpen && (
                <div className="pb-5 text-zinc-400 leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

export default function FAQPage() {
    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string }> = {
            brand: { bg: "bg-brand/10", text: "text-brand" },
            purple: { bg: "bg-purple-500/10", text: "text-purple-400" },
            emerald: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
            blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
        };
        return colors[color] || colors.brand;
    };

    return (
        <div className="flex min-h-screen flex-col">
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(generateFAQPageSchema(allFaqs))
                }}
            />

            <Navbar />

            <main className="flex-1 bg-surface-100">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                                <HelpCircle className="h-8 w-8 text-brand" />
                            </div>
                            <h1 className="mb-6 text-5xl font-bold leading-tight text-white">
                                Frequently Asked Questions
                            </h1>
                            <p className="text-xl text-zinc-300">
                                Find answers to common questions about our Expert Advisors, trading tools, and services.
                            </p>
                        </div>
                    </div>
                </section>

                {/* FAQ Categories */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl space-y-12">
                            {faqCategories.map((category) => {
                                const Icon = category.icon;
                                const colorClasses = getColorClasses(category.color);

                                return (
                                    <div key={category.title} className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                        <div className="mb-6 flex items-center gap-4">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses.bg}`}>
                                                <Icon className={`h-6 w-6 ${colorClasses.text}`} />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                                        </div>
                                        <div className="divide-y divide-white/10">
                                            {category.faqs.map((faq, index) => (
                                                <FAQItem key={index} question={faq.question} answer={faq.answer} />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-gradient-to-br from-brand/20 to-purple-500/20 p-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-white">
                                Still Have Questions?
                            </h2>
                            <p className="mb-8 text-lg text-zinc-300">
                                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
                            </p>
                            <a
                                href="/contact"
                                className="inline-flex items-center gap-2 rounded-lg bg-brand px-8 py-4 font-medium text-white transition-colors hover:bg-brand-dark"
                            >
                                <HeadphonesIcon className="h-5 w-5" />
                                Contact Support
                            </a>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
