import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const id = '2019f688-4715-41ea-b864-5b7bfbaaea8e';
  
  // 1. Fetch related files for storage cleanup
  const [imagesRes, videosRes, resourcesRes] = await Promise.all([
      supabase.from('plant_health_images').select('image_url').eq('problem_id', id),
      supabase.from('plant_health_videos').select('thumbnail_url').eq('problem_id', id),
      supabase.from('plant_health_resources').select('file_url').eq('problem_id', id)
  ]);
  
  const filesToDelete: string[] = [];
  const extractPath = (url: string) => {
      if (url && url.includes('/storage/v1/object/public/')) {
          const parts = url.split('/storage/v1/object/public/');
          if (parts.length > 1) {
              const pathWithQuery = parts[1];
              const cleanPath = pathWithQuery.split('?')[0];
              filesToDelete.push(cleanPath);
          }
      }
  };
  
  if (imagesRes.data) imagesRes.data.forEach((img: any) => extractPath(img.image_url));
  if (videosRes.data) videosRes.data.forEach((vid: any) => extractPath(vid.thumbnail_url));
  if (resourcesRes.data) resourcesRes.data.forEach((res: any) => extractPath(res.file_url));
  
  console.log("Files to delete:", filesToDelete);
  
  // 2. Delete child records
  const childTables = [
      'plant_health_problem_crops', 'plant_health_problem_parts', 'plant_health_problem_spread',
      'plant_health_images', 'plant_health_symptoms', 'plant_health_prevention', 
      'plant_health_control_methods', 'plant_health_videos', 'plant_health_resources', 
      'plant_health_expert_advice', 'plant_health_sources'
  ];

  let childErrors: any[] = [];
  for (const table of childTables) {
      const { error } = await supabase.from(table).delete().eq('problem_id', id);
      if (error) {
          console.log(`Error deleting child table ${table}:`, error);
          childErrors.push({ table, error });
      }
  }

  // 3. Delete parent record
  const { data, error } = await supabase.from('plant_health_problems').delete().eq('id', id);
  console.log("Parent delete error:", error);
  console.log("Parent delete data:", data);
}
run();
