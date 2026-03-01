"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Sparkles, Loader2, Download, Settings, Camera, Link2, Lock } from "lucide-react";
import { generateAction, type GenerateResult } from "@/lib/studio/actions";
import { RightSidebarPortal } from "@/components/layout/right-sidebar";

type PromptOption = {
    id: string;
    name: string;
    description: string | null;
    category: string;
    reference_image_url: string | null;
};

type Props = {
    prompts: PromptOption[];
};

const ASPECT_RATIOS = [
    { value: "auto", label: "Otomatik" },
    { value: "1:1", label: "1:1" },
    { value: "4:3", label: "4:3" },
    { value: "3:4", label: "3:4" },
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" },
] as const;

const RESOLUTIONS = [
    { value: "1K", label: "1K" },
    { value: "2K", label: "2K" },
    { value: "4K", label: "4K" },
] as const;

const FORMATS = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "webp", label: "WebP" },
] as const;

const CATEGORIES = [
    { value: "yuzuk", label: "Yüzük", dbCategory: "yüzük" },
    { value: "kolye", label: "Kolye", dbCategory: "kolye" },
    { value: "kupe", label: "Küpe", dbCategory: "küpe" },
    { value: "bileklik", label: "Bileklik", dbCategory: "bileklik" },
] as const;

const METAL_COLORS = [
    { value: "8k_sari", label: "8 Ayar Sarı Altın (8K Yellow)" },
    { value: "14k_sari", label: "14 Ayar Sarı Altın (14K Yellow)" },
    { value: "18k_sari", label: "18 Ayar Sarı Altın (18K Yellow)" },
    { value: "22k_sari", label: "22 Ayar Sarı Altın (22K Yellow)" },
    { value: "beyaz", label: "Beyaz Altın (White Gold)" },
    { value: "rose", label: "Rose Altın (Rose Gold)" },
] as const;

type NecklaceSlot = "kilavuz" | "genel" | "uc" | "zincir" | "kilit";
type NecklaceFileState = Record<NecklaceSlot, { file: File; preview: string } | null>;

const NECKLACE_SLOTS: { key: NecklaceSlot; label: string; description: string; icon: typeof Camera }[] = [
    { key: "kilavuz", label: "Kılavuz Hat", description: "Şekil / Poz referansı", icon: ImageIcon },
    { key: "genel", label: "Genel Görünüm", description: "Kolyenin tamamı", icon: ImageIcon },
    { key: "uc", label: "Kolye Ucu", description: "Pendant detay", icon: Sparkles },
    { key: "zincir", label: "Zincir Detayı", description: "Zincir yakın çekim", icon: Link2 },
    { key: "kilit", label: "Kilit Görünümü", description: "Kilit mekanizması", icon: Lock },
];

