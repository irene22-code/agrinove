import { getAdminSupabaseClient } from './server/config/supabase.js';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';

const supabase = getAdminSupabaseClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function run() {
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '6890c2ce-f93e-445c-b068-1f1b19cae853';
  
  const token = jwt.sign({ id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
  
  const { data: crops } = await supabase.from('plant_health_crops').select('id').limit(1);
  const { data: parts } = await supabase.from('plant_health_affected_parts').select('id').limit(1);
  const { data: spreads } = await supabase.from('plant_health_spread_methods').select('id').limit(1);

  const payload = {
    name: "TEST DELETE FULL",
    images: [{ image_type: 'Main Image', image_url: 'https://test.co/main.jpg', caption: 'Main' }, { image_type: 'Other', image_url: 'https://test.co/other.jpg', caption: 'Other' }],
    crops: crops?.map(c => c.id) || [],
    parts: parts?.map(p => p.id) || [],
    spread: spreads?.map(s => s.id) || [],
    symptoms: [{ description: 'symptom1', image_url: 'https://test.co/symp.jpg' }],
    prevention: [{ description: 'prevent1', image_url: 'https://test.co/prev.jpg' }],
    controls: [{ control_type: 'Chemical', name: 'Control1', description: 'desc' }],
    videos: [{ title: 'video1', video_url: 'https://youtube.com', description: 'vid', thumbnail_url: 'https://test.co/thumb.jpg' }],
    resources: [{ title: 'res1', description: 'res', resource_type: 'PDF', file_url: 'https://test.co/res.pdf', source: 'src' }],
    experts: [{ expert_name: 'John', organization: 'Org', advice: 'advice' }],
    sources: [{ title: 'source1', url: 'https://google.com' }]
  };
  
  const createCmd = `curl -s -X POST http://localhost:3000/api/admin/plant-health -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`;
  const createOut = execSync(createCmd).toString();
  console.log("Create:", createOut);
  
  const id = JSON.parse(createOut).id;
  if (id) {
     const delCmd = `curl -s -X DELETE http://localhost:3000/api/admin/plant-health/${id} -H "Authorization: Bearer ${token}"`;
     const delOut = execSync(delCmd).toString();
     console.log("Delete:", delOut);
  }
}
run();
