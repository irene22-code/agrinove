import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data } = await supabase.rpc('get_foreign_keys').catch(() => ({data: 'RPC not available'}));
  console.log(data);
}
run();
