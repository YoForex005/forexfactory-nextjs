import { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Create Your Account - Join the Forex Trading Community",
    description: "Sign up for a free account to download expert advisors, get real-time trading signals, and join thousands of professional traders.",
    alternates: {
        canonical: `${SITE_URL}/signup`,
    },
    robots: {
        index: true,
        follow: true,
    },
};

export default function SignupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
