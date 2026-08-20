import { getAdminSupabaseClient } from './server/config/supabase.js';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const supabase = getAdminSupabaseClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function run() {
  const { data: user } = await supabase.from('users').select('id').limit(1).single();
  const userId = user?.id || '6890c2ce-f93e-445c-b068-1f1b19cae853';
  
  const token = jwt.sign({ id: userId, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
  console.log(token);
}
run();
