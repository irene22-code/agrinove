import { getAdminSupabaseClient } from './server/config/supabase.js';

async function run() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.from('plant_health_problems').select('*').limit(1);
  console.log(Object.keys(data?.[0] || {}));
}
run();
