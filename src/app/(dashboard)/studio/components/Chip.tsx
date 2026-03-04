// Chip — small selectable pill button used in the Settings modal.
// Moved from the file-private function at studio-client.tsx line 1583.

type ChipProps = {
    label: string;
    active: boolean;
    onClick: () => void;
};

export function Chip({ label, active, onClick }: ChipProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="px-2.5 py-1 text-[12px] cursor-pointer transition-colors"
            style={{
                borderRadius: "var(--radius-md)",
                border: `1px solid ${active ? "var(--text-primary)" : "var(--border)"}`,
                backgroundColor: active ? "var(--bg-secondary)" : "transparent",
                color: active ? "var(--text-primary)" : "var(--text-tertiary)",
            }}
        >
            {label}
        </button>
    );
}
