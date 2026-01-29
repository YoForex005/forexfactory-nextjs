import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Search",
    description: "Search for the latest Forex Expert Advisors, signals, and trading indicators on ForexFactory.cc.",
    alternates: {
        canonical: `${SITE_URL}/search`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
