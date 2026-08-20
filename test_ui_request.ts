import { getAdminSupabaseClient } from './server/config/supabase.js';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';

const supabase = getAdminSupabaseClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function run() {
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '6890c2ce-f93e-445c-b068-1f1b19cae853';
  const token = jwt.sign({ id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Get first problem that actually exists
  const { data: problem } = await supabase.from('plant_health_problems').select('id, name').limit(1).single();
  
  if (!problem) {
     console.log('No problem found to delete');
     return;
  }
  
  const id = problem.id;
  console.log('Attempting to delete:', problem.name, id);
  
  const delCmd = `curl -v -X DELETE http://localhost:3000/api/admin/plant-health/${id} -H "Authorization: Bearer ${token}"`;
  try {
     const delOut = execSync(delCmd, { stdio: 'pipe' }).toString();
     console.log("Delete out:", delOut);
  } catch (err: any) {
     console.log("Delete failed curl:", err.message);
     console.log("Stdout:", err.stdout?.toString());
     console.log("Stderr:", err.stderr?.toString());
  }
}
run();
