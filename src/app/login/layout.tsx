import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Log in | ForexFactory",
    description: "Log in to your ForexFactory account",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
