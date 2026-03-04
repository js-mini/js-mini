-- ============================================
-- Jewelshot® — SECURITY PATCH 
-- Run this in Supabase SQL Editor to secure the database
-- ============================================

-- 1. REVOKE DANGEROUS CLIENT POLICIES
-- Drop the policy that allows users to freely update their own profiles (including credits/plan)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Instead, only allow users to update insensitive fields (optional, but safer to do via server action)
-- We will rely on server actions (Service Role key) to update credits/plans

-- Drop policies that allow users to forge generation records from the client
DROP POLICY IF EXISTS "Users can insert own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can update own generations" ON public.generations;

-- Fix missing policy for credit_transactions (Optional since we will use Service Role to insert anyway)
-- But ensuring read-only is good practice
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.credit_transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.credit_transactions;


-- 2. CREATE SECURE, ATOMIC CREDIT DEDUCTION RPC (STORED PROCEDURE)
-- This function executes atomically on the PostgreSQL server, preventing race conditions.
-- It locks the user profile row, checks if credits > 0, deducts 1 credit, creates the generation record, 
-- and logs the transaction. 

CREATE OR REPLACE FUNCTION public.deduct_user_credit(
    p_user_id uuid,
    p_prompt_id uuid,
    p_input_image_url text,
    p_prompt_text text,
    p_prompt_name text,
    p_credit_amount integer DEFAULT 1
)
RETURNS uuid -- Returns the ID of the new generation record
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges
AS $$
DECLARE
    v_current_credits integer;
    v_new_generation_id uuid;
BEGIN
    -- Step A: Atomically lock the user's profile row to prevent race conditions
    SELECT credits INTO v_current_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Step B: Check for sufficient balance
    IF v_current_credits < p_credit_amount THEN
        RAISE EXCEPTION 'Insufficient credits';
    END IF;

    -- Step C: Deduct credits dynamically based on resolution
    UPDATE public.profiles
    SET credits = credits - p_credit_amount
    WHERE id = p_user_id;

    -- Step D: Insert the generation record (started as 'processing')
    INSERT INTO public.generations (
        user_id, 
        prompt_id, 
        input_image_url, 
        prompt_text, 
        status, 
        credits_used
    ) VALUES (
        p_user_id, 
        p_prompt_id, 
        p_input_image_url, 
        p_prompt_text, 
        'processing',
        p_credit_amount
    ) RETURNING id INTO v_new_generation_id;

    -- Step E: Insert the credit transaction log
    INSERT INTO public.credit_transactions (
        user_id,
        amount,
        type,
        description,
        reference_id
    ) VALUES (
        p_user_id,
        -p_credit_amount,
        'usage',
        'Görsel üretimi: ' || p_prompt_name,
        v_new_generation_id::text
    );

    -- Return the generation ID so the server can proceed
    RETURN v_new_generation_id;
END;
$$;


-- 3. ATOMIC PURCHASE CREDIT GRANT (called from Creem.io webhook)
-- ─────────────────────────────────────────────────────────────────────────────
-- This function is called by the Creem webhook handler instead of the previous
-- non-atomic SELECT+UPDATE pattern.
--
-- It solves three problems simultaneously in one Postgres transaction:
--   a) Idempotency: the UNIQUE constraint on payments.creem_checkout_id means
--      a duplicate webhook event is a no-op (INSERT ... ON CONFLICT DO NOTHING).
--   b) Race condition: credits are updated with an atomic `credits + p_credits`
--      expression — no read-compute-write pattern.
--   c) Split transaction: payment record insert and credit update happen in the
--      same transaction; if either fails, both roll back.
--
-- Run this in Supabase SQL Editor side-by-side with deduct_user_credit above.

CREATE OR REPLACE FUNCTION public.grant_purchase_credits(
    p_user_id   uuid,
    p_checkout_id text,
    p_credits   integer,
    p_amount    numeric DEFAULT 0,
    p_currency  text    DEFAULT 'USD'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inserted boolean := false;
BEGIN
    -- Step A: Insert payment record.
    --   ON CONFLICT DO NOTHING makes this idempotent: if the same checkout_id
    --   arrives twice, the second call is a silent no-op and credits are NOT doubled.
    INSERT INTO public.payments (
        user_id,
        creem_checkout_id,
        amount,
        currency,
        credits_purchased,
        status
    ) VALUES (
        p_user_id,
        p_checkout_id,
        p_amount,
        p_currency,
        p_credits,
        'success'
    )
    ON CONFLICT (creem_checkout_id) DO NOTHING;

    -- Step B: Only proceed if the INSERT actually created a new row.
    --   GET DIAGNOSTICS lets us check whether ON CONFLICT fired.
    GET DIAGNOSTICS v_inserted = ROW_COUNT;
    IF NOT v_inserted THEN
        RAISE NOTICE 'grant_purchase_credits: checkout % already processed, skipping.', p_checkout_id;
        RETURN;
    END IF;

    -- Step C: Atomically increment credits — no SELECT needed.
    UPDATE public.profiles
    SET credits = credits + p_credits
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile % not found', p_user_id;
    END IF;

    -- Step D: Log the credit transaction.
    INSERT INTO public.credit_transactions (
        user_id,
        amount,
        type,
        description,
        reference_id
    ) VALUES (
        p_user_id,
        p_credits,
        'purchase',
        'Creem.io satın alımı: ' || p_credits || ' kredi (' || p_checkout_id || ')',
        p_checkout_id
    );
END;
$$;


-- 4. ATOMIC CREDIT REFUND RPC
-- ─────────────────────────────────────────────────────────────────────────────
-- Called from studio/actions.ts when a fal.ai generation fails.
-- Replaces the old non-atomic:
--   SELECT credits → credits + amount → UPDATE
-- with a single, lock-free, atomic expression:
--   UPDATE profiles SET credits = credits + p_amount
-- No row-level read is needed, so there is zero race condition window.

CREATE OR REPLACE FUNCTION public.refund_user_credit(
    p_user_id       uuid,
    p_credit_amount integer,
    p_generation_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atomic add — no SELECT required
    UPDATE public.profiles
    SET credits = credits + p_credit_amount
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'refund_user_credit: user % not found', p_user_id;
    END IF;

    -- Audit log
    INSERT INTO public.credit_transactions (
        user_id,
        amount,
        type,
        description,
        reference_id
    ) VALUES (
        p_user_id,
        p_credit_amount,
        'refund',
        'Başarısız üretim iadesi',
        p_generation_id::text
    );
END;
$$;


-- 5. GENERATIONS STATUS CHECK CONSTRAINT
-- ─────────────────────────────────────────────────────────────────────────────
-- Enforces that generations.status can only ever be one of the four known values.
-- Without this, any string can be written to the column — a bug or a compromised
-- server action could set status to an arbitrary value, breaking queries that
-- filter on status (e.g. gallery fetches "completed" only).
--
-- This constraint is safe to add on an existing table: Postgres validates all
-- existing rows in a single scan before applying the constraint, so if any row
-- already has an invalid status this will raise an error (revealing the bad data).
--
-- NOTE: This is a database-level migration step. Run once in Supabase SQL Editor.
-- The IF NOT EXISTS guard makes re-running this script idempotent.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'generations'
          AND constraint_name = 'generations_status_check'
    ) THEN
        ALTER TABLE public.generations
        ADD CONSTRAINT generations_status_check
        CHECK (status IN ('pending', 'processing', 'completed', 'failed'));

        RAISE NOTICE 'generations_status_check constraint added.';
    ELSE
        RAISE NOTICE 'generations_status_check already exists, skipping.';
    END IF;
END;
$$;
