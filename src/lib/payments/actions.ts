"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// Map our internal package IDs to Creem.io Product IDs or define price params
// Note: This requires real Creem Product IDs to function properly in production.
const PACKAGE_MAP: Record<string, { amount: number, credits: number, name: string }> = {
    starter: { amount: 9900, credits: 50, name: "Başlangıç (50 Kredi)" }, // amount in kuruş (99.00 ₺)
    pro: { amount: 24900, credits: 150, name: "Profesyonel (150 Kredi)" },
    premium: { amount: 49900, credits: 400, name: "Kurumsal (400 Kredi)" },
};

import { Creem } from 'creem';

export async function createCheckoutAction(formData: FormData) {
    const packageId = formData.get("packageId") as string;

    if (!packageId || !PACKAGE_MAP[packageId]) {
        return redirect("/plans?error=invalid_package");
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login");
    }

    // Check if API key is configured
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
        console.warn("CREEM_API_KEY is missing. In a real app, this redirects to checkout.");
        return redirect("/plans?error=missing_api_key");
    }

    let redirectUrl = "";

    try {
        const selectedPackage = PACKAGE_MAP[packageId];

        // Creem SDK uses serverIdx: 0 for Production, 1 for Test
        const isTestKey = apiKey.startsWith("creem_test_");

        const creemClient = new Creem({
            apiKey: apiKey,
            serverIdx: isTestKey ? 1 : 0
        });

        // Initialize checkout session using the official SDK
        const session = await creemClient.checkouts.create({
            productId: "prod_3ciy062LZ7waMIpaP4DaVg", // Product: Jewelshot® - $1.00/Monthly
            metadata: {
                userId: user.id,
                credits: selectedPackage.credits.toString()
            },
            successUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/studio?success=true`,
        });

        if (session && session.checkoutUrl) {
            redirectUrl = session.checkoutUrl;
        } else {
            console.error("Creem session creation failed, no URL returned:", session);
            const errDetails = encodeURIComponent(JSON.stringify(session).slice(0, 100));
            redirectUrl = `/plans?error=no_url&details=${errDetails}`;
        }

    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        const errMsg = encodeURIComponent(error?.message || "unknown_error_from_creem");
        redirectUrl = `/plans?error=checkout_error&msg=${errMsg}`;
    }

    // Perform redirect outside of try/catch to prevent NEXT_REDIRECT error
    if (redirectUrl) {
        redirect(redirectUrl);
    }
}
