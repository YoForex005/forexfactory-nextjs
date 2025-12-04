"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart, 
  LogOut, 
  Download,
  FolderOpen,
  Image as ImageIcon,
  LucideIcon,
  Search,
  TrendingUp
} from "lucide-react";

interface SidebarItemProps {
  item: {
    title: string;
    href: string;
    icon: LucideIcon;
  };
}

function SidebarItem({ item }: SidebarItemProps) {
  const pathname = usePathname();
  // More robust active state detection for nested routes
  const isActive = pathname === item.href || 
                   (item.href !== "/admin/dashboard" && pathname?.startsWith(`${item.href}/`)) ||
                   (item.href === "/admin/dashboard" && pathname === "/admin/dashboard");

  return (
    <Link
      href={item.href}
      className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
        isActive 
          ? "bg-brand text-white shadow-lg shadow-brand/20" 
          : "text-zinc-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-zinc-500"}`} />
      {item.title}
    </Link>
  );
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Blog Posts",
    href: "/admin/blog",
    icon: FileText
  },
  {
    title: "Signals/EAs",
    href: "/admin/signals",
    icon: Download
  },
  {
    title: "SEO Manager",
    href: "/admin/seo",
    icon: Search
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: TrendingUp
  },
  {
    title: "Media Library",
    href: "/admin/media",
    icon: ImageIcon
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
];

export function AdminSidebar() {
  // In a server component layout, we can't use usePathname directly if this is a server component.
  // But Sidebar is usually client interactive. We'll make it a client component if needed.
  // For now, let's export it as a standard component and handle active state if we can, 
  // or make it "use client".
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-surface-50">
      <div className="flex h-16 items-center border-b border-white/10 px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <span className="text-brand">Forex</span>Factory
        </Link>
      </div>

      <div className="flex h-[calc(100vh-4rem)] flex-col justify-between p-4">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.href} item={item} />
          ))}
        </nav>

        <div className="border-t border-white/10 pt-4">
          <button 
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
