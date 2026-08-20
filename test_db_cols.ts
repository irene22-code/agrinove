import { getAdminSupabaseClient } from './server/config/supabase.js';

async function test() {
  const supabase = getAdminSupabaseClient();
  const { data: p } = await supabase.from('products').select('*').limit(1);
  console.log('Products:', p ? Object.keys(p[0] || {}) : 'null');
  
  const { data: m } = await supabase.from('market_prices').select('*').limit(1);
  console.log('Market Prices:', m ? Object.keys(m[0] || {}) : 'null');
}
test();
