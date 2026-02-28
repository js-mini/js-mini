import { NextRequest, NextResponse } from "next/server";
import { fal } from "@/lib/fal/client";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
        return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    try {
        // 1. Upload to fal.ai storage (for AI processing)
        const falUrl = await fal.storage.upload(file);

        // 2. Upload to Supabase Storage inputs (for permanent record)
        const ext = file.name.split(".").pop() || "jpg";
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const storagePath = `${user.id}/${baseName}_${Date.now()}.${ext}`;

        await supabase.storage
            .from("inputs")
            .upload(storagePath, file, {
                contentType: file.type,
            });

        // Store the path for DB (private bucket, no public URL)
        const inputStoragePath = storagePath;

        return NextResponse.json({ falUrl, inputStoragePath });
    } catch (err) {
        console.error("[upload error]", err);
        return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
    }
}
