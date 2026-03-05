// Database types matching supabase/schema.sql

export type Profile = {
    id: string;
    full_name: string | null;
    credits: number;
    plan: string;
    created_at: string;
    updated_at: string;
};

export type Prompt = {
    id: string;
    name: string;
    description: string | null;
    template: string;
    category: string;
    reference_image_url: string | null; // used in studio-client prompt selection
    is_active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
};

export type Generation = {
    id: string;
    user_id: string;
    prompt_id: string | null;
    input_image_url: string;
    output_image_url: string | null;
    prompt_text: string;
    status: "pending" | "processing" | "completed" | "failed";
    fal_request_id: string | null; // stored for debugging; not read back by the app
    credits_used: number;
    created_at: string;
};

export type CreditTransaction = {
    id: string;
    user_id: string;
    amount: number;
    type: "purchase" | "usage" | "refund"; // "bonus" removed — never written by the app
    description: string | null;
    reference_id: string | null;
    created_at: string;
};
