import { getAdminSupabaseClient } from './server/config/supabase';

async function check() {
  const supabase = getAdminSupabaseClient();
  const { data: users } = await supabase.from('users').select('id, role');
  console.log('Users:', users);
  
  const { data: sellers } = await supabase.from('sellers').select('id, business_name');
  console.log('Sellers:', sellers);
}

check();
