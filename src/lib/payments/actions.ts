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
    if (!process.env.CREEM_API_KEY) {
        // Fallback for development/demonstration if Creem is not set up
        console.warn("CREEM_API_KEY is missing. In a real app, this redirects to checkout.");
        return redirect("/plans?error=missing_api_key");
    }

    try {
        const selectedPackage = PACKAGE_MAP[packageId];

        // Example of a basic Creem.io Quick Checkout integration.
        // It creates a dynamic checkout session for the specific user and amount using REST API.
        const response = await fetch("https://api.creem.io/v1/checkouts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": process.env.CREEM_API_KEY
            },
            body: JSON.stringify({
                product_id: "prod_3ciy062LZ7waMIpaP4DaVg", // Product: Jewelshot® - $1.00/Monthly
                // Custom tracking info to resolve webhook securely
                metadata: {
                    userId: user.id,
                    credits: selectedPackage.credits.toString()
                },
                // The user will be redirected here after success
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/studio?success=true`,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Creem session creation failed:", errorText);
            return redirect("/plans?error=checkout_failed");
        }

        const session = await response.json();

        // Redirect to Creem.io hosted checkout page
        if (session && session.checkout_url) {
            return redirect(session.checkout_url);
        } else if (session && session.url) {
            return redirect(session.url);
        } else {
            console.error("Creem session creation failed, no URL returned:", session);
            // encode the session response to see what we actually got
            const errDetails = encodeURIComponent(JSON.stringify(session).slice(0, 100));
            return redirect(`/plans?error=no_url&details=${errDetails}`);
        }

    } catch (error: any) {
        console.error("Error creating checkout session:", error);
        const errMsg = encodeURIComponent(error?.message || "unknown");
        return redirect(`/plans?error=checkout_error&msg=${errMsg}`);
    }
}
