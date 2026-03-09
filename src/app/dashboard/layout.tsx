import { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import { ReactNode } from "react";

export const metadata: Metadata = {
    title: "Dashboard | Forex Factory",
    description: "Your Forex Factory Dashboard",
};

export default function Layout({ children }: { children: ReactNode }) {
    // JSONLD: Private page
    return <ClientLayout>{children}</ClientLayout>;
}
