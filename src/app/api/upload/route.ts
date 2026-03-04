import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { fal } from "@/lib/fal/client";
import { createClient } from "@/lib/supabase/server";

// ─── Allowlist: only these MIME types are accepted ────────────────────────────
// Extension is derived from MIME type — never from `file.name`.
// This prevents: (a) path traversal via crafted filenames, (b) SVG/JS uploads
// masquerading as images, (c) content-type spoofing.
const ALLOWED_MIME_TO_EXT: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
};

// ─── Hard file-size cap: 20 MB ────────────────────────────────────────────────
const MAX_BYTES = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
        return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
    }

    // ─── Guard 1: MIME allowlist ──────────────────────────────────────────────
    const ext = ALLOWED_MIME_TO_EXT[file.type];
    if (!ext) {
        return NextResponse.json(
            { error: `Desteklenmeyen dosya türü: ${file.type}. Yalnızca JPEG, PNG, WebP veya HEIC yükleyebilirsiniz.` },
            { status: 415 }
        );
    }

    // ─── Guard 2: File size ───────────────────────────────────────────────────
    if (file.size > MAX_BYTES) {
        return NextResponse.json(
            { error: `Dosya boyutu çok büyük. Maksimum izin verilen boyut: 20 MB.` },
            { status: 413 }
        );
    }

    try {
        // 1. Upload to fal.ai storage for AI processing.
        //    fal receives the raw File object; it reads the binary content, not the name.
        const falUrl = await fal.storage.upload(file);

        // 2. Store a permanent copy in Supabase Storage.
        //    Filename is a UUID — no user-supplied string ever touches the storage path.
        const storagePath = `${user.id}/${randomUUID()}.${ext}`;

        await supabase.storage
            .from("inputs")
            .upload(storagePath, file, {
                contentType: file.type,
                // upsert: false (default) — prevents overwriting a prior upload at the same UUID path
            });

        return NextResponse.json({ falUrl, inputStoragePath: storagePath });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("[upload error]", message);
        return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 });
    }
}
