"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { isLoggedIn, getUser } from "@/lib/auth-client";
import { Loader2, Menu } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        if (!isLoggedIn()) {
            router.push("/login?from=/dashboard");
            return;
        }

        const user = getUser();
        setUserName(user?.name || null);
        setUserEmail(user?.email || null);
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto" />
                    <p className="mt-4 text-zinc-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f]">
            {/* Mobile Header */}
            <div className="lg:hidden sticky top-0 z-30 bg-[#0d0d14]/80 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight text-white">
                    <span className="text-brand">Forex</span>Factory
                </Link>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Sidebar */}
            <DashboardSidebar
                userName={userName}
                userEmail={userEmail}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen transition-all duration-300">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
