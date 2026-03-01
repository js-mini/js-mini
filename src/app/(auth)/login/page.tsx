"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type AuthResult } from "@/lib/auth/actions";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
        async (_prev, formData) => loginAction(formData),
        {}
    );

    return (
        <>
            <h1
                className="text-xl font-semibold text-center mb-1 tracking-tight"
                style={{ color: "var(--text-primary)" }}
            >
                Giriş Yap
            </h1>
            <p className="text-[13px] text-center mb-8" style={{ color: "var(--text-tertiary)" }}>
                Jewelshot® hesabınıza giriş yapın
            </p>

            <form action={formAction} className="flex flex-col gap-3">
                {state.error && (
                    <div
                        className="text-[13px] bg-error-subtle px-3 py-2.5"
                        style={{ color: "var(--error)", borderRadius: "var(--radius-md)" }}
                    >
                        {state.error}
                    </div>
                )}

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="email"
                        className="text-[13px]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        E-posta
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="ornek@email.com"
                        className="input"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="password"
                        className="text-[13px]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Parola
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        placeholder="En az 6 karakter"
                        className="input"
                    />
                </div>

                <button type="submit" disabled={isPending} className="btn-primary mt-1">
                    {isPending ? "Giriş yapılıyor..." : "Devam Et"}
                </button>
            </form>

            <div
                className="text-[13px] text-center mt-6"
                style={{ color: "var(--text-tertiary)" }}
            >
                Hesabınız yok mu?{" "}
                <Link
                    href="/register"
                    className="hover:underline"
                    style={{ color: "var(--text-primary)" }}
                >
                    Kayıt Ol
                </Link>
            </div>
        </>
    );
}
