"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Download,
    Bookmark,
    User,
    Settings,
    LogOut,
    ChevronRight,
    X,
    Home
} from "lucide-react";
import { logout } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const sidebarLinks = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/downloads", label: "My Downloads", icon: Download },
    { href: "/dashboard/saved", label: "Saved Articles", icon: Bookmark },
    { href: "/dashboard/profile", label: "Profile", icon: User },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
    userName: string | null;
    userEmail: string | null;
    isOpen?: boolean;
    onClose?: () => void;
}

export function DashboardSidebar({ userName, userEmail, isOpen, onClose }: DashboardSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push("/");
        router.refresh();
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 z-50 h-screen w-64 bg-[#0d0d14] border-r border-white/10 transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Logo & Close Button */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <span className="text-brand">Forex</span>Factory
                    </Link>
                    <button
                        onClick={onClose}
                        className="lg:hidden text-zinc-400 hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold text-lg leading-none">
                            {userName?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{userName || "User"}</p>
                            <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {sidebarLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={onClose} // Close sidebar on mobile nav click
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${isActive
                                    ? "bg-brand/10 text-brand border border-brand/20"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {link.label}
                                {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* Back to Site & Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-1">
                    <Link
                        href="/"
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <Home className="h-5 w-5" />
                        Back to Site
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
