"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
    "/studio": "Stüdyo",
    "/gallery": "Galeri",
    "/plans": "Planlar",
    "/usage": "Kullanım",
};

type Props = {
    credits: number;
};

export function Header({ credits }: Props) {
    const pathname = usePathname();
    const title = PAGE_TITLES[pathname] || "";

    return (
        <header
            className="flex items-center justify-between px-6"
            style={{
                height: 48,
                borderBottom: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
            }}
        >
            <span
                className="text-sm font-medium shrink-0"
                style={{ color: "var(--text-primary)" }}
            >
                {title}
            </span>

            {/* Portal container for middle header content (like category tabs) */}
            <div id="header-center-portal" className="flex-1 flex justify-center ml-4 mr-4" />

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
