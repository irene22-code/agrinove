import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.rpc('get_foreign_keys_referencing', { table_name: 'plant_health_problems' });
  console.log(error || data);
}
run();
