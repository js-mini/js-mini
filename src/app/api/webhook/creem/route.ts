import { Webhook } from '@creem_io/nextjs';
import { createClient } from '@supabase/supabase-js';

// We need a Service Role key to bypass RLS when updating credits from a webhook
const supabaseAdminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseAdminUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

export const POST = Webhook({
    webhookSecret: process.env.CREEM_WEBHOOK_SECRET || "",

    // This handles both checkout.completed and subscription.paid implicitly 
    // when you use the `onGrantAccess` trigger according to Creem's Next.js adapter.
    // It's much safer than manually parsing the NextRequest stream.
    onGrantAccess: async ({ reason, customer, metadata, id, product }) => {
        console.log(`[Creem Webhook] Granting Access. Reason: ${reason}, Customer: ${customer?.email}`);

        const userId = metadata?.userId as string;
        const creditsStr = metadata?.credits as string;

        if (!userId || !creditsStr) {
            console.error("Missing metadata (userId or credits) in webhook payload.");
            return;
        }

        const creditsToAdd = parseInt(creditsStr, 10);

        // Product is expanded in onGrantAccess
        const amountInKurus = product?.price || 0;
        const currencyCode = product?.currency || 'TRY';
        const checkoutId = id; // The checkkout or subscription ID

        // 1) Verify if this payment has already been processed to prevent double crediting
        const { data: existingPayment } = await supabaseAdmin
            .from('payments')
            .select('id')
            .eq('creem_checkout_id', checkoutId)
            .single();

        if (existingPayment) {
            console.log(`[Creem Webhook] Payment ${checkoutId} already processed.`);
            return;
        }

        // 2) Insert the payment record as success
        const { error: paymentError } = await supabaseAdmin
            .from('payments')
            .insert({
                user_id: userId,
                creem_checkout_id: checkoutId,
                amount: amountInKurus / 100, // convert kuruş to TRY internally
                currency: currencyCode,
                credits_purchased: creditsToAdd,
                status: 'success'
            });

        if (paymentError) {
            console.error("Error inserting payment:", paymentError);
            throw new Error('Database error inserting payment');
        }

        // 3) Call the database function to securely increment the user's credits
        const { data: profile, error: profileFetchError } = await supabaseAdmin
            .from('profiles')
            .select('credits')
            .eq('id', userId)
            .single();

        if (profileFetchError || !profile) {
            console.error("Error fetching profile to add credits:", profileFetchError);
            throw new Error('User profile not found');
        }

        const newCreditBalance = (profile.credits || 0) + creditsToAdd;

        const { error: profileUpdateError } = await supabaseAdmin
            .from('profiles')
            .update({ credits: newCreditBalance })
            .eq('id', userId);

        if (profileUpdateError) {
            console.error("Error updating user credits:", profileUpdateError);
            throw new Error('Error updating credits');
        }

        // 4) Log the credit transaction
        await supabaseAdmin
            .from('credit_transactions')
            .insert({
                user_id: userId,
                amount: creditsToAdd,
                type: 'purchase',
                description: `Creem.io üzerinden ${creditsToAdd} kredi satın alımı (ID: ${checkoutId})`
            });

        console.log(`[Creem Webhook] Successfully added ${creditsToAdd} credits to user ${userId}`);
    }
});
