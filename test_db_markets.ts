import { getAdminSupabaseClient } from './server/config/supabase.js';
async function test() {
  const supabase = getAdminSupabaseClient();
  const { data: m } = await supabase.from('markets').select('*').limit(1);
  console.log('Markets:', m ? Object.keys(m[0] || {}) : 'null');
}
test();
