import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile Settings | Forex Factory",
    description: "Manage your Forex Factory account profile.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    // JSONLD: Private page
    return <>{children}</>;
}
