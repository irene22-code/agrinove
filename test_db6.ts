import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data: problems } = await supabase.from('plant_health_problems').select('id, name');
  console.log("Found problems:", problems);
}
run();
