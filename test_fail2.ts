import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';
import { getAdminSupabaseClient } from './server/config/supabase.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const supabase = getAdminSupabaseClient();

async function run() {
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '6890c2ce-f93e-445c-b068-1f1b19cae853';
  const token = jwt.sign({ id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Let's get an existing problem id
  const { data: problems } = await supabase.from('plant_health_problems').select('id').limit(1);
  if (!problems || problems.length === 0) return;
  const id = problems[0].id;
  
  console.log("Existing ID:", id);
  
  const delCmd = `curl -s -w "\\nHTTP_STATUS:%{http_code}" -X DELETE http://localhost:3000/api/admin/plant-health/${id} -H "Authorization: Bearer ${token}"`;
  const delOut = execSync(delCmd).toString();
  console.log("Delete Response:", delOut);
}
run();
