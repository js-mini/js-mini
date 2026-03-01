"use client";

import Image from "next/image";
import { useState } from "react";
import { Copy, Check, Expand, X, Download, Share2 } from "lucide-react";
import type { GalleryImageRecord } from "@/lib/gallery/actions";

export function GalleryImage({ image, priority = false }: { image: GalleryImageRecord, priority?: boolean }) {
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
                className="relative w-full h-full overflow-hidden group cursor-pointer"
                style={{
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--bg-secondary)",
                    border: "1px solid var(--border)",
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={toggleFullscreen}
            >
                {/* Thumbnail Image */}
                <Image
                    src={image.thumbnail_url || image.output_image_url}
                    alt={image.output_image_url.split('/').pop()?.split('?')[0] || "Oluşturulan Görsel"}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    priority={priority}
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
                    style={{ backgroundColor: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
                    onClick={toggleFullscreen}
                >
                    {/* Action Bar */}
                    <div className="absolute top-4 right-4 sm:top-8 sm:right-8 flex items-center gap-3 z-[110]">
                        <button
                            type="button"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    const text = "Powered by Jewelshot®";
                                    const url = "https://jewelshot.app";
                                    let files: File[] = [];

                                    try {
                                        const res = await fetch(image.output_image_url);
                                        const blob = await res.blob();
                                        const file = new File([blob], `jewelshot_${image.id}.png`, { type: blob.type });
                                        files = [file];
                                    } catch (err) {
                                        console.error("Görsel bloba çevrilemedi.", err);
                                    }

                                    if (navigator.share) {
                                        const shareData: ShareData = { text, url };
                                        if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
                                            shareData.files = files;
                                        }
                                        await navigator.share(shareData);
                                    } else {
                                        // Fallback to copy link
                                        await navigator.clipboard.writeText(`${text}\n${url}`);
                                        alert("Bağlantı kopyalandı!");
                                    }
                                } catch (err) {
                                    console.error("Paylaşım hatası:", err);
                                }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors drop-shadow-md"
                            title="Paylaş"
                        >
                            <Share2 size={18} color="#fff" />
                        </button>
                        <button
                            type="button"
                            onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                    const res = await fetch(image.output_image_url);
                                    const blob = await res.blob();
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `jewelshot_${image.id}.png`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                } catch (err) {
                                    console.error("İndirme hatası:", err);
                                }
                            }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors drop-shadow-md"
                            title="İndir"
                        >
                            <Download size={18} color="#fff" />
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-red-500/80 transition-colors drop-shadow-md"
                            title="Kapat"
                        >
                            <X size={20} color="#fff" />
                        </button>
                    </div>

                    <div className="relative w-full h-[85vh] flex items-center justify-center pointer-events-none">
                        <Image
                            src={image.output_image_url}
                            alt="Tam Ekran"
                            fill
                            className="object-contain rounded-lg drop-shadow-2xl pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
