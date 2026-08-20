import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('plant_health_images').select('*').limit(10);
  console.log('Images:', data);
}
run();
