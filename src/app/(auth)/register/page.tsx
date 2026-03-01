"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type AuthResult } from "@/lib/auth/actions";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
        async (_prev, formData) => registerAction(formData),
        {}
    );

    return (
        <>
            <h1
                className="text-xl font-semibold text-center mb-1 tracking-tight"
                style={{ color: "var(--text-primary)" }}
            >
                Kayıt Ol
            </h1>
            <p className="text-[13px] text-center mb-8" style={{ color: "var(--text-tertiary)" }}>
                Yeni bir Jewelshot® hesabı oluşturun
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
                        htmlFor="fullName"
                        className="text-[13px]"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Ad Soyad
                    </label>
                    <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        autoComplete="name"
                        placeholder="Ad Soyad"
                        className="input"
                    />
                </div>

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
                        autoComplete="new-password"
                        placeholder="En az 6 karakter"
                        className="input"
                    />
                </div>

                <button type="submit" disabled={isPending} className="btn-primary mt-1">
                    {isPending ? "Kayıt yapılıyor..." : "Devam Et"}
                </button>
            </form>

            <div
                className="text-[13px] text-center mt-6"
                style={{ color: "var(--text-tertiary)" }}
            >
                Zaten hesabınız var mı?{" "}
                <Link
                    href="/login"
                    className="hover:underline"
                    style={{ color: "var(--text-primary)" }}
                >
                    Giriş Yap
                </Link>
            </div>
        </>
    );
}
