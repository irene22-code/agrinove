import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data: problems } = await supabase.from('plant_health_problems').select('id, name');
  console.log("Problems:", problems);
  
  if (!problems || problems.length === 0) return;
  const id = problems[0].id;
  
  // Try to delete parent WITHOUT deleting children!
  const { error } = await supabase.from('plant_health_problems').delete().eq('id', id);
  console.log("Error deleting parent directly:", error);
}
run();
