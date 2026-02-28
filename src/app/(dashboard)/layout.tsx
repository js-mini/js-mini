import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RightSidebar } from "@/components/layout/right-sidebar";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, credits")
        .eq("id", user.id)
        .single();

    return (
        <div className="flex h-dvh overflow-hidden" style={{ backgroundColor: "var(--bg-primary)" }}>
            <Sidebar
                userName={profile?.full_name || user.email?.split("@")[0] || "Kullanıcı"}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header credits={profile?.credits ?? 0} />
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
            <RightSidebar />
        </div>
    );
}
