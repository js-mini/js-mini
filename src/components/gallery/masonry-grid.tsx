"use client";

import type { GalleryImageRecord } from "@/lib/gallery/actions";
import { GalleryImage } from "./gallery-image";

export function MasonryGrid({ images }: { images: GalleryImageRecord[] }) {
    if (!images || images.length === 0) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-2"
                    style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-tertiary)" }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>
                    Henüz görsel üretmediniz
                </h3>
                <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
                    Stüdyo'da ürettiğiniz tasarımlar otomatik olarak bu galeride sergilenecektir.
                </p>
                <a
                    href="/studio"
                    className="btn-primary mt-2 px-6 py-2 block w-fit"
                >
                    Stüdyoya Git
                </a>
            </div>
        );
    }

    // Split images into columns based on screen size (CSS handles this, but column grouping in React is cleaner for Masonry)
    // For true Masonry in React without a heavy library, we break the array into columns arrays.

    // We'll use a responsive CSS column approach instead of JS arrays to prevent hydration mismatches
    return (
        <div className="w-full h-full p-4 sm:p-6 md:p-8 overflow-y-auto no-scrollbar">
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 space-y-4">
                {images.map((img) => (
                    <div key={img.id} className="break-inside-avoid">
                        <GalleryImage image={img} />
                    </div>
                ))}
            </div>
        </div>
    );
}
