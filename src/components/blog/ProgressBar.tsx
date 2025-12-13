"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight =
                document.documentElement.scrollHeight -
                document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;

            setProgress(Number(scroll));
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed left-0 top-0 z-50 h-1 w-full bg-transparent">
            <div
                className="h-full bg-brand transition-all duration-150 ease-out"
                style={{ width: `${progress * 100}%` }}
            />
        </div>
    );
}
