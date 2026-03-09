import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Settings | Forex Factory",
    description: "Manage your Forex Factory account settings and preferences.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    // JSONLD: Private page
    return <>{children}</>;
}
