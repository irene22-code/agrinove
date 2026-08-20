import { getAdminSupabaseClient } from './server/config/supabase.js';
const supabase = getAdminSupabaseClient();
async function run() {
  const problem_id = '9a8c6dfb-083b-4471-8733-a615298657b3'; // known existing problem
  
  const { data: currentImages } = await supabase.from('plant_health_images').select('*').eq('problem_id', problem_id);
  console.log('Current images:', currentImages);
  
  const newImages = [
    { image_type: 'Main Image', image_url: 'https://test.com/main.jpg', caption: 'Test Main' },
    { image_type: 'Other', image_url: 'https://test.com/other.jpg', caption: 'Test Other' }
  ];
  
  await supabase.from('plant_health_images').delete().eq('problem_id', problem_id);
  const { data: inserted, error } = await supabase.from('plant_health_images').insert(
    newImages.map(i => ({ ...i, problem_id }))
  ).select();
  
  console.log('Inserted images:', inserted, error);
}
run();
