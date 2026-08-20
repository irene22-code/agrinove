import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('information_schema.key_column_usage').select('*').eq('referenced_table_name', 'plant_health_problems');
  console.log(error); // PostgREST doesn't expose this by default
}
run();
