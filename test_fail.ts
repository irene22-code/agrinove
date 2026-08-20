import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';
import { getAdminSupabaseClient } from './server/config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const supabase = getAdminSupabaseClient();

async function run() {
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '6890c2ce-f93e-445c-b068-1f1b19cae853';
  const token = jwt.sign({ id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Let's create a problem
  const payload = {
    name: "FAIL DELETE TEST",
    images: [{ image_type: 'Main Image', image_url: 'https://test.co/main.jpg', caption: 'Main' }],
  };
  
  const createCmd = `curl -s -X POST http://localhost:3000/api/admin/plant-health -H "Authorization: Bearer ${token}" -H "Content-Type: application/json" -d '${JSON.stringify(payload)}'`;
  const createOut = execSync(createCmd).toString();
  const id = JSON.parse(createOut).id;
  
  console.log("Created ID:", id);
  if (!id) return;
  
  // Now hit the exact URL the frontend uses.
  const delCmd = `curl -s -w "\\nHTTP_STATUS:%{http_code}" -X DELETE http://localhost:3000/api/admin/plant-health/${id} -H "Authorization: Bearer ${token}"`;
  const delOut = execSync(delCmd).toString();
  console.log("Delete Response:", delOut);
}
run();
