import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
    const { data, error } = await supabase.from('plant_health_problems').select('*').limit(1);
    console.log("plant_health_problems:", error ? error.message : "Exists");
}
check();
