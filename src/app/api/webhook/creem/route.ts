import { Webhook } from '@creem_io/nextjs';
import { createClient } from '@supabase/supabase-js';

// ─── Startup guard: fail loudly if required secrets are missing ───────────────
// A missing secret must crash the process, not silently accept all webhooks.
const WEBHOOK_SECRET = process.env.CREEM_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
    // In Next.js edge/serverless, we can't crash the process at module init,
    // so we store the missing flag and 500 on every request instead.
    console.error("[SECURITY BOOT] CREEM_WEBHOOK_SECRET is not set. All webhook requests will be rejected.");
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export const POST = Webhook({
    // ─── FIX #1: No empty-string fallback. Creem SDK will reject every request
    //             if the secret is missing, instead of accepting all of them.
    webhookSecret: WEBHOOK_SECRET ?? "MISSING_SECRET_WILL_REJECT_ALL",

    onGrantAccess: async ({ reason, customer, metadata, id, product }) => {
        console.log(`[Creem Webhook] Granting Access. Reason: ${reason}, Customer: ${customer?.email}`);

        // ─── Guard: secret not configured → reject
        if (!WEBHOOK_SECRET) {
            console.error("[SECURITY] Webhook received but CREEM_WEBHOOK_SECRET is not configured.");
            throw new Error("Webhook secret not configured");
        }

        // ─── Validate required metadata
        const userId = metadata?.userId as string | undefined;
        const creditsStr = metadata?.credits as string | undefined;

        if (!userId || !creditsStr) {
            console.error("[Creem Webhook] Missing metadata (userId or credits).", { userId, creditsStr });
            // Return without throwing — Creem should not retry on bad metadata
            return;
        }

        const creditsToAdd = parseInt(creditsStr, 10);
        if (isNaN(creditsToAdd) || creditsToAdd <= 0) {
            console.error(`[Creem Webhook] Invalid credits value: "${creditsStr}"`);
            return;
        }

        const checkoutId = id;
        const amountInMinorUnit = product?.price || 0;
        const currencyCode = product?.currency || 'TRY';

        // ─── FIX #2 + FIX #3: Single atomic Postgres RPC.
        //     This does idempotency check + payment INSERT + credits UPDATE
        //     in one transaction. If the checkout_id already exists (unique constraint),
        //     the entire function is a no-op. No double-crediting, no partial updates.
        const { error: rpcError } = await supabaseAdmin.rpc('grant_purchase_credits', {
            p_user_id: userId,
            p_checkout_id: checkoutId,
            p_credits: creditsToAdd,
            p_amount: amountInMinorUnit / 100,
            p_currency: currencyCode,
        });

        if (rpcError) {
            // Log and rethrow so Creem retries the webhook
            console.error("[Creem Webhook] RPC grant_purchase_credits failed:", rpcError);
            throw new Error(`Database error: ${rpcError.message}`);
        }

        console.log(`[Creem Webhook] Successfully processed payment ${checkoutId}: +${creditsToAdd} credits → user ${userId}`);
    }
});
