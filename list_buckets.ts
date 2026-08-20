import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  console.log(buckets?.map(b => b.name));
}
run();
