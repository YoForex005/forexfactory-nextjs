import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: "up" | "down" | "neutral";
}

export function StatsCard({ title, value, icon: Icon, description }: StatsCardProps) {
    return (
        <div className="bg-[#0d0d14] rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-zinc-400">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                    {description && (
                        <p className="mt-1 text-xs text-zinc-500">{description}</p>
                    )}
                </div>
                <div className="rounded-lg bg-brand/10 p-3">
                    <Icon className="h-6 w-6 text-brand" />
                </div>
            </div>
        </div>
    );
}
