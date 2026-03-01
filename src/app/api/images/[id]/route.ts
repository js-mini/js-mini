import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignore in GET routes
                        }
                    },
                },
            }
        );

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Fetch generation record
        const { data: generation, error: genError } = await supabase
            .from("generations")
            .select("output_image_url")
            .eq("id", id)
            .eq("user_id", user.id)
            .single();

        if (genError || !generation || !generation.output_image_url) {
            return new NextResponse("Not Found", { status: 404 });
        }

        // Download the image from Supabase Storage
        const { data: imageBlob, error: downloadError } = await supabase.storage
            .from("outputs")
            .download(generation.output_image_url);

        if (downloadError || !imageBlob) {
            console.error("Image download error:", downloadError);
            return new NextResponse("Image Not Found", { status: 404 });
        }

        // Return the image data
        const buffer = Buffer.from(await imageBlob.arrayBuffer());

        // Determine content type
        let contentType = "image/png";
        if (generation.output_image_url.endsWith(".jpg") || generation.output_image_url.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        }

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("Error serving image proxy:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
