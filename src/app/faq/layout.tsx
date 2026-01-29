import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about our Expert Advisors, trading tools, and services. Master algorithmic trading with ForexFactory.cc.",
    alternates: {
        canonical: `${SITE_URL}/faq`,
    },
    robots: {
        index: true,
        follow: true,
    },
    openGraph: {
        title: `Frequently Asked Questions | ${SITE_NAME}`,
        description: "Find answers to common questions about our Expert Advisors, trading tools, and services.",
        type: "website",
    },
};

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
