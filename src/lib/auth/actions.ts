"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema } from "./schemas";

export type AuthResult = {
    error?: string;
};

export async function loginAction(formData: FormData): Promise<AuthResult> {
    const raw = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Geçersiz giriş bilgileri" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
        return { error: "E-posta veya parola hatalı" };
    }

    redirect("/studio");
}

export async function registerAction(formData: FormData): Promise<AuthResult> {
    const raw = {
        fullName: formData.get("fullName") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
        return { error: parsed.error.issues[0]?.message || "Geçersiz kayıt bilgileri" };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
            data: { full_name: parsed.data.fullName },
        },
    });

    if (error) {
        // Use a generic message — Supabase error messages (e.g. "User already registered")
        // should not be exposed to the client as they reveal internal implementation details.
        console.error("[registerAction]", error.message);
        return { error: "Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin." };
    }

    redirect("/studio");
}

export async function logoutAction(): Promise<void> {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
