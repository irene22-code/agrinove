import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('plant_health_problems').select('id').limit(1);
  console.log(data);
}
run();
