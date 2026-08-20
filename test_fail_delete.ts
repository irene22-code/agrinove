import { getAdminSupabaseClient } from './server/config/supabase.js';
import jwt from 'jsonwebtoken';
import { execSync } from 'child_process';

const supabase = getAdminSupabaseClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function run() {
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '6890c2ce-f93e-445c-b068-1f1b19cae853';
  const token = jwt.sign({ id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // Get first problem that actually exists (if any)
  const { data: problem } = await supabase.from('plant_health_problems').select('id').limit(1).single();
  if (problem) {
     const id = problem.id;
     console.log('Attempting to delete existing problem:', id);
     const delCmd = `curl -s -X DELETE http://localhost:3000/api/admin/plant-health/${id} -H "Authorization: Bearer ${token}"`;
     const delOut = execSync(delCmd).toString();
     console.log("Delete out:", delOut);
  }
}
run();
