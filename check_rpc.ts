import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function check() {
    const { data, error } = await supabase.rpc('exec_sql', { query: 'SELECT 1' });
    console.log("exec_sql:", error ? error.message : "Exists", data);
    
    // what if we just list all functions?
    // wait, we can't easily do that without pg.
}
check();
