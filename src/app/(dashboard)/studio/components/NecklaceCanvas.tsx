// NecklaceCanvas — 5-slot upload grid + result/pending panel for "Kolye".
// JSX taken verbatim from studio-client.tsx lines 729-895.
//
// Uses the shared GeneratedPanel + PendingPanel components for the result area.

import { GeneratedPanel, PendingPanel } from "./GeneratedPanel";
import { NECKLACE_SLOTS, type NecklaceSlot, type NecklaceFileState } from "./constants";
import { X, Image as ImageIcon, Link2, Lock, Sparkles } from "lucide-react";
import type { GenerateResult } from "@/lib/studio/actions";

type NecklaceCanvasProps = {
    necklaceFiles: NecklaceFileState;
    necklaceFileRefs: React.MutableRefObject<Record<NecklaceSlot, HTMLInputElement | null>>;
    isPending: boolean;
    statusText: string;
    result: GenerateResult;
    outputFormat: string;
    onFileChange: (slot: NecklaceSlot, file: File) => void;
    onClearSlot: (slot: NecklaceSlot) => void;
    onClearResult: () => void;
};

export function NecklaceCanvas({
    necklaceFiles,
    necklaceFileRefs,
    isPending,
    statusText,
    result,
    outputFormat,
    onFileChange,
    onClearSlot,
    onClearResult,
}: NecklaceCanvasProps) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start gap-6 pt-4 pb-4 overflow-y-auto">
            {/* Top Row: 5 Image Slots */}
            <div className="w-full max-w-5xl grid grid-cols-5 gap-3 px-4 shrink-0">
                {NECKLACE_SLOTS.map((slot) => {
                    const slotData = necklaceFiles[slot.key];
                    const SlotIcon = slot.icon;
                    return (
                        <div key={slot.key} className="flex flex-col gap-1.5 shrink-0">
                            <span className="text-[11px] uppercase tracking-wider text-center" style={{ color: "var(--text-tertiary)" }}>
                                {slot.label}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { necklaceFileRefs.current[slot.key] = el; }}
                                onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) onFileChange(slot.key, f);
                                }}
                            />
                            {slotData ? (
                                <div className="relative group w-full">
                                    <img
                                        src={slotData.preview}
                                        alt={slot.label}
                                        className="w-full object-cover"
                                        style={{
                                            aspectRatio: "1/1",
                                            borderRadius: "var(--radius-md)",
                                            border: "1px solid var(--border)",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => onClearSlot(slot.key)}
                                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => necklaceFileRefs.current[slot.key]?.click()}
                                    onDragOver={(e) => { e.preventDefault(); }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const f = e.dataTransfer.files[0];
                                        if (f) onFileChange(slot.key, f);
                                    }}
                                    className="w-full cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors hover:border-[var(--text-tertiary)]"
                                    style={{
                                        aspectRatio: "1/1",
                                        borderRadius: "var(--radius-md)",
                                        border: "2px dashed var(--border)",
                                        backgroundColor: "var(--bg-secondary)",
                                    }}
                                >
                                    <SlotIcon size={20} style={{ color: "var(--text-tertiary)" }} />
                                    <span className="text-[10px] text-center px-1" style={{ color: "var(--text-tertiary)" }}>
                                        {slot.description}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Area: Result or Pending */}
            {(result.outputUrl || isPending || result.error) && (
                <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center min-h-[300px] mt-4 mb-8 shrink-0">
                    {result.outputUrl ? (
                        <GeneratedPanel
                            outputUrl={result.outputUrl}
                            outputFormat={outputFormat}
                            downloadFilename="necklace_edited"
                            successLabel="Üretilen"
                            onClose={onClearResult}
                            iconSize={13}
                            btnClass="w-7 h-7"
                        />
                    ) : isPending ? (
                        <PendingPanel statusText={statusText} />
                    ) : null}
                </div>
            )}
        </div>
    );
}
