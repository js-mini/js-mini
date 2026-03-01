"use server";

import { createClient } from "@/lib/supabase/server";

export type GalleryImageRecord = {
    id: string;
    prompt_text: string;
    output_image_url: string;
    input_image_url: string;
    created_at: string;
};

export async function getRecentGenerations(limit: number = 20): Promise<{ data: GalleryImageRecord[] | null, error: string | null }> {
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
            .eq("status", "completed") // Real app uses 'completed' status, not 'success'
            .not("output_image_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) {
            console.error("Supabase fetch error for gallery:", error);
            return { data: null, error: "Görseller yüklenirken bir hata oluştu." };
        }

        // Map the storage paths to actual full public URLs
        const mappedData = (data as GalleryImageRecord[]).map((record) => {
            // output_image_url is typically 'userid/filename.png'
            // if it already starts with http, leave it alone (e.g. for fallback/test data)
            let finalUrl = record.output_image_url;
            if (!finalUrl.startsWith("http")) {
                const { data: publicUrlData } = supabase.storage.from("outputs").getPublicUrl(finalUrl);
                finalUrl = publicUrlData.publicUrl;
            }

            return {
                ...record,
                output_image_url: finalUrl,
            };
        });

        return { data: mappedData, error: null };
    } catch (e: any) {
        console.error("Unexpected error fetching gallery:", e);
        return { data: null, error: "Beklenmeyen bir hata oluştu." };
    }
}
