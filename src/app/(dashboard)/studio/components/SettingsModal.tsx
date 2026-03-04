// SettingsModal — generation settings panel.
// JSX taken verbatim from studio-client.tsx lines 555-674.
// Props replace local state references; zero logic changes.

import { X } from "lucide-react";
import {
    CATEGORIES, METAL_COLORS, ASPECT_RATIOS, RESOLUTIONS, FORMATS,
} from "./constants";
import { Chip } from "./Chip";

type SettingsModalProps = {
    open: boolean;
    onClose: () => void;

    // Current values
    category: typeof CATEGORIES[number]["value"];
    engravingText: string;
    metalColor: typeof METAL_COLORS[number]["value"];
    aspectRatio: string;
    resolution: typeof RESOLUTIONS[number]["value"];
    outputFormat: typeof FORMATS[number]["value"];

    // Setters
    setEngravingText: (v: string) => void;
    setMetalColor: (v: typeof METAL_COLORS[number]["value"]) => void;
    setAspectRatio: (v: string) => void;
    setResolution: (v: typeof RESOLUTIONS[number]["value"]) => void;
    setOutputFormat: (v: typeof FORMATS[number]["value"]) => void;
};

export function SettingsModal({
    open,
    onClose,
    category,
    engravingText,
    metalColor,
    aspectRatio,
    resolution,
    outputFormat,
    setEngravingText,
    setMetalColor,
    setAspectRatio,
    setResolution,
    setOutputFormat,
}: SettingsModalProps) {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
            style={{ backgroundColor: "var(--bg-overlay)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-sm flex flex-col max-h-[90dvh] overflow-hidden"
                style={{
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal header */}
                <div
                    className="flex items-center justify-between px-5 shrink-0"
                    style={{ height: 48, borderBottom: "1px solid var(--border)" }}
                >
                    <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                        Ayarlar
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70 rounded-md hover:bg-[var(--bg-secondary)]"
                        style={{ color: "var(--text-tertiary)" }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Modal body */}
                <div className="px-5 py-4 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                    {/* Engraving — only for rings */}
                    {category === "yuzuk" && (
                        <div className="flex flex-col gap-2">
                            <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-tertiary)" }}>Yazı</span>
                            <input
                                type="text"
                                value={engravingText}
                                onChange={(e) => setEngravingText(e.target.value)}
                                placeholder="Yüzük içi metin (opsiyonel)"
                                className="w-full px-3 py-2 text-[13px] outline-none transition-colors focus:ring-1 focus:ring-[var(--text-primary)]"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    backgroundColor: "var(--bg-secondary)",
                                    border: "1px solid var(--border)",
                                    color: "var(--text-primary)",
                                }}
                                maxLength={30}
                            />
                            {engravingText && (
                                <span className="text-[10px] text-right" style={{ color: "var(--text-tertiary)" }}>
                                    {engravingText.length}/30
                                </span>
                            )}
                        </div>
                    )}

                    {/* Metal Color */}
                    <div className="flex flex-col gap-2">
                        <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-tertiary)" }}>Metal Rengi</span>
                        <div className="flex flex-wrap gap-1.5">
                            {METAL_COLORS.map((mc) => (
                                <Chip key={mc.value} label={mc.label.split("(")[0].trim()} active={metalColor === mc.value} onClick={() => setMetalColor(mc.value)} />
                            ))}
                        </div>
                    </div>

                    {/* Aspect Ratio */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Oran</span>
                        <div className="flex flex-wrap gap-1">
                            {ASPECT_RATIOS.map((ar) => (
                                <Chip key={ar.value} label={ar.label} active={aspectRatio === ar.value} onClick={() => setAspectRatio(ar.value)} />
                            ))}
                        </div>
                    </div>

                    {/* Resolution */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Çözünürlük</span>
                        <div className="flex flex-wrap gap-1">
                            {RESOLUTIONS.map((r) => (
                                <Chip key={r.value} label={r.label} active={resolution === r.value} onClick={() => setResolution(r.value)} />
                            ))}
                        </div>
                    </div>

                    {/* Format */}
                    <div className="flex flex-col gap-1.5">
                        <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Format</span>
                        <div className="flex flex-wrap gap-1">
                            {FORMATS.map((f) => (
                                <Chip key={f.value} label={f.label} active={outputFormat === f.value} onClick={() => setOutputFormat(f.value)} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Modal footer */}
                <div
                    className="px-5 py-3 flex justify-end"
                    style={{ borderTop: "1px solid var(--border)" }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="btn-primary w-auto px-6"
                    >
                        Tamam
                    </button>
                </div>
            </div>
        </div>
    );
}
