import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data: d1, error: e1 } = await supabase.storage.createBucket('plant-health-images', { public: true });
  console.log('plant-health-images', d1, e1);
  const { data: d2, error: e2 } = await supabase.storage.createBucket('plant-health-documents', { public: true });
  console.log('plant-health-documents', d2, e2);
}
run();
