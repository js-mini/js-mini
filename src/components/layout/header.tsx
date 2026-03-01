"use client";

import { usePathname } from "next/navigation";

import { MobileNav } from "./mobile-nav";

const PAGE_TITLES: Record<string, string> = {
    "/studio": "Stüdyo",
    "/gallery": "Galeri",
    "/plans": "Planlar",
    "/usage": "Kullanım",
};

type Props = {
    credits: number;
    userName?: string;
};

export function Header({ credits, userName = "Kullanıcı" }: Props) {
    const pathname = usePathname();
    const title = PAGE_TITLES[pathname] || "";

    return (
        <header
            className="flex items-center justify-between px-4 md:px-6 gap-3"
            style={{
                height: 48,
                borderBottom: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
            }}
        >
            <div className="flex items-center gap-2 shrink-0">
                <MobileNav userName={userName} />
                <span
                    className="hidden sm:inline-block text-sm font-medium truncate"
                    style={{ color: "var(--text-primary)" }}
                >
                    {title}
                </span>
            </div>

            {/* Portal container for middle header content (like category tabs) */}
            <div id="header-center-portal" className="flex-1 flex justify-center min-w-0 mx-1 sm:mx-2" />

            <div
                className="text-[13px] px-3 py-1 rounded-full"
                style={{
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border)",
                }}
            >
                {credits} kredi
            </div>
        </header>
    );
}
