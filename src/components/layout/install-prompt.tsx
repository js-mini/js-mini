"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { DownloadCloud, X } from "lucide-react";

export function InstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        // 1. Manually register the Service Worker to fulfill PWA requirements
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then((reg) => console.log('Service Worker registered', reg.scope))
                .catch((err) => console.error('Service Worker registration failed', err));
        }

        // 2. Listen for the install prompt event
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsInstallable(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setIsInstallable(false);
        }
        // We no longer need the prompt. Clear it up.
        setDeferredPrompt(null);
    };

    if (!isInstallable || isDismissed) return null;

    return (
        <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 z-[9999] p-4 rounded-xl shadow-2xl flex items-center justify-between gap-4 border border-white/10 bg-zinc-900/95 backdrop-blur-md">
            <button
                onClick={() => setIsDismissed(true)}
                className="absolute -top-2 -right-2 bg-zinc-800 text-zinc-400 hover:text-white rounded-full p-1 border border-white/10 shadow-sm"
                aria-label="Kapat"
            >
                <X size={14} />
            </button>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden relative border border-white/10 bg-black">
                    <Image
                        src="/logo.png"
                        alt="Jewelshot Logo"
                        fill
                        className="object-contain p-1"
                    />
                </div>
                <div className="flex flex-col">
                    <h4 className="text-sm font-semibold text-white">Uygulamayı İndir</h4>
                    <p className="text-xs text-zinc-400">Jewelshot®'u ana ekranınıza ekleyin.</p>
                </div>
            </div>
            <button
                onClick={handleInstallClick}
                className="px-4 py-2 bg-[#f3b820] text-black text-xs font-semibold rounded-lg hover:bg-[#d9a21b] transition-colors whitespace-nowrap"
            >
                Yükle
            </button>
        </div>
    );
}
