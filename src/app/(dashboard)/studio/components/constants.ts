// ─────────────────────────────────────────────────────────────────────────────
// Studio constants — single source of truth for all studio components.
// Exported as `as const` to preserve literal types throughout the codebase.
// ─────────────────────────────────────────────────────────────────────────────

import { Camera, Image as ImageIcon, Link2, Lock, Sparkles } from "lucide-react";

export const ASPECT_RATIOS = [
    { value: "auto", label: "Otomatik" },
    { value: "1:1", label: "1:1" },
    { value: "4:3", label: "4:3" },
    { value: "3:4", label: "3:4" },
    { value: "16:9", label: "16:9" },
    { value: "9:16", label: "9:16" },
] as const;

export const RESOLUTIONS = [
    { value: "1K", label: "1K" },
    { value: "2K", label: "2K" },
    { value: "4K", label: "4K" },
] as const;

export const FORMATS = [
    { value: "png", label: "PNG" },
    { value: "jpeg", label: "JPEG" },
    { value: "webp", label: "WebP" },
] as const;

export const CATEGORIES = [
    { value: "yuzuk", label: "Yüzük", dbCategory: "yüzük" },
    { value: "kolye", label: "Kolye", dbCategory: "kolye" },
    { value: "kupe", label: "Küpe", dbCategory: "küpe" },
    { value: "bileklik", label: "Bileklik", dbCategory: "bileklik" },
] as const;

export const METAL_COLORS = [
    { value: "orijinal", label: "Orijinal Renk Kalsın (Preserve Original)" },
    { value: "8k_sari", label: "8 Ayar Sarı Altın (8K Yellow)" },
    { value: "14k_sari", label: "14 Ayar Sarı Altın (14K Yellow)" },
    { value: "18k_sari", label: "18 Ayar Sarı Altın (18K Yellow)" },
    { value: "22k_sari", label: "22 Ayar Sarı Altın (22K Yellow)" },
    { value: "beyaz", label: "Beyaz Altın (White Gold)" },
    { value: "rose", label: "Rose Altın (Rose Gold)" },
] as const;

// ── Necklace ──────────────────────────────────────────────────────────────────

export type NecklaceSlot = "kilavuz" | "genel" | "uc" | "zincir" | "kilit";
export type NecklaceFileState = Record<NecklaceSlot, { file: File; preview: string } | null>;

export const NECKLACE_SLOTS: { key: NecklaceSlot; label: string; description: string; icon: typeof Camera }[] = [
    { key: "kilavuz", label: "Kılavuz Hat", description: "Şekil / Poz referansı", icon: ImageIcon },
    { key: "genel", label: "Genel Görünüm", description: "Kolyenin tamamı", icon: ImageIcon },
    { key: "uc", label: "Kolye Ucu", description: "Pendant detay", icon: Sparkles },
    { key: "zincir", label: "Zincir Detayı", description: "Zincir yakın çekim", icon: Link2 },
    { key: "kilit", label: "Kilit Görünümü", description: "Kilit mekanizması", icon: Lock },
];

// ── Earring ───────────────────────────────────────────────────────────────────

export type EarringSlot = "onden" | "yandan";
export type EarringFileState = Record<EarringSlot, { file: File; preview: string } | null>;

export const EARRING_SLOTS: { key: EarringSlot; label: string; description: string; icon: typeof Camera }[] = [
    { key: "onden", label: "Önden Görünüm", description: "Zorunlu", icon: ImageIcon },
    { key: "yandan", label: "Yandan", description: "İsteğe Bağlı", icon: ImageIcon },
];

// ── Bracelet ──────────────────────────────────────────────────────────────────

export type BraceletSlot = "ustten" | "detay";
export type BraceletFileState = Record<BraceletSlot, { file: File; preview: string } | null>;

export const BRACELET_SLOTS: { key: BraceletSlot; label: string; description: string; icon: typeof Camera }[] = [
    { key: "ustten", label: "Üstten Görünüm", description: "Zorunlu", icon: ImageIcon },
    { key: "detay", label: "Detay / Kilit", description: "İsteğe Bağlı", icon: ImageIcon },
];
