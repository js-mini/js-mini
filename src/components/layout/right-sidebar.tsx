"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export function RightSidebar() {
    return (
        <aside
            className="hidden md:flex flex-col shrink-0 h-dvh"
            style={{
                width: 220,
                borderLeft: "1px solid var(--border)",
                backgroundColor: "var(--bg-primary)",
            }}
        >
            <div id="right-sidebar-content" className="flex flex-col h-full" />
        </aside>
    );
}

export function RightSidebarPortal({ children }: { children: ReactNode }) {
    const [container, setContainer] = useState<HTMLElement | null>(null);

    useEffect(() => {
        setContainer(document.getElementById("right-sidebar-content"));
    }, []);

    if (!container) return null;
    return createPortal(children, container);
}
