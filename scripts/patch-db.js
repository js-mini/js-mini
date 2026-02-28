const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addColumn() {
    console.log('Adding reference_image_url column...');
    // Since we can't run raw DDL via the API client easily, we can just suggest the SQL for the user
    // or use the edge function trick
    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log('ALTER TABLE public.prompts ADD COLUMN IF NOT EXISTS reference_image_url TEXT;');
}

addColumn();
