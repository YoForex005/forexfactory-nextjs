import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, Scale, AlertTriangle, Shield, Ban, RefreshCw, Gavel } from "lucide-react";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Terms of Service - User Agreement & Trading Disclaimers",
    description: "Read the Terms of Service for ForexFactory.cc. Understand your rights and responsibilities when using our Expert Advisors and trading tools.",
    openGraph: {
        title: `Terms of Service | ${SITE_NAME}`,
        description: "Read the Terms of Service for ForexFactory.cc.",
        type: 'website',
    },
    alternates: {
        canonical: `${SITE_URL}/terms`,
    },
    robots: {
        index: true,
        follow: true,
    },
    twitter: {
        card: "summary_large_image",
        title: `Terms of Service | ${SITE_NAME}`,
        description: "Read the Terms of Service for ForexFactory.cc.",
        images: [DEFAULT_OG_IMAGE],
    }
};

export default function TermsOfServicePage() {
    const lastUpdated = "December 31, 2024";

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />

            <main className="flex-1 bg-surface-100">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                                <FileText className="h-8 w-8 text-brand" />
                            </div>
                            <h1 className="mb-6 text-5xl font-bold leading-tight text-white">
                                Terms of Service
                            </h1>
                            <p className="text-xl text-zinc-300">
                                Please read these terms carefully before using our services. By accessing our website, you agree to these terms.
                            </p>
                            <p className="mt-4 text-sm text-zinc-400">
                                Last updated: {lastUpdated}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl space-y-12">

                            {/* Acceptance */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                                    <Scale className="h-6 w-6 text-brand" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">1. Acceptance of Terms</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        By accessing and using {SITE_NAME} ("the Service"), you accept and agree to be bound by the terms
                                        and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
                                    </p>
                                    <p className="text-zinc-400">
                                        We reserve the right to update these terms at any time. Continued use of the Service after changes
                                        constitutes acceptance of the new terms.
                                    </p>
                                </div>
                            </div>

                            {/* Use of Services */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <Shield className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">2. Use of Services</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        Our services include but are not limited to Expert Advisors (EAs), trading signals, indicators,
                                        educational content, and blog articles. By using our services, you agree to:
                                    </p>
                                    <ul className="ml-6 list-disc space-y-2 text-zinc-400">
                                        <li>Use the services only for lawful purposes</li>
                                        <li>Not redistribute, sell, or commercially exploit our content without permission</li>
                                        <li>Not reverse engineer or modify our software beyond personal customization</li>
                                        <li>Provide accurate information when creating an account</li>
                                        <li>Maintain the confidentiality of your account credentials</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Trading Disclaimer */}
                            <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">3. Trading Risk Disclaimer</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p className="font-semibold">
                                        IMPORTANT: Trading Forex and CFDs involves significant risk of loss and is not suitable for all investors.
                                    </p>
                                    <ul className="ml-6 list-disc space-y-2 text-zinc-400">
                                        <li>Past performance of any Expert Advisor does not guarantee future results</li>
                                        <li>You may lose more than your initial investment</li>
                                        <li>Our tools are provided for educational and informational purposes only</li>
                                        <li>We do not provide financial advice or recommendations</li>
                                        <li>You should consult with a qualified financial advisor before trading</li>
                                        <li>Demo testing is strongly recommended before live trading</li>
                                    </ul>
                                    <p className="mt-4 text-yellow-400/80">
                                        By using our Expert Advisors and signals, you acknowledge that you understand these risks and
                                        accept full responsibility for your trading decisions.
                                    </p>
                                </div>
                            </div>

                            {/* Intellectual Property */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                                    <Gavel className="h-6 w-6 text-purple-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">4. Intellectual Property</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        All content on this website, including but not limited to Expert Advisors, indicators, articles,
                                        graphics, logos, and software code, is the property of {SITE_NAME} or its content suppliers.
                                    </p>
                                    <ul className="ml-6 list-disc space-y-2 text-zinc-400">
                                        <li>You are granted a personal, non-transferable license to use downloaded materials</li>
                                        <li>Commercial redistribution is prohibited without written consent</li>
                                        <li>You may not claim ownership of any provided materials</li>
                                        <li>Modification of source code is permitted for personal use only</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Prohibited Activities */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                                    <Ban className="h-6 w-6 text-red-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">5. Prohibited Activities</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>You agree not to engage in any of the following prohibited activities:</p>
                                    <ul className="ml-6 list-disc space-y-2 text-zinc-400">
                                        <li>Attempting to gain unauthorized access to our systems or databases</li>
                                        <li>Using automated scripts to access our services without permission</li>
                                        <li>Uploading malicious code or attempting to compromise our security</li>
                                        <li>Impersonating other users or {SITE_NAME} representatives</li>
                                        <li>Submitting false information or fraudulent requests</li>
                                        <li>Violating any applicable laws or regulations</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Limitation of Liability */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Shield className="h-6 w-6 text-blue-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">6. Limitation of Liability</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        To the fullest extent permitted by law, {SITE_NAME} shall not be liable for any indirect,
                                        incidental, special, consequential, or punitive damages arising from your use of the Service.
                                    </p>
                                    <ul className="ml-6 list-disc space-y-2 text-zinc-400">
                                        <li>We are not liable for trading losses incurred using our Expert Advisors</li>
                                        <li>We do not guarantee the accuracy or completeness of any information</li>
                                        <li>Services are provided "as is" without warranties of any kind</li>
                                        <li>We are not responsible for third-party broker issues or platform failures</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Updates and Changes */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">
                                    <RefreshCw className="h-6 w-6 text-cyan-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">7. Updates and Modifications</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        We reserve the right to modify or discontinue any aspect of our Service at any time without notice.
                                    </p>
                                    <ul className="ml-6 list-disc space-y-2 text-zinc-400">
                                        <li>Expert Advisors may be updated or removed without prior notice</li>
                                        <li>Features and functionality may change at our discretion</li>
                                        <li>We may modify these terms with notice posted on our website</li>
                                        <li>Continued use after modifications constitutes acceptance</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Governing Law */}
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                                    <Gavel className="h-6 w-6 text-brand" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">8. Governing Law</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        These Terms shall be governed by and construed in accordance with applicable laws.
                                        Any disputes shall be resolved through appropriate legal channels.
                                    </p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-8">
                                <h2 className="mb-4 text-2xl font-bold text-white">Questions?</h2>
                                <p className="text-zinc-300">
                                    If you have any questions about these Terms of Service, please contact us at{" "}
                                    <a href="mailto:support@forexfactory.cc" className="text-brand hover:underline">
                                        support@forexfactory.cc
                                    </a>{" "}
                                    or visit our{" "}
                                    <a href="/contact" className="text-brand hover:underline">
                                        Contact Page
                                    </a>.
                                </p>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
