import Image from "next/image";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div
            className="min-h-dvh flex items-center justify-center px-4"
            style={{ backgroundColor: "var(--bg-primary)" }}
        >
            <div className="w-full max-w-[360px]">
                <div className="flex justify-center mb-8">
                    <Image
                        src="/logo.png"
                        alt="Jewelshot®"
                        width={48}
                        height={48}
                        className="rounded-lg"
                        priority
                    />
                </div>
                {children}
            </div>
        </div>
    );
}
