import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('plant_health_problems').select('id').eq('id', '4c0321d2-e007-4d94-b343-b01dc973fc89');
  console.log("Check if deleted:", data);
}
run();
