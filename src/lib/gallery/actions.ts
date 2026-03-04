"use server";

import { createClient } from "@/lib/supabase/server";

export type GalleryImageRecord = {
    id: string;
    prompt_text: string;
    output_image_url: string;
    thumbnail_url?: string;
    input_image_url: string;
    created_at: string;
};

// Signed URL TTL: 6 hours
// Long enough that a user won't see broken images mid-session;
// short enough that a leaked URL is useless by the next day.
const SIGNED_URL_TTL_SECONDS = 6 * 60 * 60;

export async function getRecentGenerations(
    limit: number = 20
): Promise<{ data: GalleryImageRecord[] | null; error: string | null }> {
    try {
        const supabase = await createClient();

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            return { data: null, error: "Lütfen giriş yapın." };
        }

        const { data, error } = await supabase
            .from("generations")
            .select("id, prompt_text, output_image_url, input_image_url, created_at")
            .eq("user_id", user.id)
            .eq("status", "completed")
            .not("output_image_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Supabase fetch error for gallery:", error);
            return { data: null, error: "Görseller yüklenirken bir hata oluştu." };
        }

        const records = data as GalleryImageRecord[];

        // ─── Separate storage-path records from those that already have a full URL ────
        // Some older records may store a full https:// URL directly. We skip those.
        const storagePaths = records
            .map((r) => r.output_image_url)
            .filter((url) => !url.startsWith("http"));

        if (storagePaths.length === 0) {
            // All records have full URLs already — nothing to sign
            return { data: records.map((r) => ({ ...r, thumbnail_url: r.output_image_url })), error: null };
        }

        // ─── BATCH CALL: Full-resolution signed URLs (single API call) ──────────────
        const { data: signedFull, error: signErrFull } = await supabase.storage
            .from("outputs")
            .createSignedUrls(storagePaths, SIGNED_URL_TTL_SECONDS);

        if (signErrFull) {
            console.error("Error creating signed URLs:", signErrFull);
            return { data: null, error: "Görseller yüklenirken bir hata oluştu." };
        }

        // ─── Build a lookup map: storagePath → { fullUrl, thumbUrl } ─────────────────
        // Thumbnail URLs reuse the signed URL and append Supabase Image Transformation
        // query params. The transform is applied on the CDN edge when the URL is fetched.
        const urlMap = new Map<string, { fullUrl: string; thumbUrl: string }>();

        storagePaths.forEach((p, i) => {
            const signed = signedFull?.[i]?.signedUrl ?? p;
            const thumb = signed.startsWith("http")
                ? `${signed}&width=400&height=400&resize=cover&quality=75`
                : signed;
            urlMap.set(p, { fullUrl: signed, thumbUrl: thumb });
        });

        // ─── Merge signed URLs back into the records ──────────────────────────────────
        const mappedData: GalleryImageRecord[] = records.map((record) => {
            if (record.output_image_url.startsWith("http")) {
                // Already a full URL — no signing needed
                return { ...record, thumbnail_url: record.output_image_url };
            }

            const pair = urlMap.get(record.output_image_url);
            return {
                ...record,
                output_image_url: pair?.fullUrl ?? record.output_image_url,
                thumbnail_url: pair?.thumbUrl ?? record.output_image_url,
            };
        });

        return { data: mappedData, error: null };
    } catch (e: unknown) {
        console.error("Unexpected error fetching gallery:", e);
        return { data: null, error: "Beklenmeyen bir hata oluştu." };
    }
}
