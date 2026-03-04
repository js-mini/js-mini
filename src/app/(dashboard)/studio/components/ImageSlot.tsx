// ImageSlot — a single file-upload slot used by the multi-image canvases
// (necklace 5 slots, earring 2 slots, bracelet 2 slots).
//
// Renders either:
//   a) A loaded image preview with a clear (×) button
//   b) An empty dropzone (click or drag-and-drop)
//
// The caller passes typed generic slot keys via `slotKey` to keep callbacks
// fully type-safe without any `any` cast.

import { X } from "lucide-react";

type SlotData = { file: File; preview: string } | null;

type ImageSlotProps<K extends string> = {
    slotKey: K;
    slotData: SlotData;
    label: string;
    description: string;
    icon: React.ElementType;

    // Forwarded ref for the hidden <input type="file">
    fileInputRef: (el: HTMLInputElement | null) => void;

    // Callbacks
    onFile: (key: K, file: File) => void;
    onClear: (key: K) => void;

    // Optional style overrides so necklace (smaller) and earring/bracelet
    // (larger) slots can share this component without layout changes.
    clearBtnSize?: number;   // default 12 (necklace), earring/bracelet use 14
    iconSize?: number;       // default 20 (necklace), earring/bracelet use 24
    labelClassName?: string; // default "text-[11px]", earring/bracelet use "text-[12px] font-medium"
};

export function ImageSlot<K extends string>({
    slotKey,
    slotData,
    label,
    description,
    icon: Icon,
    fileInputRef,
    onFile,
    onClear,
    clearBtnSize = 12,
    iconSize = 20,
    labelClassName = "text-[11px] uppercase tracking-wider text-center",
}: ImageSlotProps<K>) {
    return (
        <div className="flex flex-col gap-1.5 shrink-0">
            <span className={labelClassName} style={{ color: "var(--text-tertiary)" }}>
                {label}
            </span>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(slotKey, f);
                }}
            />
            {slotData ? (
                <div className="relative group w-full">
                    <img
                        src={slotData.preview}
                        alt={label}
                        className="w-full object-cover"
                        style={{
                            aspectRatio: "1/1",
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--border)",
                        }}
                    />
                    <button
                        type="button"
                        onClick={() => onClear(slotKey)}
                        className="absolute top-2 right-2 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                        style={{
                            width: clearBtnSize + 12,
                            height: clearBtnSize + 12,
                            backgroundColor: "rgba(0,0,0,0.7)",
                            color: "#fff",
                        }}
                    >
                        <X size={clearBtnSize} />
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => {
                        // Access the hidden input via the ref by finding the sibling input element.
                        // The ref is stored in the parent's ref record, so we trigger via the
                        // fileInputRef callback's associated element. We rely on the parent having
                        // wired fileInputRef to a Record and exposing a click helper through onFile.
                        // Instead, we use the onClick delegate: parent provides fileInputRef as a
                        // callback ref; we need to trigger click on the element. We use a local ref
                        // trick below ↓ via the data attribute.
                        const input = document.querySelector(
                            `input[data-slot-key="${slotKey}"]`
                        ) as HTMLInputElement | null;
                        input?.click();
                    }}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        const f = e.dataTransfer.files[0];
                        if (f) onFile(slotKey, f);
                    }}
                    className="w-full cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors hover:border-[var(--text-tertiary)]"
                    style={{
                        aspectRatio: "1/1",
                        borderRadius: "var(--radius-md)",
                        border: "2px dashed var(--border)",
                        backgroundColor: "var(--bg-secondary)",
                    }}
                >
                    <Icon size={iconSize} style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[10px] text-center px-1" style={{ color: "var(--text-tertiary)" }}>
                        {description}
                    </span>
                </div>
            )}
        </div>
    );
}
