import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    // Intentionally lenient: enforcing strength here would lock out users
    // who registered before stronger rules took effect.
    password: z.string().min(1, "Parola gereklidir"),
});

export const registerSchema = z.object({
    fullName: z.string().min(2, "Ad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir e-posta adresi girin"),
    password: z.string()
        .min(8, "Parola en az 8 karakter olmalı")
        .regex(/[A-Za-z]/, "Parola en az bir harf içermeli")
        .regex(/[0-9]/, "Parola en az bir rakam içermeli"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