export default function StudioClient({ prompts }: Props) {
    const [category, setCategory] = useState<typeof CATEGORIES[number]["value"]>("yuzuk");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [necklaceFiles, setNecklaceFiles] = useState<NecklaceFileState>({
        kilavuz: null, genel: null, uc: null, zincir: null, kilit: null,
    });
    const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]?.id || "");
    const [engravingText, setEngravingText] = useState("");
    const [metalColor, setMetalColor] = useState<typeof METAL_COLORS[number]["value"]>("14k_sari");
    const [aspectRatio, setAspectRatio] = useState("auto");
    const [resolution, setResolution] = useState("1K");
    const [outputFormat, setOutputFormat] = useState("png");
    const [result, setResult] = useState<GenerateResult>({});
    const [isPending, setIsPending] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [headerPortalElement, setHeaderPortalElement] = useState<HTMLElement | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);
    const necklaceFileRefs = useRef<Record<NecklaceSlot, HTMLInputElement | null>>({ kilavuz: null, genel: null, uc: null, zincir: null, kilit: null });
    const router = useRouter();

    useEffect(() => {
        setHeaderPortalElement(document.getElementById("header-center-portal"));
    }, []);

    const currentDbCategory = CATEGORIES.find(c => c.value === category)?.dbCategory || "yüzük";
    const filteredPrompts = prompts.filter(p => p.category === currentDbCategory);

    const handleFile = useCallback((f: File) => {
        if (!f.type.startsWith("image/")) return;
        setFile(f);
        setFileName(f.name);
        setPreview(URL.createObjectURL(f));
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFile(f);
    };

    const clearImage = () => {
        setPreview(null);
        setFile(null);
        setFileName("");
        if (fileRef.current) fileRef.current.value = "";
    };

    const handleNecklaceFile = useCallback((slot: NecklaceSlot, f: File) => {
        if (!f.type.startsWith("image/")) return;
        setNecklaceFiles(prev => ({
            ...prev,
            [slot]: { file: f, preview: URL.createObjectURL(f) },
        }));
    }, []);

    const clearNecklaceSlot = useCallback((slot: NecklaceSlot) => {
        setNecklaceFiles(prev => ({ ...prev, [slot]: null }));
        const ref = necklaceFileRefs.current[slot];
        if (ref) ref.value = "";
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFile(f);
        },
        [handleFile]
    );

    const handleSubmit = async () => {
        if (!selectedPrompt) return;

        // Determine which files to upload based on category
        if (category === "yuzuk" && !file) return;
        if (category === "kolye" && !necklaceFiles.genel) return;

        setIsPending(true);
        setResult({});

        try {
            setStatusText("Fotoğraflar yükleniyor...");

            if (category === "yuzuk") {
                // Ring: single image upload
                const formData = new FormData();
                formData.append("file", file!);
                const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok || !uploadData.falUrl) {
                    setResult({ error: uploadData.error || "Fotoğraf yüklenemedi." });
                    setIsPending(false);
                    setStatusText("");
                    return;
                }

                setStatusText("Görsel üretiliyor...");
                const res = await generateAction({
                    falImageUrl: uploadData.falUrl,
                    inputStorageUrl: uploadData.inputStoragePath,
                    promptId: selectedPrompt,
                    aspectRatio,
                    resolution,
                    outputFormat,
                    originalFileName: file!.name,
                    engravingText,
                    category,
                    metalColor,
                });
                setResult(res);
            } else if (category === "kolye") {
                // Necklace: upload all available images in parallel
                const slots: NecklaceSlot[] = ["kilavuz", "genel", "uc", "zincir", "kilit"];
                const uploadPromises = slots.map(async (slot) => {
                    const slotData = necklaceFiles[slot];
                    if (!slotData) return null;
                    const formData = new FormData();
                    formData.append("file", slotData.file);
                    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok || !uploadData.falUrl) return null;
                    return { slot, falUrl: uploadData.falUrl, storagePath: uploadData.inputStoragePath };
                });

                const uploadResults = await Promise.all(uploadPromises);

                // Find general upload which is strictly required
                const generalUpload = uploadResults.find(r => r?.slot === "genel");
                if (!generalUpload) {
                    setResult({ error: "Genel görünüm fotoğrafı yüklenemedi." });
                    setIsPending(false);
                    setStatusText("");
                    return;
                }

                // Find guide line upload (optional)
                const guideUpload = uploadResults.find(r => r?.slot === "kilavuz");

                // Collect additional image URLs (pendant, chain, clasp)
                const additionalUrls = uploadResults
                    .filter((r): r is NonNullable<typeof r> => r !== null && r.slot !== "genel" && r.slot !== "kilavuz")
                    .map(r => r.falUrl);

                setStatusText("Görsel üretiliyor...");
                const res = await generateAction({
                    falImageUrl: generalUpload.falUrl,
                    additionalFalImageUrls: additionalUrls,
                    guideImageUrl: guideUpload?.falUrl, // Pass user uploaded guide!
                    inputStorageUrl: generalUpload.storagePath,
                    promptId: selectedPrompt,
                    aspectRatio,
                    resolution,
                    outputFormat,
                    originalFileName: necklaceFiles.genel!.file.name,
                    engravingText: "",
                    category,
                    metalColor,
                });
                setResult(res);
            }
        } catch {
            setResult({ error: "Bir hata oluştu." });
        }

        setIsPending(false);
        setStatusText("");
        router.refresh();
    };

    // Compact settings label for header
    const settingsLabel = `${aspectRatio === "auto" ? "Oto" : aspectRatio} · ${resolution} · ${outputFormat.toUpperCase()} · ${METAL_COLORS.find(m => m.value === metalColor)?.label.split(" ")[0] || "Altın"}`;

    const renderCategoryTabs = () => (
        <div className="flex gap-0.5 sm:gap-1" style={{ backgroundColor: "var(--bg-secondary)", padding: "2px", borderRadius: "100px" }}>
            {CATEGORIES.map((c) => (
                <button
                    key={c.value}
                    onClick={() => {
                        setCategory(c.value);
                        setSelectedPrompt("");
                    }}
                    className="px-2.5 py-1.5 sm:px-3 text-[11px] sm:text-[12px] font-medium transition-colors"
                    style={{
                        borderRadius: "100px",
                        backgroundColor: category === c.value ? "var(--bg-primary)" : "transparent",
                        color: category === c.value ? "var(--text-primary)" : "var(--text-secondary)",
                        boxShadow: category === c.value ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    }}
                >
                    {c.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="h-full flex flex-col p-6">
            {/* Header Portal for Category Tabs */}
            {headerPortalElement && createPortal(renderCategoryTabs(), headerPortalElement)}

            {/* Right sidebar content via portal */}
            <RightSidebarPortal>
                {/* Header — Ayarlar button + summary */}
                <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="flex items-center gap-2 px-4 w-full cursor-pointer transition-colors hover:opacity-80 shrink-0"
                    style={{ height: 48, borderBottom: "1px solid var(--border)" }}
                >
                    <Settings size={14} className="shrink-0" style={{ color: "var(--text-tertiary)" }} />
                    <span className="text-[13px] font-medium shrink-0" style={{ color: "var(--text-primary)" }}>
                        Ayarlar
                    </span>
                    <span className="text-[11px] ml-auto truncate" style={{ color: "var(--text-tertiary)" }}>
                        {settingsLabel}
                    </span>
                </button>

                {/* Stil */}
                <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide px-4 py-3 flex flex-col gap-2">
                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Stil</span>
                    {filteredPrompts.length > 0 ? filteredPrompts.map((p, i) => {
                        const handleStyleClick = () => {
                            setSelectedPrompt(p.id);
                            if (category === "yuzuk" && file) {
                                setTimeout(() => {
                                    const btn = document.getElementById("generate-btn");
                                    btn?.click();
                                }, 50);
                            }
                        };
                        const presetPrefix = category === "yuzuk" ? "ring" : category;
                        return (
                            <button
                                key={p.id}
                                type="button"
                                onClick={handleStyleClick}
                                className="flex flex-col cursor-pointer transition-colors overflow-hidden shrink-0"
                                style={{
                                    borderRadius: "var(--radius-md)",
                                    border: selectedPrompt === p.id ? "1px solid var(--text-primary)" : "1px solid var(--border)",
                                    backgroundColor: selectedPrompt === p.id ? "var(--bg-secondary)" : "transparent",
                                }}
                            >
                                <img
                                    src={`/presets/${presetPrefix}_${i + 1}.png`}
                                    alt={`Stil ${i + 1}`}
                                    className="w-full object-cover"
                                    style={{ aspectRatio: "1/1" }}
                                />
                                <span
                                    className="text-[12px] py-1.5 px-2.5 w-full text-left"
                                    style={{ color: selectedPrompt === p.id ? "var(--text-primary)" : "var(--text-secondary)" }}
                                >
                                    Stil {i + 1}
                                </span>
                            </button>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Yakında</span>
                            <span className="text-[11px] text-center" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
                                Bu kategori için stiller hazırlanıyor
                            </span>
                        </div>
                    )}
                </div>

                {/* Generate button at bottom */}
                <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                        id="generate-btn"
                        type="button"
                        onClick={handleSubmit}
                        disabled={isPending || !selectedPrompt || (category === "yuzuk" ? !file : category === "kolye" ? !necklaceFiles.genel : true)}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                {statusText}
                            </>
                        ) : (
                            <>
                                <Sparkles size={14} />
                                Oluştur
                            </>
                        )}
                    </button>
                </div>
            </RightSidebarPortal>

            {/* Settings Modal */}
            {showSettings && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-overlay)" }}
                    onClick={() => setShowSettings(false)}
                >
                    <div
                        className="w-full max-w-sm flex flex-col"
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
                            className="flex items-center justify-between px-5"
                            style={{ height: 48, borderBottom: "1px solid var(--border)" }}
                        >
                            <span className="text-[14px] font-medium" style={{ color: "var(--text-primary)" }}>
                                Ayarlar
                            </span>
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                className="w-7 h-7 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-5 py-4 flex flex-col gap-5">
                            {/* Engraving — only for rings */}
                            {category === "yuzuk" && (
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Yazı</span>
                                    <input
                                        type="text"
                                        value={engravingText}
                                        onChange={(e) => setEngravingText(e.target.value)}
                                        placeholder="Yüzük içi metin (opsiyonel)"
                                        className="w-full px-2.5 py-1.5 text-[13px] outline-none"
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
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[11px] uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Metal Rengi</span>
                                <div className="flex flex-wrap gap-1">
                                    {METAL_COLORS.map((mc) => (
                                        <Chip key={mc.value} label={mc.label} active={metalColor === mc.value} onClick={() => setMetalColor(mc.value)} />
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
                                onClick={() => setShowSettings(false)}
                                className="btn-primary w-auto px-6"
                            >
                                Tamam
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error */}
            {result.error && (
                <div
                    className="text-[13px] px-3 py-2.5 mb-4"
                    style={{
                        borderRadius: "var(--radius-md)",
                        backgroundColor: "rgba(239,68,68,0.1)",
                        color: "var(--error)",
                        border: "1px solid rgba(239,68,68,0.2)",
                    }}
                >
                    {result.error}
                </div>
            )}

            <input
                ref={fileRef}
                name="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
            />
            <input
                ref={cameraRef}
                name="camera"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
            />

            {/* Canvas */}
            <div className="flex-1 flex items-center justify-center min-h-0 gap-6">
                {category === "yuzuk" ? (
                    /* ── Ring Canvas (single image) ── */
                    preview ? (
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
                                        onClick={clearImage}
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
                                                onClick={() => setResult({})}
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
                                    PNG, JPG, WEBP — maks. 10MB
                                </p>
                            </div>
                        </div>
                    )
                ) : category === "kolye" ? (
                    /* ── Necklace Canvas (5 image slots + Result) ── */
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
                                                if (f) handleNecklaceFile(slot.key, f);
                                            }}
                                        />
                                        {slotData ? (
                                            { headerPortalElement && createPortal(
                                                <div className="flex bg-[var(--hover)] p-1 rounded-lg">
                                                    {CATEGORIES.map((cat) => (
                                                        <button
                                                            key={cat.value}
                                                            onClick={() => {
                                                                setCategory(cat.value);
                                                                setPromptId(undefined);
                                                                setFile(null);
                                                                setNecklaceFiles({ kilavuz: null, genel: null, uc: null, zincir: null, kilit: null });
                                                            }}
                                                            className={`px-3 py-1.5 md:px-5 md:py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${category === cat.value
                                                                ? "bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-sm"
                                                                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                                                }`}
                                                        >
                                                            {cat.label}
                                                        </button>
                                                    ))}
                                                </div>,
                                                headerPortalElement
                                            )}                                            <div className="relative group w-full">
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
                                                onClick={() => clearNecklaceSlot(slot.key)}
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
                                                if (f) handleNecklaceFile(slot.key, f);
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
                                    <div className="flex flex-col items-center gap-2 max-w-full">
                                        <div className="relative group">
                                            <img
                                                src={result.outputUrl}
                                                alt="Üretilen"
                                                className="max-h-[60vh] max-w-full object-contain"
                                                style={{ border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}
                                            />
                                            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const res = await fetch(result.outputUrl!);
                                                        const blob = await res.blob();
                                                        const a = document.createElement("a");
                                                        a.href = URL.createObjectURL(blob);
                                                        a.download = `necklace_edited.${outputFormat}`;
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
                                                    onClick={() => setResult({})}
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
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Other categories (Küpe, Bileklik) — Coming soon ── */
                    <div className="flex flex-col items-center justify-center gap-3 py-20">
                        <div
                            className="w-12 h-12 flex items-center justify-center"
                            style={{
                                borderRadius: "var(--radius-md)",
                                backgroundColor: "var(--bg-secondary)",
                                border: "1px solid var(--border)",
                            }}
                        >
                            <ImageIcon size={20} style={{ color: "var(--text-tertiary)" }} />
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Yakında</p>
                        <p className="text-[12px]" style={{ color: "var(--text-tertiary)", opacity: 0.6 }}>
                            Bu kategori için canvas hazırlanıyor
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
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
