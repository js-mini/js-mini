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

        // Generate true Cloudfront/Supabase Signed URLs but rely on Next.js Image Optimization
        // to proxy that domain into /_next/image?url=... which is 100x faster and still obscured!
        const mappedData = await Promise.all(
            (data as GalleryImageRecord[]).map(async (record) => {
                let finalUrl = record.output_image_url;
                let thumbUrl = finalUrl;

                if (!finalUrl.startsWith("http")) {
                    // Create a signed URL valid for 1 hour for the High Res Original
                    const { data: signedData } = await supabase.storage
                        .from("outputs")
                        .createSignedUrl(finalUrl, 3600);

                    // Create a compressed 400x400 Signed URL for the lightweight Gallery Thumbnail
                    const { data: thumbData } = await supabase.storage
                        .from("outputs")
                        .createSignedUrl(finalUrl, 3600, {
                            transform: {
                                width: 400,
                                height: 400,
                                resize: 'cover',
                                quality: 75
                            }
                        });


                    if (signedData?.signedUrl) {
                        finalUrl = signedData.signedUrl;
                    }
                    if (thumbData?.signedUrl) {
                        thumbUrl = thumbData.signedUrl;
                    }
                }

                return {
                    ...record,
                    output_image_url: finalUrl,
                    thumbnail_url: thumbUrl,
                };
            })
        );

        return { data: mappedData, error: null };
    } catch (e: any) {
        console.error("Unexpected error fetching gallery:", e);
        return { data: null, error: "Beklenmeyen bir hata oluştu." };
    }
}
