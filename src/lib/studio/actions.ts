"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { fal } from "@/lib/fal/client";
import * as fs from "fs/promises";
import * as path from "path";

export type GenerateResult = {
    error?: string;
    generationId?: string;
    outputUrl?: string;
};

export type GenerateOptions = {
    falImageUrl: string;
    additionalFalImageUrls?: string[];
    guideImageUrl?: string;
    inputStorageUrl: string;
    promptId: string;
    aspectRatio: string;
    resolution: string;
    outputFormat: string;
    originalFileName: string;
    engravingText: string;
    category: string;
    metalColor?: "orijinal" | "8k_sari" | "14k_sari" | "18k_sari" | "22k_sari" | "beyaz" | "rose";
};

export async function generateAction(options: GenerateOptions): Promise<GenerateResult> {
    const { falImageUrl, additionalFalImageUrls, guideImageUrl, inputStorageUrl, promptId, aspectRatio, resolution, outputFormat, originalFileName, engravingText, category, metalColor } = options;
    const supabase = await createClient();
    const adminClient = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", user.id)
        .single();

    const creditCost = resolution === "4K" ? 2 : 1;

    if (!profile || profile.credits < creditCost) {
        return { error: `Yeterli krediniz yok. Bu işlem için ${creditCost} kredi gereklidir.` };
    }

    if (!falImageUrl) return { error: "Lütfen bir fotoğraf yükleyin." };
    if (!promptId) return { error: "Lütfen bir stil seçin." };

    const { data: prompt } = await supabase
        .from("prompts")
        .select("template, name, reference_image_url")
        .eq("id", promptId)
        .single();

    if (!prompt) return { error: "Seçilen stil bulunamadı." };

    // Build final prompt
    let finalPrompt = prompt.template;

    // Hardcode extreme clarity and gemstone preservation, with strict instructions NOT to add hallucinated stones.
    const clarityInstruction = "\n\nCRITICAL QUALITY REQUIREMENT: The image must be rendered in flawless 8K ultra-HD macro photography style. DO NOT ADD OR INVENT ANY NEW GEMSTONES if they do not exist in the original input image. If the original jewelry is plain metal, keep it plain metal. HOWEVER, IF gemstones, diamonds, or colored stones ARE present in the original design, they MUST be terrifyingly sharp, crystal clear, and flawlessly defined. Every single facet, facet arrangement, and edge must be perfectly crisp and geometrically distinct. Maximize internal reflections, fire, and brilliance without overexposing. If there are colored gemstones, PRESERVE their exact original color saturation perfectly while maximizing light return and depth. The final render must look like a multi-million-dollar high-end macro advertisement shot on an 85mm macro lens with focus stacking. Zero blur, zero softness on the stones.";
    finalPrompt += clarityInstruction;

    // Handle engraving for rings
    if (category === 'yuzuk') {
        const engravingInstruction = engravingText.trim()
            ? `The inside of the ring band has a very small, delicate engraving reading "${engravingText.trim()}" in a fine, miniature serif font typical of real jewelry engraving. The text must be subtly etched into the metal at a very small scale, as seen in authentic hand-engraved rings.`
            : 'The inside of the ring band should be clean with no text or engravings visible.';
        finalPrompt = finalPrompt.replace('{{ENGRAVING}}', engravingInstruction);
    }

    // Handle metal color
    if (metalColor) {
        let colorInstruction = "";
        switch (metalColor) {
            case "orijinal":
                colorInstruction = "\n\nCRITICAL METAL COLOR: PRESERVE EXACT ORIGINAL METAL COLOR. Do NOT artificially change the metal color to yellow gold, white gold, or rose gold if it is not already that color. Extract the exact metal hue, saturation, and lightness directly from the input image and reproduce it faithfully. The resulting jewelry MUST match the original metal tone perfectly.";
                break;
            case "8k_sari":
                colorInstruction = "\n\nCRITICAL METAL COLOR: The jewelry piece MUST be made of authentic 8K Yellow Gold. The metal must have a pale, subtle yellow-gold hue. Do not use white gold, rose gold, brass, or overly saturated yellow tones.";
                break;
            case "14k_sari":
                colorInstruction = "\n\nCRITICAL METAL COLOR: The jewelry piece MUST be made of authentic 14K Yellow Gold. The metal must have a classic, bright yellow-gold hue. Do not use white gold, rose gold, or overly rich/orange 24K tones.";
                break;
            case "18k_sari":
                colorInstruction = "\n\nCRITICAL METAL COLOR: The jewelry piece MUST be made of authentic 18K Yellow Gold. The metal must have a rich, warm, deep yellow-gold hue typical of high-end 18K jewelry. Do not use white gold or rose gold tones.";
                break;
            case "22k_sari":
                colorInstruction = "\n\nCRITICAL METAL COLOR: The jewelry piece MUST be made of authentic 22K Yellow Gold. The metal must have a very rich, highly saturated, warm, buttery yellow-gold hue. Do not use white gold, rose gold, or pale yellow tones.";
                break;
            case "beyaz":
                colorInstruction = "\n\nCRITICAL METAL COLOR: The jewelry piece MUST be made of brilliant White Gold or Platinum. The metal must have a clean, cool, silvery-white hue without any warm, yellow, or brassy undertones.";
                break;
            case "rose":
                colorInstruction = "\n\nCRITICAL METAL COLOR: The jewelry piece MUST be made of authentic Rose Gold. The metal must have a distinct, warm pinkish-copper hue typical of high-end rose gold jewelry.";
                break;
        }
        finalPrompt += colorInstruction;
    }

    // Build image_urls array: [styleReference, mainImage, ...additionalImages]
    const imageUrls: string[] = [];

    // 1. Determine which guide/reference image to use
    // If the user uploaded a custom guide line, it overrides the prompt's default reference image
    if (guideImageUrl) {
        imageUrls.push(guideImageUrl);
    } else if (prompt.reference_image_url) {
        if (prompt.reference_image_url.startsWith("/")) {
            // Local file needs to be uploaded to fal.ai storage first
            try {
                const filePath = path.join(process.cwd(), "public", prompt.reference_image_url);
                const fileBuffer = await fs.readFile(filePath);
                // Create a File object-like structure that fal.storage.upload can use
                const blob = new Blob([fileBuffer]);
                const fileToUpload = new File([blob], path.basename(filePath), { type: "image/png" });
                const uploadedUrl = await fal.storage.upload(fileToUpload);
                imageUrls.push(uploadedUrl);
            } catch (err) {
                console.error("Failed to read/upload local reference image:", err);
                return { error: "Referans görseli (local test) fal.ai'ye yüklenemedi." };
            }
        } else {
            // Already a public URL
            imageUrls.push(prompt.reference_image_url);
        }
    }

    // 2. Add the main product image
    imageUrls.push(falImageUrl);

    // 3. Add any additional detail images
    if (additionalFalImageUrls?.length) {
        imageUrls.push(...additionalFalImageUrls);
    }

    // SECURE ATOMIC TRANSACTION: Call the Postgres RPC to deduct credits,
    // lock the row, insert the generation record, and log the transaction securely.
    const { data: generationId, error: rpcError } = await supabase.rpc('deduct_user_credit', {
        p_user_id: user.id,
        p_prompt_id: promptId,
        p_input_image_url: inputStorageUrl,
        p_prompt_text: finalPrompt,
        p_prompt_name: prompt.name,
        p_credit_amount: creditCost
    });

    if (rpcError || !generationId) {
        console.error("[RPC Error]", rpcError);
        return { error: "Yetersiz kredi veya üretim başlatılamadı." };
    }

    try {
        const result = await fal.subscribe("fal-ai/nano-banana-pro/edit" as Parameters<typeof fal.subscribe>[0], {
            input: {
                prompt: finalPrompt,
                image_urls: imageUrls,
                aspect_ratio: aspectRatio || "auto",
                resolution: resolution || "1K",
                output_format: outputFormat || "png",
                num_images: 1,
            },
        });

        const data = result.data as { images?: { url: string }[] };
        const outputUrl = data?.images?.[0]?.url;

        if (!outputUrl) {
            await adminClient.from("generations").update({ status: "failed" }).eq("id", generationId);
            return { error: "Görsel üretimi başarısız oldu." };
        }

        // Download output from fal.ai and save to Supabase Storage
        const outputResponse = await fetch(outputUrl);
        const outputBlob = await outputResponse.blob();

        // Build filename: originalname_edited_timestamp.ext
        const ext = outputFormat || "png";
        const baseName = originalFileName
            ? originalFileName.replace(/\.[^.]+$/, "")
            : `image`;
        const storagePath = `${user.id}/${baseName}_edited_${Date.now()}.${ext}`;

        const { error: storageError } = await supabase.storage
            .from("outputs")
            .upload(storagePath, outputBlob, {
                contentType: `image/${ext === "jpg" ? "jpeg" : ext}`,
                upsert: true,
            });

        let finalUrl = outputUrl;
        if (storageError) {
            console.error("[storage upload error]", storageError.message);
        } else {
            // Create a signed URL (1 hour)
            const { data: signedData } = await supabase.storage
                .from("outputs")
                .createSignedUrl(storagePath, 3600);
            if (signedData?.signedUrl) {
                finalUrl = signedData.signedUrl;
            }
        }

        // Store storage path in DB (not the signed URL — signed URLs expire)
        await adminClient
            .from("generations")
            .update({
                output_image_url: storagePath,
                status: "completed",
            })
            .eq("id", generationId);

        return { generationId, outputUrl: finalUrl };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        const body = (err as Record<string, unknown>)?.body;
        console.error("[fal.ai error]", message, body ? JSON.stringify(body, null, 2) : "");

        await adminClient.from("generations").update({ status: "failed" }).eq("id", generationId);

        // Atomic refund via RPC — replaces the old non-atomic SELECT + UPDATE pattern.
        // This single Postgres function updates credits with `credits + amount` expression
        // (no read, no race window) and inserts the audit log in the same transaction.
        const { error: refundError } = await supabase.rpc("refund_user_credit", {
            p_user_id: user.id,
            p_credit_amount: creditCost,
            p_generation_id: generationId,
        });

        if (refundError) {
            console.error("[CRITICAL] Credit refund RPC failed:", refundError);
            // Don't swallow — the amount is lost if we don't alert
        }

        return { error: "Görsel üretilirken bir hata oluştu. Krediniz iade edildi." };
    }
}
