import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const id = '53be0f30-c5f0-44f4-b98b-fbad93420a35';
  const childTables = [
      'plant_health_problem_crops', 'plant_health_problem_parts', 'plant_health_problem_spread'
  ];

  for (const table of childTables) {
      const { data, error } = await supabase.from(table).delete().eq('problem_id', id);
      console.log(`Delete from ${table}:`, error ? error.message : 'SUCCESS');
  }
}
run();
