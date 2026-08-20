import { getAdminSupabaseClient } from './server/config/supabase.js';

async function test() {
  const supabase = getAdminSupabaseClient();
  const { data: m, error: e1 } = await supabase.from('market_prices').select('products(name)');
  console.log('Markets:', m);
  
  const { data: p, error: e2 } = await supabase.from('products').select('name');
  console.log('Products:', p);
}
test();
