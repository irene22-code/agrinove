import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data, error } = await supabase.storage.listBuckets();
  console.log(data, error);
}
run();
