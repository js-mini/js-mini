// BraceletCanvas — 2-slot upload grid + result/pending panel for "Bileklik".
// JSX taken verbatim from studio-client.tsx lines 976-1060.

import { GeneratedPanel, PendingPanel } from "./GeneratedPanel";
import { BRACELET_SLOTS, type BraceletSlot, type BraceletFileState } from "./constants";
import { X } from "lucide-react";
import type { GenerateResult } from "@/lib/studio/actions";

type BraceletCanvasProps = {
    braceletFiles: BraceletFileState;
    braceletFileRefs: React.MutableRefObject<Record<BraceletSlot, HTMLInputElement | null>>;
    isPending: boolean;
    statusText: string;
    result: GenerateResult;
    outputFormat: string;
    onFileChange: (slot: BraceletSlot, file: File) => void;
    onClearSlot: (slot: BraceletSlot) => void;
    onClearResult: () => void;
};

export function BraceletCanvas({
    braceletFiles,
    braceletFileRefs,
    isPending,
    statusText,
    result,
    outputFormat,
    onFileChange,
    onClearSlot,
    onClearResult,
}: BraceletCanvasProps) {
    return (
        <div className="w-full h-full flex flex-col items-center justify-start gap-6 pt-4 pb-4 overflow-y-auto">
            <div className="w-full max-w-lg grid grid-cols-2 gap-4 px-4 shrink-0">
                {BRACELET_SLOTS.map((slot) => {
                    const slotData = braceletFiles[slot.key];
                    const SlotIcon = slot.icon;
                    return (
                        <div key={slot.key} className="flex flex-col gap-1.5 shrink-0">
                            <span className="text-[12px] uppercase tracking-wider text-center font-medium" style={{ color: "var(--text-tertiary)" }}>
                                {slot.label}
                            </span>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={(el) => { braceletFileRefs.current[slot.key] = el; }}
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
                                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                                        style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => braceletFileRefs.current[slot.key]?.click()}
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
                                    <SlotIcon size={24} style={{ color: "var(--text-tertiary)" }} />
                                    <span className="text-[11px] text-center px-2" style={{ color: "var(--text-tertiary)" }}>
                                        {slot.description}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {(result.outputUrl || isPending || result.error) && (
                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[300px] mt-4 mb-8 shrink-0">
                    {result.outputUrl ? (
                        <GeneratedPanel
                            outputUrl={result.outputUrl}
                            outputFormat={outputFormat}
                            downloadFilename="bracelet_edited"
                            successLabel="Bileklik Üretildi"
                            onClose={onClearResult}
                            iconSize={14}
                            btnClass="w-8 h-8"
                        />
                    ) : isPending ? (
                        <PendingPanel statusText={statusText} fallbackText="Bileklik oluşturuluyor..." />
                    ) : null}
                </div>
            )}
        </div>
    );
}
