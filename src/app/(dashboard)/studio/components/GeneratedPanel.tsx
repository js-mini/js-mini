// GeneratedPanel — shows either the generated image (with share/download/close
// actions) or a pending spinner. Used by NecklaceCanvas, EarringCanvas, and
// BraceletCanvas — the three categories whose result area is structurally
// identical. RingCanvas uses its own layout (side-by-side original + generated)
// and is intentionally excluded.
//
// JSX is taken verbatim from:
//   Necklace: studio-client.tsx L1042-1138
//   Earring:  studio-client.tsx L1214-1308
//   Bracelet: studio-client.tsx L1385-1479
// Differences parameterised via props below.

import { Share2, Download, X, Loader2 } from "lucide-react";

type GeneratedPanelProps = {
    // Generated image URL — render image + action buttons when truthy
    outputUrl: string;
    outputFormat: string;

    // Download filename stem, e.g. "necklace_edited", "earring_edited"
    downloadFilename: string;

    // Label below the generated image, e.g. "Üretilen", "Küpeler Üretildi"
    successLabel: string;

    // Called when the user clicks the close (×) button
    onClose: () => void;

    // Size variants — necklace uses w-7/size-13; earring/bracelet use w-8/size-14
    iconSize?: number;   // default 13
    btnClass?: string;   // default "w-7 h-7"
};

type PendingPanelProps = {
    statusText: string;
    // Fallback text when statusText is empty, e.g. "Küpeler oluşturuluyor..."
    fallbackText?: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// GeneratedImage — the image + share/download/close overlay
// ─────────────────────────────────────────────────────────────────────────────
export function GeneratedPanel({
    outputUrl,
    outputFormat,
    downloadFilename,
    successLabel,
    onClose,
    iconSize = 13,
    btnClass = "w-7 h-7",
}: GeneratedPanelProps) {
    const handleShare = async () => {
        try {
            const text = "Powered by Jewelshot®";
            const url = "https://jewelshot.app";
            let files: File[] = [];

            try {
                const res = await fetch(outputUrl);
                const blob = await res.blob();
                const file = new File([blob], `${downloadFilename}.${outputFormat}`, { type: blob.type });
                files = [file];
            } catch (e) {
                console.error("Görsel bloba çevrilemedi.", e);
            }

            if (navigator.share) {
                const shareData: ShareData = { text, url };
                if (files.length > 0 && navigator.canShare && navigator.canShare({ files })) {
                    shareData.files = files;
                }
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(`${text}\n${url}`);
                alert("Bağlantı kopyalandı!");
            }
        } catch (err) {
            console.error("Paylaşım hatası:", err);
        }
    };

    const handleDownload = async () => {
        const res = await fetch(outputUrl);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${downloadFilename}.${outputFormat}`;
        a.click();
    };

    return (
        <div className="flex flex-col items-center gap-2 max-w-full">
            <div className="relative group">
                <img
                    src={outputUrl}
                    alt="Üretilen"
                    className="max-h-[60vh] max-w-full object-contain"
                    style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
                />
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        type="button"
                        onClick={handleShare}
                        className={`${btnClass} flex items-center justify-center rounded-full cursor-pointer shadow-md`}
                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                        title="Paylaş"
                    >
                        <Share2 size={iconSize} />
                    </button>
                    <button
                        type="button"
                        onClick={handleDownload}
                        className={`${btnClass} flex items-center justify-center rounded-full cursor-pointer shadow-md`}
                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                        title="İndir"
                    >
                        <Download size={iconSize} />
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className={`${btnClass} flex items-center justify-center rounded-full cursor-pointer shadow-md`}
                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                        title="Kapat"
                    >
                        <X size={iconSize} />
                    </button>
                </div>
            </div>
            <span
                className="text-[11px] uppercase tracking-wider"
                style={{ color: "var(--success)" }}
            >
                {successLabel}
            </span>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// PendingPanel — spinner + status text while generation is in progress
// ─────────────────────────────────────────────────────────────────────────────
export function PendingPanel({ statusText, fallbackText }: PendingPanelProps) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-3 shadow-sm"
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
                {statusText || fallbackText}
            </span>
        </div>
    );
}
