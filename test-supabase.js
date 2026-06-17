import { supabase } from './config/supabase.js'

async function test() {
  console.log('🔌 Testing Supabase connection...')
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('count')
  
  if (error) {
    console.error('❌ Error:', error.message)
  } else {
    console.log('✅ Supabase connected successfully!')
  }
}

test()