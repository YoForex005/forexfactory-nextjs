import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Saved Articles | Forex Factory",
    description: "View your saved Forex Factory articles.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    // JSONLD: Private page
    return <>{children}</>;
}
