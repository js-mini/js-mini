import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import StudioClient from "./studio-client";

export default async function GeneratePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Fetch active prompts
    const { data: prompts } = await supabase
        .from("prompts")
        .select("id, name, description, category, reference_image_url")
        .eq("is_active", true)
        .order("sort_order");

    return (
        <StudioClient prompts={prompts ?? []} />
    );
}
