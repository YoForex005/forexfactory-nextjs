import { Metadata } from "next";
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Contact Us - Support for Expert Advisors & Trading Tools",
    description: "Get in touch with our support team for any questions about our Expert Advisors, indicators, or trading systems.",
    openGraph: {
        title: `Contact Us | ${SITE_NAME}`,
        description: "Get in touch with our support team for any questions about our Expert Advisors, indicators, or trading systems.",
        url: `${SITE_URL}/contact`,
        siteName: SITE_NAME,
        images: [
            {
                url: DEFAULT_OG_IMAGE,
                width: 1200,
                height: 630,
                alt: "Contact Us",
            },
        ],
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: `Contact Us | ${SITE_NAME}`,
        description: "Get in touch with our support team for any questions about our Expert Advisors, indicators, or trading systems.",
        images: [DEFAULT_OG_IMAGE],
    },
    alternates: {
        canonical: `${SITE_URL}/contact`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
