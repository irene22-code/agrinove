import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('information_schema.key_column_usage').select('*').eq('table_name', 'plant_health_problems').limit(5);
  console.log(error || data);
}
run();
