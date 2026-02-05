"use client";

import { motion, animate } from "framer-motion";
import { useEffect, useState, useRef } from "react";

interface CounterProps {
    value: number;
    suffix?: string;
    duration?: number;
}

function Counter({ value, suffix = "", duration = 2 }: CounterProps) {
    const [count, setCount] = useState(0);
    const countRef = useRef(0);

    useEffect(() => {
        const controls = animate(countRef.current, value, {
            duration,
            onUpdate: (latest) => {
                setCount(Math.floor(latest));
                countRef.current = latest;
            },
            ease: "easeOut",
        });
        return () => controls.stop();
    }, [value, duration]);

    return (
        <span>
            {count.toLocaleString()}
            {suffix}
        </span>
    );
}

interface StatsData {
    eaCount: number;
    userCount: number;
    downloadCount: number;
    winRate: number;
    userSuffix?: string;
    downloadSuffix?: string;
}

export function StatsSection({ stats }: { stats: StatsData }) {
    return (
        <section className="border-y border-white/10 bg-white/5 py-16">
            <div className="container mx-auto px-4">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-brand">
                            <Counter value={stats.eaCount} suffix="+" />
                        </div>
                        <div className="text-zinc-400">Expert Advisors</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-brand">
                            <Counter value={stats.userCount} suffix={stats.userSuffix || "K+"} />
                        </div>
                        <div className="text-zinc-400">Active Traders</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-brand">
                            <Counter value={stats.downloadCount} suffix={stats.downloadSuffix || "M+"} />
                        </div>
                        <div className="text-zinc-400">Downloads</div>
                    </div>
                    <div className="text-center">
                        <div className="mb-2 text-4xl font-bold text-brand">
                            <Counter value={stats.winRate} suffix="%" />
                        </div>
                        <div className="text-zinc-400">Success Rate</div>
                    </div>
                </div>
            </div>
        </section>
    );
}
