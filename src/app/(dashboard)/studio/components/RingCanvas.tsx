// RingCanvas — single-image canvas for the "Yüzük" category.
// Contains the two hidden file inputs (gallery + camera), the drag-and-drop
// upload zone, and the side-by-side "Original | Generated" result view.
//
// JSX taken verbatim from studio-client.tsx:
//   Hidden inputs: L547-563
//   Ring canvas block: L565-727 (yuzuk branch)

import { X, Image as ImageIcon, Share2, Download, Camera, Loader2 } from "lucide-react";
import type { GenerateResult } from "@/lib/studio/actions";

type RingCanvasProps = {
    // Preview / file state
    preview: string | null;
    fileName: string;
    outputFormat: string;
    isDragging: boolean;
    isPending: boolean;
    statusText: string;
    result: GenerateResult;

    // Refs
    fileRef: React.RefObject<HTMLInputElement | null>;
    cameraRef: React.RefObject<HTMLInputElement | null>;

    // Callbacks
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClearImage: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onClearResult: () => void;
};

export function RingCanvas({
    preview,
    fileName,
    outputFormat,
    isDragging,
    isPending,
    statusText,
    result,
    fileRef,
    cameraRef,
    onFileChange,
    onClearImage,
    onDragOver,
    onDragLeave,
    onDrop,
    onClearResult,
}: RingCanvasProps) {
    return (
        <>
            {/* Hidden file inputs */}
            <input
                ref={fileRef}
                name="image"
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
            />
            <input
                ref={cameraRef}
                name="camera"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={onFileChange}
                className="hidden"
            />

            {preview ? (
                <>
                    {/* Original */}
                    <div className="relative flex flex-col items-center gap-2 max-w-[45%]">
                        <div className="relative group">
                            <img
                                src={preview}
                                alt="Orijinal"
                                className="max-h-[50vh] max-w-full object-contain"
                                style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
                            />
                            <button
                                type="button"
                                onClick={onClearImage}
                                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>
                            Orijinal
                        </span>
                    </div>

                    {/* Generated */}
                    {result.outputUrl ? (
                        <div className="flex flex-col items-center gap-2 max-w-[45%]">
                            <div className="relative group">
                                <img
                                    src={result.outputUrl}
                                    alt="Üretilen"
                                    className="max-h-[50vh] max-w-full object-contain"
                                    style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
                                />
                                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            try {
                                                if (navigator.share) {
                                                    await navigator.share({
                                                        title: "Jewelshot® Görseli",
                                                        text: "Jewelshot® Stüdyo ile oluşturduğum tasarıma göz atın!",
                                                        url: result.outputUrl!
                                                    });
                                                } else {
                                                    await navigator.clipboard.writeText(result.outputUrl!);
                                                    alert("Bağlantı kopyalandı!");
                                                }
                                            } catch (err) {
                                                console.error("Paylaşım hatası:", err);
                                            }
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
                                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                        title="Paylaş"
                                    >
                                        <Share2 size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            const res = await fetch(result.outputUrl!);
                                            const blob = await res.blob();
                                            const a = document.createElement("a");
                                            a.href = URL.createObjectURL(blob);
                                            const base = fileName.replace(/\.[^.]+$/, "");
                                            a.download = `${base}_edited.${outputFormat}`;
                                            a.click();
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
                                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                        title="İndir"
                                    >
                                        <Download size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onClearResult}
                                        className="w-7 h-7 flex items-center justify-center rounded-full cursor-pointer"
                                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                        title="Kapat"
                                    >
                                        <X size={13} />
                                    </button>
                                </div>
                            </div>
                            <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--success)" }}>
                                Üretilen
                            </span>
                        </div>
                    ) : isPending ? (
                        <div
                            className="flex flex-col items-center justify-center gap-3"
                            style={{
                                width: 300,
                                height: 300,
                                borderRadius: "var(--radius-md)",
                                border: "1px dashed var(--border)",
                                backgroundColor: "var(--bg-secondary)",
                            }}
                        >
                            <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-tertiary)" }} />
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                                {statusText}
                            </span>
                        </div>
                    ) : null}
                </>
            ) : (
                /* Drop zone */
                <div
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className="w-full max-w-md flex flex-col items-center justify-center gap-4 py-16 transition-colors"
                    style={{
                        borderRadius: "var(--radius-lg)",
                        border: `2px dashed ${isDragging ? "var(--text-secondary)" : "var(--border)"}`,
                        backgroundColor: isDragging ? "var(--bg-secondary)" : "transparent",
                    }}
                >
                    <div className="flex w-full gap-4 px-8">
                        <button
                            type="button"
                            onClick={() => fileRef.current?.click()}
                            className="flex-1 flex flex-col items-center justify-center gap-3 p-6 transition-colors hover:bg-[var(--bg-secondary)]"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <ImageIcon size={24} style={{ color: "var(--text-tertiary)" }} />
                            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Dosya Seç</span>
                            <span className="text-[10px] text-center" style={{ color: "var(--text-tertiary)", marginTop: -4 }}>veya sürükle bırak</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => cameraRef.current?.click()}
                            className="flex-1 flex flex-col items-center justify-center gap-3 p-6 transition-colors hover:bg-[var(--bg-secondary)]"
                            style={{
                                borderRadius: "var(--radius-md)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <Camera size={24} style={{ color: "var(--text-tertiary)" }} />
                            <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Fotoğraf Çek</span>
                            <span className="text-[10px] text-center" style={{ color: "var(--text-tertiary)", marginTop: -4 }}>Kamerayı açar</span>
                        </button>
                    </div>

                    <div className="text-center mt-2">
                        <p className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
                            PNG, JPG, WEBP — maks. 20MB
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
