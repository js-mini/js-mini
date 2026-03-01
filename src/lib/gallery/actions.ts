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

        // Map the storage paths to our secure Next.js API proxy route
        // This hides the Supabase URL from the client browser completely.
        const mappedData = data.map((record) => {
            let finalUrl = record.output_image_url;

            // If it's a raw Supabase Storage path (doesn't start with http), proxy it
            if (finalUrl && !finalUrl.startsWith("http")) {
                finalUrl = `/api/images/${record.id}`;
            }

            return {
                ...record,
                output_image_url: finalUrl,
            };
        });

        return { data: mappedData as GalleryImageRecord[], error: null };
    } catch (e: any) {
        console.error("Unexpected error fetching gallery:", e);
        return { data: null, error: "Beklenmeyen bir hata oluştu." };
    }
}
