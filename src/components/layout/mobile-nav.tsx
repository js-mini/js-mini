"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Wand2, Images, BookOpen, CreditCard } from "lucide-react";
import { logoutAction } from "@/lib/auth/actions";

const NAV = [
    { href: "/studio", label: "Stüdyo", icon: Wand2 },
    { href: "/gallery", label: "Galeri", icon: Images },
    { href: "/plans", label: "Planlar", icon: CreditCard },
    { href: "/usage", label: "Kullanım", icon: BookOpen },
] as const;

type Props = {
    userName: string;
};

export function MobileNav({ userName }: Props) {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    const closeNav = () => setIsOpen(false);

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 -ml-2 rounded-md transition-colors hover:bg-[var(--hover)]"
                aria-label="Menüyü Aç"
            >
                <Menu size={20} style={{ color: "var(--text-primary)" }} />
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={closeNav}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out flex flex-col`}
                style={{
                    backgroundColor: "var(--bg-primary)",
                    borderRight: "1px solid var(--border)",
                    transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                }}
            >
                {/* Header Logo + Close */}
                <div
                    className="flex items-center justify-between px-4 shrink-0"
                    style={{ height: 48, borderBottom: "1px solid var(--border)" }}
                >
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Jewelshot" width={32} height={32} className="rounded" />
                        <span className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                            Jewelshot&reg;
                        </span>
                    </div>

                    <button
                        onClick={closeNav}
                        className="p-2 -mr-2 rounded-md transition-colors hover:bg-[var(--hover)]"
                        aria-label="Menüyü Kapat"
                    >
                        <X size={20} style={{ color: "var(--text-primary)" }} />
                    </button>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 py-4 px-3 overflow-y-auto">
                    <ul className="flex flex-col gap-2">
                        {NAV.map((item) => {
                            const active = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={closeNav}
                                        className="sidebar-link px-3 py-2 rounded-md flex items-center gap-3 font-medium text-[13px]"
                                        data-active={active || undefined}
                                        style={{
                                            color: active ? "var(--text-primary)" : "var(--text-secondary)",
                                            backgroundColor: active ? "var(--hover)" : "transparent",
                                        }}
                                    >
                                        <Icon size={16} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Profile & Logout */}
                <div
                    className="px-4 py-4 flex flex-col gap-3"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <div className="px-1 truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {userName}
                    </div>
                    <form action={logoutAction} onSubmit={closeNav}>
                        <button
                            type="submit"
                            className="sidebar-link w-full text-left cursor-pointer px-3 py-2 rounded-md text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
                        >
                            Çıkış Yap
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
