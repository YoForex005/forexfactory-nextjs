import { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Shield, Lock, Eye, Database, Users, Mail } from "lucide-react";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, generateWebPageSchema } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Privacy Policy - Data Protection & User Privacy Information",
    description: "Learn how ForexFactory.cc collects, uses, and protects your personal information. Read our comprehensive privacy policy.",
    openGraph: {
        title: `Privacy Policy | ${SITE_NAME}`,
        description: "Learn how ForexFactory.cc collects, uses, and protects your personal information.",
        type: 'website',
    },
    alternates: {
        canonical: `${SITE_URL}/privacy`,
    },
    robots: {
        index: true,
        follow: true,
    },
    twitter: {
        card: "summary_large_image",
        title: `Privacy Policy | ${SITE_NAME}`,
        description: "Learn how ForexFactory.cc collects, uses, and protects your personal information.",
        images: [DEFAULT_OG_IMAGE],
    }
};

export default function PrivacyPolicyPage() {
    const lastUpdated = "December 31, 2024";

    const jsonLd = generateWebPageSchema({
        title: "Privacy Policy | " + SITE_NAME,
        description: "Learn how " + SITE_NAME + " collects, uses, and protects your personal information.",
        url: `${SITE_URL}/privacy`,
        datePublished: "2024-01-01",
        dateModified: "2024-12-31"
    });

    return (
        <div className="flex min-h-screen flex-col">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Navbar />

            <main className="flex-1 bg-surface-100">
                {/* Hero Section */}
                <section className="relative overflow-hidden bg-gradient-to-br from-brand/20 via-purple-500/20 to-surface-100 py-20">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                                <Shield className="h-8 w-8 text-brand" />
                            </div>
                            <div className="max-w-3xl">
                                <h1 className="mb-6 text-5xl font-bold leading-tight text-white">
                                    Privacy Policy
                                </h1>
                                <p className="text-xl text-zinc-300">
                                    Your privacy is important to us. This policy explains how we collect, use, and protect your information.
                                </p>
                                <p className="mt-4 text-sm text-zinc-400">
                                    Last updated: {lastUpdated}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="mx-auto max-w-4xl space-y-12">

                            {/* Information Collection */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                                    <Database className="h-6 w-6 text-brand" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">Information We Collect</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>We collect information you provide directly to us, including:</p>
                                    <ul className="ml-6 flex flex-col items-center space-y-2 text-zinc-400">
                                        <li className="list-inside"><strong className="text-zinc-300">Account Information:</strong> When you register, we collect your name, email address, and password.</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Contact Information:</strong> When you contact us, we collect your name, email, and message content.</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Usage Data:</strong> Information about how you interact with our services, including downloads and pages visited.</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Device Information:</strong> Browser type, operating system, and IP address for analytics purposes.</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Use of Information */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                    <Eye className="h-6 w-6 text-emerald-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">How We Use Your Information</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>We use the information we collect to:</p>
                                    <ul className="ml-6 flex flex-col items-center space-y-2 text-zinc-400">
                                        <li className="list-inside">Provide, maintain, and improve our services</li>
                                        <li className="list-inside">Send you technical notices, updates, and support messages</li>
                                        <li className="list-inside">Respond to your comments, questions, and requests</li>
                                        <li className="list-inside">Monitor and analyze trends, usage, and activities</li>
                                        <li className="list-inside">Detect, investigate, and prevent fraudulent transactions and abuse</li>
                                        <li className="list-inside">Personalize your experience and provide tailored content</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Cookies */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                                    <Lock className="h-6 w-6 text-purple-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">Cookies and Tracking</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        We use cookies and similar tracking technologies to collect and track information about your browsing activities.
                                        Cookies are small data files stored on your device.
                                    </p>
                                    <p className="text-zinc-400">
                                        <strong className="text-zinc-300">Types of cookies we use:</strong>
                                    </p>
                                    <ul className="ml-6 flex flex-col items-center space-y-2 text-zinc-400">
                                        <li className="list-inside"><strong className="text-zinc-300">Essential Cookies:</strong> Required for the website to function properly</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Analytics Cookies:</strong> Help us understand how visitors use our site</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Preference Cookies:</strong> Remember your settings and preferences</li>
                                    </ul>
                                    <p className="text-zinc-400">
                                        You can control cookies through your browser settings. Note that disabling cookies may affect site functionality.
                                    </p>
                                </div>
                            </div>

                            {/* Third-Party Services */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                                    <Users className="h-6 w-6 text-blue-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">Third-Party Services</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        We may share your information with third-party service providers that help us operate our website and deliver services:
                                    </p>
                                    <ul className="ml-6 flex flex-col items-center space-y-2 text-zinc-400">
                                        <li className="list-inside"><strong className="text-zinc-300">Analytics Providers:</strong> To understand site usage and improve our services</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Hosting Providers:</strong> To store and serve our website content</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Email Services:</strong> To send newsletters and notifications if you opt in</li>
                                    </ul>
                                    <p className="text-zinc-400">
                                        We do not sell your personal information to third parties.
                                    </p>
                                </div>
                            </div>

                            {/* Data Security */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/10">
                                    <Shield className="h-6 w-6 text-yellow-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">Data Security</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        We implement appropriate technical and organizational measures to protect your personal information, including:
                                    </p>
                                    <ul className="ml-6 flex flex-col items-center space-y-2 text-zinc-400">
                                        <li className="list-inside">SSL/TLS encryption for data in transit</li>
                                        <li className="list-inside">Encrypted storage for sensitive data</li>
                                        <li className="list-inside">Regular security audits and updates</li>
                                        <li className="list-inside">Access controls and authentication measures</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Your Rights */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10">
                                    <Users className="h-6 w-6 text-red-400" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">Your Rights</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>You have the following rights regarding your personal data:</p>
                                    <ul className="ml-6 flex flex-col items-center space-y-2 text-zinc-400">
                                        <li className="list-inside"><strong className="text-zinc-300">Access:</strong> Request a copy of your personal data</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Correction:</strong> Request correction of inaccurate data</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Deletion:</strong> Request deletion of your data</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Portability:</strong> Request a machine-readable copy of your data</li>
                                        <li className="list-inside"><strong className="text-zinc-300">Objection:</strong> Object to processing of your data</li>
                                    </ul>
                                    <p className="text-zinc-400">
                                        To exercise these rights, please contact us at the email address below.
                                    </p>
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                                    <Mail className="h-6 w-6 text-brand" />
                                </div>
                                <h2 className="mb-4 text-2xl font-bold text-white">Contact Us</h2>
                                <div className="space-y-4 text-zinc-300">
                                    <p>
                                        If you have any questions about this Privacy Policy or our data practices, please contact us:
                                    </p>
                                    <p className="text-zinc-400">
                                        Email: <a href="mailto:support@forexfactory.cc" className="text-brand hover:underline">support@forexfactory.cc</a>
                                    </p>
                                    <p className="text-zinc-400">
                                        Or use our <a href="/contact" className="text-brand hover:underline">Contact Form</a>
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
