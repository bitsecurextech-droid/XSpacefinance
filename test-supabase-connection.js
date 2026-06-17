const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vpgcxunuijwdxiztysdq.supabase.co';
const supabaseKey = 'sb_publishable_TYx97j5s0xdaYq9V6cowfw_o9oq2wle';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Try to get session
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Supabase connected successfully!');
    }
  } catch (err) {
    console.log('❌ Connection failed:', err.message);
  }
}

test();