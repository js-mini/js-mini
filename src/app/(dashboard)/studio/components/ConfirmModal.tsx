// ConfirmModal — generation confirmation dialog.
// JSX taken verbatim from studio-client.tsx lines 518-611.
// Props replace local state references; zero logic changes.
//
// Design note: `selectedPromptName` and `metalColorLabel` are pre-derived
// in the parent so this component has no dependency on the full prompts array.

import { X, Zap } from "lucide-react";
import { CATEGORIES, RESOLUTIONS } from "./constants";

type ConfirmModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;

    // Summary display data — pre-derived by the parent
    category: typeof CATEGORIES[number]["value"];
    selectedPromptName: string;
    metalColorLabel: string;
    aspectRatio: string;
    resolution: typeof RESOLUTIONS[number]["value"];
    outputFormat: string;
};

export function ConfirmModal({
    open,
    onClose,
    onConfirm,
    category,
    selectedPromptName,
    metalColorLabel,
    aspectRatio,
    resolution,
    outputFormat,
}: ConfirmModalProps) {
    if (!open) return null;

    const categoryLabel = CATEGORIES.find(c => c.value === category)?.label;
    const creditCost = resolution === "4K" ? "2 kredi" : "1 kredi";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
            style={{ backgroundColor: "var(--bg-overlay)" }}
        >
            <div
                className="w-full max-w-sm flex flex-col overflow-hidden"
                style={{
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--bg-primary)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
                }}
            >
                {/* Modal header */}
                <div
                    className="flex items-center justify-between px-5 py-3 shrink-0"
                    style={{ borderBottom: "1px solid var(--border)" }}
                >
                    <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                        Jewelshot® İşlem Onayı
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
                <div className="px-5 py-5 flex flex-col gap-4">
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        Jewelshot® işleme başlamak üzere... Bu işlem tamamlandığında hesabınızdan <b>{creditCost} kullanılacaktır</b>. Devam etmek istiyor musunuz?
                    </p>

                    <div className="flex flex-col gap-3 p-3 rounded-md" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Kategori:</span>
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                {categoryLabel}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Uygulanacak Stil:</span>
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                {selectedPromptName || "Seçilmedi"}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Altın Rengi:</span>
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                {metalColorLabel}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Boyut & Kalite:</span>
                            <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                {aspectRatio === "auto" ? "Oto" : aspectRatio} · {resolution} · {outputFormat.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div
                    className="flex items-center gap-3 px-5 py-4 shrink-0"
                    style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-secondary)" }}
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2 text-[13px] font-medium rounded-md transition-colors hover:opacity-80"
                        style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                    >
                        Vazgeç
                    </button>
                    <button
                        id="modal-generate-btn"
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 py-2 text-[13px] font-medium rounded-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                        style={{ backgroundColor: "var(--primary)", border: "1px solid var(--border)", color: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                    >
                        <Zap size={14} fill="currentColor" />
                        Başla
                    </button>
                </div>
            </div>
        </div>
    );
}
