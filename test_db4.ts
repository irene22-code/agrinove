import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const { data: problems } = await supabase.from('plant_health_problems').select('id, name');
  if (!problems || problems.length === 0) {
      console.log("No problems");
      return;
  }
  const id = problems[0].id;
  console.log("Testing child deletes for:", id);
  
  const childTables = [
      'plant_health_problem_crops', 'plant_health_problem_parts', 'plant_health_problem_spread',
      'plant_health_images', 'plant_health_symptoms', 'plant_health_prevention', 
      'plant_health_control_methods', 'plant_health_videos', 'plant_health_resources', 
      'plant_health_expert_advice', 'plant_health_sources'
  ];

  for (const table of childTables) {
      const { data, error } = await supabase.from(table).select('id').eq('problem_id', id).limit(1);
      if (error) {
          console.log(`Error querying ${table}:`, error.message);
      } else {
          console.log(`${table}: ${data.length} records`);
      }
  }
}
run();
