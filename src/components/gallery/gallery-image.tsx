"use client";

import Image from "next/image";
import { useState } from "react";
import { Copy, Check, Expand, X } from "lucide-react";
import type { GalleryImageRecord } from "@/lib/gallery/actions";

export function GalleryImage({ image }: { image: GalleryImageRecord }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleCopyPrompt = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(image.prompt_text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    return (
        <>
            <div
                className="relative w-full overflow-hidden group mb-4 cursor-pointer"
                style={{
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={toggleFullscreen}
            >
                {/* Image */}
                <Image
                    src={image.output_image_url}
                    alt={image.prompt_text || "Oluşturulan Görsel"}
                    width={400}
                    height={400}
                    className="w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    style={{ aspectRatio: "auto" }}
                />

                {/* Hover Overlay */}
                <div
                    className={`absolute inset-0 transition-opacity duration-300 flex flex-col justify-end p-4 ${isHovered ? "opacity-100" : "opacity-0"
                        }`}
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
                    }}
                >
                    {/* Filename Display */}
                    <div className="flex-1 flex items-end">
                        <span className="text-white text-xs font-medium opacity-90 truncate max-w-[70%] drop-shadow-md">
                            {image.output_image_url.split('/').pop()?.split('?')[0] || 'resim.png'}
                        </span>
                    </div>

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors active:scale-95 hover:bg-white/20"
                            style={{ backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(4px)" }}
                            title="Tam Ekran"
                        >
                            <Expand size={14} color="#fff" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Fullscreen Lightbox */}
            {isFullscreen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
                    style={{ backgroundColor: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
                    onClick={toggleFullscreen}
                >
                    <button
                        className="absolute top-4 right-4 sm:top-8 sm:right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        onClick={toggleFullscreen}
                    >
                        <X size={20} color="#fff" />
                    </button>
                    <img
                        src={image.output_image_url}
                        alt="Tam Ekran"
                        className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />

                </div>
            )}
        </>
    );
}
