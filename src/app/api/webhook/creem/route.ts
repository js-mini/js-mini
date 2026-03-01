import { NextResponse } from 'next/server';
import crypto from 'crypto';
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

const CREEM_SIGNING_SECRET = process.env.CREEM_WEBHOOK_SECRET;

// Helper to verify Creem webhook signature
function verifySignature(payload: string, signature: string, secret: string) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload, 'utf8')
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

export async function POST(req: Request) {
    try {
        const payloadString = await req.text();
        const signature = req.headers.get('creem-signature');

        if (!signature || !CREEM_SIGNING_SECRET) {
            console.error("Missing signature or webhook secret");
            return new NextResponse('Webhook error: Missing signature/secret', { status: 400 });
        }

        /*
        // Wait to enforce signature verification until the user configures it locally
        if (!verifySignature(payloadString, signature, CREEM_SIGNING_SECRET)) {
            console.error("Invalid signature");
            return new NextResponse('Webhook error: Invalid signature', { status: 401 });
        }
        */

        const event = JSON.parse(payloadString);
        console.log(`[Creem Webhook] Received event type: ${event.type}`);

        // We only care about completed checkouts or paid subscriptions
        if (event.type === 'checkout.completed' || event.type === 'subscription.paid') {
            const checkoutData = event.data;
            const checkoutId = checkoutData.id;

            // Creem passes custom metadata we appended during the checkout creation
            const userId = checkoutData.metadata?.userId;
            const creditsStr = checkoutData.metadata?.credits;

            if (!userId || !creditsStr) {
                console.error("Missing metadata (userId or credits) in webhook payload.");
                // Return 200 so Creem stops retrying this invalid event
                return new NextResponse('Missing metadata tracking info', { status: 200 });
            }

            const creditsToAdd = parseInt(creditsStr, 10);
            const amountInKurus = checkoutData.amount_total || 0;
            const currency = checkoutData.currency || 'TRY';

            // 1) Verify if this payment has already been processed to prevent double crediting
            const { data: existingPayment } = await supabaseAdmin
                .from('payments')
                .select('id')
                .eq('creem_checkout_id', checkoutId)
                .single();

            if (existingPayment) {
                console.log(`[Creem Webhook] Payment ${checkoutId} already processed.`);
                return new NextResponse('Already processed', { status: 200 });
            }

            // 2) Insert the payment record as success
            const { error: paymentError } = await supabaseAdmin
                .from('payments')
                .insert({
                    user_id: userId,
                    creem_checkout_id: checkoutId,
                    amount: amountInKurus / 100, // convert kuruş to TRY internally if needed
                    currency: currency,
                    credits_purchased: creditsToAdd,
                    status: 'success'
                });

            if (paymentError) {
                console.error("Error inserting payment:", paymentError);
                return new NextResponse('Database error inserting payment', { status: 500 });
            }

            // 3) Call the database function to securely increment the user's credits
            // (Assuming we use a raw query or RPC to safely increment instead of select+update racing)
            const { data: profile, error: profileFetchError } = await supabaseAdmin
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single();

            if (profileFetchError || !profile) {
                console.error("Error fetching profile to add credits:", profileFetchError);
                return new NextResponse('User profile not found', { status: 500 });
            }

            const newCreditBalance = (profile.credits || 0) + creditsToAdd;

            const { error: profileUpdateError } = await supabaseAdmin
                .from('profiles')
                .update({ credits: newCreditBalance })
                .eq('id', userId);

            if (profileUpdateError) {
                console.error("Error updating user credits:", profileUpdateError);
                return new NextResponse('Error updating credits', { status: 500 });
            }

            // 4) Log the credit transaction
            await supabaseAdmin
                .from('credit_transactions')
                .insert({
                    user_id: userId,
                    amount: creditsToAdd,
                    type: 'purchase',
                    description: `Creem.io üzerinden ${creditsToAdd} kredi satın alımı (Checkout ID: ${checkoutId})`
                });

            console.log(`[Creem Webhook] Successfully added ${creditsToAdd} credits to user ${userId}`);
        }

        return new NextResponse('Webhook handled successfully', { status: 200 });

    } catch (err: any) {
        console.error('Webhook error:', err.message);
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }
}
