import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.from('information_schema.tables').select('*');
  console.log(error); // Supabase REST API doesn't expose information_schema
}
run();
