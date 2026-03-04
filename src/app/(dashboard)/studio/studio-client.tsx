"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon, Loader2, Download, Settings, Camera, Zap, Share2 } from "lucide-react";
import { generateAction, type GenerateResult } from "@/lib/studio/actions";
import { RightSidebarPortal } from "@/components/layout/right-sidebar";
import {
    ASPECT_RATIOS, RESOLUTIONS, FORMATS, CATEGORIES, METAL_COLORS,
    NECKLACE_SLOTS, EARRING_SLOTS, BRACELET_SLOTS,
    type NecklaceSlot, type NecklaceFileState,
    type EarringSlot, type EarringFileState,
    type BraceletSlot, type BraceletFileState,
} from "./components/constants";
import { Chip } from "./components/Chip";
import { SettingsModal } from "./components/SettingsModal";

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

// All constants and slot types are imported from ./components/constants

export default function StudioClient({ prompts }: Props) {
    const [category, setCategory] = useState<typeof CATEGORIES[number]["value"]>("yuzuk");
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState("");
    const [necklaceFiles, setNecklaceFiles] = useState<NecklaceFileState>({
        kilavuz: null, genel: null, uc: null, zincir: null, kilit: null,
    });
    const [earringFiles, setEarringFiles] = useState<EarringFileState>({
        onden: null, yandan: null,
    });
    const [braceletFiles, setBraceletFiles] = useState<BraceletFileState>({
        ustten: null, detay: null,
    });
    const [selectedPrompt, setSelectedPrompt] = useState(prompts[0]?.id || "");
    const [engravingText, setEngravingText] = useState("");
    const [metalColor, setMetalColor] = useState<typeof METAL_COLORS[number]["value"]>("orijinal");
    const [aspectRatio, setAspectRatio] = useState("auto");
    const [resolution, setResolution] = useState<typeof RESOLUTIONS[number]["value"]>("1K");
    const [outputFormat, setOutputFormat] = useState<typeof FORMATS[number]["value"]>("png");
    const [result, setResult] = useState<GenerateResult>({});
    const [isPending, setIsPending] = useState(false);
    const [statusText, setStatusText] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [headerPortalElement, setHeaderPortalElement] = useState<HTMLElement | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const cameraRef = useRef<HTMLInputElement>(null);
    const necklaceFileRefs = useRef<Record<NecklaceSlot, HTMLInputElement | null>>({ kilavuz: null, genel: null, uc: null, zincir: null, kilit: null });
    const earringFileRefs = useRef<Record<EarringSlot, HTMLInputElement | null>>({ onden: null, yandan: null });
    const braceletFileRefs = useRef<Record<BraceletSlot, HTMLInputElement | null>>({ ustten: null, detay: null });
    const router = useRouter();

    useEffect(() => {
        setHeaderPortalElement(document.getElementById("header-center-portal"));
    }, []);

    // ── Blob URL cleanup: revoke when preview changes or component unmounts ─────
    // URL.createObjectURL allocates memory in the browser that is NOT garbage-collected
    // automatically. Without this cleanup, every file the user opens leaks a blob.
    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    useEffect(() => {
        return () => {
            Object.values(necklaceFiles).forEach(s => { if (s) URL.revokeObjectURL(s.preview); });
        };
    }, [necklaceFiles]);

    useEffect(() => {
        return () => {
            Object.values(earringFiles).forEach(s => { if (s) URL.revokeObjectURL(s.preview); });
        };
    }, [earringFiles]);

    useEffect(() => {
        return () => {
            Object.values(braceletFiles).forEach(s => { if (s) URL.revokeObjectURL(s.preview); });
        };
    }, [braceletFiles]);

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

    const handleEarringFile = useCallback((slot: EarringSlot, f: File) => {
        if (!f.type.startsWith("image/")) return;
        setEarringFiles(prev => ({
            ...prev,
            [slot]: { file: f, preview: URL.createObjectURL(f) },
        }));
    }, []);

    const clearEarringSlot = useCallback((slot: EarringSlot) => {
        setEarringFiles(prev => ({ ...prev, [slot]: null }));
        const ref = earringFileRefs.current[slot];
        if (ref) ref.value = "";
    }, []);

    const handleBraceletFile = useCallback((slot: BraceletSlot, f: File) => {
        if (!f.type.startsWith("image/")) return;
        setBraceletFiles(prev => ({
            ...prev,
            [slot]: { file: f, preview: URL.createObjectURL(f) },
        }));
    }, []);

    const clearBraceletSlot = useCallback((slot: BraceletSlot) => {
        setBraceletFiles(prev => ({ ...prev, [slot]: null }));
        const ref = braceletFileRefs.current[slot];
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

    const handleSubmit = () => {
        if (!selectedPrompt) return;

        // Determine which files to upload based on category
        if (category === "yuzuk" && !file) return;
        if (category === "kolye" && !necklaceFiles.genel) return;
        if (category === "kupe" && !earringFiles.onden) return;
        if (category === "bileklik" && !braceletFiles.ustten) return;

        setShowConfirmModal(true);
    };

    const executeGeneration = async () => {
        setShowConfirmModal(false);
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
            } else if (category === "kupe") {
                // Earring: parallel upload for 'onden' and 'yandan'
                const slots: EarringSlot[] = ["onden", "yandan"];
                const uploadPromises = slots.map(async (slot) => {
                    const slotData = earringFiles[slot];
                    if (!slotData) return null;
                    const formData = new FormData();
                    formData.append("file", slotData.file);
                    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok || !uploadData.falUrl) return null;
                    return { slot, falUrl: uploadData.falUrl, storagePath: uploadData.inputStoragePath };
                });

                const uploadResults = await Promise.all(uploadPromises);

                const frontUpload = uploadResults.find(r => r?.slot === "onden");
                if (!frontUpload) {
                    setResult({ error: "Önden görünüm fotoğrafı yüklenemedi." });
                    setIsPending(false);
                    setStatusText("");
                    return;
                }

                const sideUpload = uploadResults.find(r => r?.slot === "yandan");
                const additionalUrls = sideUpload ? [sideUpload.falUrl] : [];

                setStatusText("Görsel üretiliyor...");
                const res = await generateAction({
                    falImageUrl: frontUpload.falUrl,
                    additionalFalImageUrls: additionalUrls,
                    guideImageUrl: undefined,
                    inputStorageUrl: frontUpload.storagePath,
                    promptId: selectedPrompt,
                    aspectRatio,
                    resolution,
                    outputFormat,
                    originalFileName: earringFiles.onden!.file.name,
                    engravingText: "",
                    category,
                    metalColor,
                });
                setResult(res);
            } else if (category === "bileklik") {
                const slots: BraceletSlot[] = ["ustten", "detay"];
                const uploadPromises = slots.map(async (slot) => {
                    const slotData = braceletFiles[slot];
                    if (!slotData) return null;
                    const formData = new FormData();
                    formData.append("file", slotData.file);
                    const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
                    const uploadData = await uploadRes.json();
                    if (!uploadRes.ok || !uploadData.falUrl) return null;
                    return { slot, falUrl: uploadData.falUrl, storagePath: uploadData.inputStoragePath };
                });

                const uploadResults = await Promise.all(uploadPromises);

                const topUpload = uploadResults.find(r => r?.slot === "ustten");
                if (!topUpload) {
                    setResult({ error: "Üstten görünüm fotoğrafı yüklenemedi." });
                    setIsPending(false);
                    setStatusText("");
                    return;
                }

                const detailUpload = uploadResults.find(r => r?.slot === "detay");
                const additionalUrls = detailUpload ? [detailUpload.falUrl] : [];

                setStatusText("Görsel üretiliyor...");
                const res = await generateAction({
                    falImageUrl: topUpload.falUrl,
                    additionalFalImageUrls: additionalUrls,
                    guideImageUrl: undefined,
                    inputStorageUrl: topUpload.storagePath,
                    promptId: selectedPrompt,
                    aspectRatio,
                    resolution,
                    outputFormat,
                    originalFileName: braceletFiles.ustten!.file.name,
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
        <div className="flex gap-1" style={{ backgroundColor: "var(--bg-secondary)", padding: "2px", borderRadius: "100px" }}>
            {CATEGORIES.map((c) => (
                <button
                    key={c.value}
                    onClick={() => {
                        setCategory(c.value);
                        setSelectedPrompt("");
                    }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-[12px] sm:text-sm font-medium transition-colors whitespace-nowrap"
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
                        disabled={
                            isPending ||
                            (category === "yuzuk" && !file) ||
                            (category === "kolye" && !necklaceFiles.genel) ||
                            (category === "kupe" && !earringFiles.onden) ||
                            (category === "bileklik" && !braceletFiles.ustten) ||
                            !selectedPrompt
                        }
                        className="btn-primary flex items-center justify-center gap-2 w-full"
                    >
                        {isPending ? (
                            <>
                                <Loader2 size={14} className="animate-spin" />
                                {statusText}
                            </>
                        ) : (
                            <>
                                <Zap size={14} fill="currentColor" />
                                Çekimi Başlat
                            </>
                        )}
                    </button>
                </div>
            </RightSidebarPortal>

            {/* Settings Modal */}
            <SettingsModal
                open={showSettings}
                onClose={() => setShowSettings(false)}
                category={category}
                engravingText={engravingText}
                metalColor={metalColor}
                aspectRatio={aspectRatio}
                resolution={resolution}
                outputFormat={outputFormat}
                setEngravingText={setEngravingText}
                setMetalColor={setMetalColor}
                setAspectRatio={setAspectRatio}
                setResolution={setResolution}
                setOutputFormat={setOutputFormat}
            />

            {/* Generation Confirmation Modal */}
            {showConfirmModal && (
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
                                onClick={() => setShowConfirmModal(false)}
                                className="w-7 h-7 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-70 rounded-md hover:bg-[var(--bg-secondary)]"
                                style={{ color: "var(--text-tertiary)" }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="px-5 py-5 flex flex-col gap-4">
                            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Jewelshot® işleme başlamak üzere... Bu işlem tamamlandığında hesabınızdan <b>{resolution === "4K" ? "2 kredi" : "1 kredi"} kullanılacaktır</b>. Devam etmek istiyor musunuz?
                            </p>

                            <div className="flex flex-col gap-3 p-3 rounded-md" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border)" }}>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Kategori:</span>
                                    <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                        {CATEGORIES.find(c => c.value === category)?.label}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Uygulanacak Stil:</span>
                                    <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                        {prompts.find((p) => p.id === selectedPrompt)?.name || "Seçilmedi"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>Altın Rengi:</span>
                                    <span className="text-[12px] font-medium" style={{ color: "var(--text-primary)" }}>
                                        {METAL_COLORS.find(m => m.value === metalColor)?.label}
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
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-2 text-[13px] font-medium rounded-md transition-colors hover:opacity-80"
                                style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                            >
                                Vazgeç
                            </button>
                            <button
                                id="modal-generate-btn"
                                type="button"
                                onClick={executeGeneration}
                                className="flex-1 py-2 text-[13px] font-medium rounded-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                                style={{ backgroundColor: "var(--primary)", border: "1px solid var(--border)", color: "#fff", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
                            >
                                <Zap size={14} fill="currentColor" />
                                Başla
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
                                    PNG, JPG, WEBP — maks. 20MB
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
                                                        try {
                                                            const text = "Powered by Jewelshot®";
                                                            const url = "https://jewelshot.app";
                                                            let files: File[] = [];

                                                            try {
                                                                const res = await fetch(result.outputUrl!);
                                                                const blob = await res.blob();
                                                                const base = fileName.replace(/\.[^.]+$/, "");
                                                                const file = new File([blob], `${base}_edited.${outputFormat}`, { type: blob.type });
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
                ) : category === "kupe" ? (
                    /* ── Earring Canvas (Front/Side image slots + Result) ── */
                    <div className="w-full h-full flex flex-col items-center justify-start gap-6 pt-4 pb-4 overflow-y-auto">
                        <div className="w-full max-w-lg grid grid-cols-2 gap-4 px-4 shrink-0">
                            {EARRING_SLOTS.map((slot) => {
                                const slotData = earringFiles[slot.key];
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
                                            ref={(el) => { earringFileRefs.current[slot.key] = el; }}
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleEarringFile(slot.key, f);
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
                                                    onClick={() => clearEarringSlot(slot.key)}
                                                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => earringFileRefs.current[slot.key]?.click()}
                                                onDragOver={(e) => { e.preventDefault(); }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    const f = e.dataTransfer.files[0];
                                                    if (f) handleEarringFile(slot.key, f);
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
                                                        try {
                                                            const text = "Powered by Jewelshot®";
                                                            const url = "https://jewelshot.app";
                                                            let files: File[] = [];

                                                            try {
                                                                const res = await fetch(result.outputUrl!);
                                                                const blob = await res.blob();
                                                                const file = new File([blob], `earring_edited.${outputFormat}`, { type: blob.type });
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
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                    title="Paylaş"
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const res = await fetch(result.outputUrl!);
                                                        const blob = await res.blob();
                                                        const a = document.createElement("a");
                                                        a.href = URL.createObjectURL(blob);
                                                        a.download = `earring_edited.${outputFormat}`;
                                                        a.click();
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                    title="İndir"
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setResult({})}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                    title="Kapat"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <span className="text-[12px] uppercase tracking-wider font-medium" style={{ color: "var(--success)" }}>
                                            Küpeler Üretildi
                                        </span>
                                    </div>
                                ) : isPending ? (
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
                                        <Loader2 size={24} className="animate-spin text-tertiary" />
                                        <span className="text-[12px] font-medium text-tertiary">
                                            {statusText || "Küpeler oluşturuluyor..."}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                ) : category === "bileklik" ? (
                    /* ── Bracelet Canvas (Front/Detail image slots + Result) ── */
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
                                                if (f) handleBraceletFile(slot.key, f);
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
                                                    onClick={() => clearBraceletSlot(slot.key)}
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
                                                    if (f) handleBraceletFile(slot.key, f);
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
                                                        try {
                                                            const text = "Powered by Jewelshot®";
                                                            const url = "https://jewelshot.app";
                                                            let files: File[] = [];

                                                            try {
                                                                const res = await fetch(result.outputUrl!);
                                                                const blob = await res.blob();
                                                                const file = new File([blob], `bracelet_edited.${outputFormat}`, { type: blob.type });
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
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                    title="Paylaş"
                                                >
                                                    <Share2 size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        const res = await fetch(result.outputUrl!);
                                                        const blob = await res.blob();
                                                        const a = document.createElement("a");
                                                        a.href = URL.createObjectURL(blob);
                                                        a.download = `bracelet_edited.${outputFormat}`;
                                                        a.click();
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                    title="İndir"
                                                >
                                                    <Download size={14} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setResult({})}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer shadow-md"
                                                    style={{ backgroundColor: "rgba(0,0,0,0.7)", color: "#fff" }}
                                                    title="Kapat"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <span className="text-[12px] uppercase tracking-wider font-medium" style={{ color: "var(--success)" }}>
                                            Bileklik Üretildi
                                        </span>
                                    </div>
                                ) : isPending ? (
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
                                        <Loader2 size={24} className="animate-spin text-tertiary" />
                                        <span className="text-[12px] font-medium text-tertiary">
                                            {statusText || "Bileklik oluşturuluyor..."}
                                        </span>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Placeholder for Others ── */
                    <div className="flex flex-col items-center justify-center flex-1 text-center opacity-60 w-full min-h-[300px]">
                        <ImageIcon size={36} className="mb-3" />
                        <span className="text-[14px] uppercase tracking-widest mb-1">Çok Yakında</span>
                        <span className="text-[12px]">Bu kategori için modül hazırlanıyor.</span>
                    </div>
                )}
            </div>

            {/* Mobile Styles & Generate Form (Visible only on md:hidden) */}
            <div className="md:hidden flex flex-col shrink-0 mt-auto pt-2 pb-2 border-t border-[var(--border)] relative z-10 bg-[var(--bg-primary)] -mx-4 px-4 sm:-mx-6 sm:px-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "var(--text-tertiary)" }}>Stil</span>
                    <button
                        type="button"
                        onClick={() => setShowSettings(true)}
                        className="text-[11px] flex gap-1 items-center font-medium"
                        style={{ color: "var(--text-primary)" }}
                    >
                        <Settings size={12} />
                        Ayarlar
                    </button>
                </div>
                <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x">
                    {filteredPrompts.length > 0 ? filteredPrompts.map((p, i) => {
                        const handleStyleClick = () => {
                            setSelectedPrompt(p.id);
                            if (category === "yuzuk" && file) {
                                setTimeout(() => {
                                    const btn = document.getElementById("generate-btn-mobile");
                                    btn?.click();
                                }, 50);
                            }
                        };
                        const presetPrefix = category === "yuzuk" ? "ring" : category;
                        return (
                            <button
                                key={`m-${p.id}`}
                                type="button"
                                onClick={handleStyleClick}
                                className="flex flex-col cursor-pointer transition-colors overflow-hidden shrink-0 w-20 snap-start"
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
                                    className="text-[10px] py-1 px-1.5 w-full text-center truncate"
                                    style={{ color: selectedPrompt === p.id ? "var(--text-primary)" : "var(--text-secondary)" }}
                                >
                                    Stil {i + 1}
                                </span>
                            </button>
                        );
                    }) : (
                        <div className="flex flex-col items-center justify-center p-4 gap-1 w-full border border-dashed border-[var(--border)] rounded-md">
                            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>Yakında</span>
                        </div>
                    )}
                </div>

                <button
                    id="generate-btn-mobile"
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                        isPending ||
                        (category === "yuzuk" && !file) ||
                        (category === "kolye" && !necklaceFiles.genel) ||
                        (category === "kupe" && !earringFiles.onden) ||
                        (category === "bileklik" && !braceletFiles.ustten) ||
                        !selectedPrompt
                    }
                    className="btn-primary flex items-center justify-center gap-2 w-full mt-1"
                >
                    {isPending ? (
                        <>
                            <Loader2 size={14} className="animate-spin" />
                            {statusText}
                        </>
                    ) : (
                        <>
                            <Zap size={14} fill="currentColor" />
                            Çekimi Başlat
                        </>
                    )}
                </button>
            </div>
        </div >
    );
}

// Chip is now imported from ./components/Chip
