import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const tables = [
      'plant_health_problem_crops', 'plant_health_problem_parts', 'plant_health_problem_spread',
      'plant_health_images', 'plant_health_symptoms', 'plant_health_prevention', 
      'plant_health_control_methods', 'plant_health_videos', 'plant_health_resources', 
      'plant_health_expert_advice', 'plant_health_sources', 'audit_logs', 'contact_messages'
  ];
  // I will just get all tables in public schema
  const { data, error } = await supabase.rpc('get_tables'); // Or just fetch from a known list
  console.log("Success");
}
run();
