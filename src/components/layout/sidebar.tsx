"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";
import { Wand2, Images, CreditCard } from "lucide-react";

const NAV = [
    { href: "/studio", label: "Stüdyo", icon: Wand2 },
    { href: "/gallery", label: "Galeri", icon: Images },
    { href: "/plans", label: "Planlar", icon: CreditCard },
] as const;

type Props = {
    userName: string;
};

export function Sidebar({ userName }: Props) {
    const pathname = usePathname();

    return (
        <aside
            className="hidden md:flex flex-col shrink-0 h-dvh"
            style={{
                width: 200,
                borderRight: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
            }}
        >
            {/* Logo */}
            <div
                className="flex items-center gap-2 px-4 shrink-0"
                style={{ height: 48, borderBottom: "1px solid var(--border)" }}
            >
                <Image src="/logo.png" alt="Jewelshot®" width={32} height={32} className="rounded" />
                <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                    Jewelshot®
                </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 px-2">
                <ul className="flex flex-col gap-1">
                    {NAV.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className="sidebar-link flex items-center gap-3 px-3 py-2 rounded-md transition-colors font-medium text-[13px]"
                                    style={{
                                        color: active ? "var(--text-primary)" : "var(--text-secondary)",
                                        backgroundColor: active ? "var(--bg-secondary)" : "transparent"
                                    }}
                                    data-active={active || undefined}
                                >
                                    <Icon size={16} />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Profile + Logout */}
            <div
                className="px-3 py-3 flex flex-col gap-2"
                style={{ borderTop: "1px solid var(--border)" }}
            >
                <div className="px-2 truncate text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {userName}
                </div>
                <form action={logoutAction}>
                    <button
                        type="submit"
                        className="sidebar-link w-full text-left cursor-pointer"
                    >
                        Çıkış Yap
                    </button>
                </form>
            </div>
        </aside>
    );
}
