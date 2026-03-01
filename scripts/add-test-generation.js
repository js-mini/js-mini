const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials. Run with node --env-file=.env.local scripts/add-test-generation.js");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addTestGen() {
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

  if (usersError || !users || !users.users || users.users.length === 0) {
    console.error('No users found or error fetching users:', usersError);
    return;
  }

  const userId = users.users[0].id; // Assign to first user

  console.log(`Adding test generations for user: ${userId}`);

  const { data, error } = await supabase.from('generations').insert([
    {
      user_id: userId,
      prompt_id: null,
      input_image_url: 'https://images.unsplash.com/photo-1599643478524-fb66f72a6b5e?w=800&q=80',
      output_image_url: 'https://images.unsplash.com/photo-1599643478524-fb66f72a6b5e?w=800&q=80',
      prompt_text: 'A stunning test gold ring with diamonds',
      status: 'success',
      credits_used: 1
    },
    {
      user_id: userId,
      prompt_id: null,
      input_image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
      output_image_url: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=80',
      prompt_text: 'Elegant silver necklace portrait',
      status: 'success',
      credits_used: 1
    },
    {
      user_id: userId,
      prompt_id: null,
      input_image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      output_image_url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80',
      prompt_text: 'Diamond bracelet macro shot',
      status: 'success',
      credits_used: 1
    }
  ]);

  if (error) {
    console.error('Error adding test generation:', error);
  } else {
    console.log('Added 3 test generations successfully.');
  }
}

addTestGen();
