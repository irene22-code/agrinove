import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.storage.from('plant-health-images').list();
  console.log('Images:', data?.map(d => d.name));
}
run();
