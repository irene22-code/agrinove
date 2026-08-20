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
  
  const payload = {
    name: "TEST STORAGE DELETE",
    images: [{ image_type: 'Main Image', image_url: 'https://njjkwerijgwzruljjpvg.supabase.co/storage/v1/object/public/plant-health-images/main.jpg', caption: 'Main' }],
    crops: [], parts: [], spread: [], symptoms: [], prevention: [], controls: [], videos: [], resources: [], experts: [], sources: []
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
