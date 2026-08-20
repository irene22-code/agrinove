import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('plant_health_problems').select('id, name').eq('id', '77333b5a-7f6b-49f2-b885-e0f7b6cecd21');
  console.log('Record:', data, error);
}
run();
