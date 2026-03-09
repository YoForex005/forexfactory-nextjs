import { Metadata } from "next";

export const metadata: Metadata = {
    title: "My Downloads | Forex Factory",
    description: "Manage your downloaded EA files and indicators.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
    // JSONLD: Private page
    return <>{children}</>;
}
