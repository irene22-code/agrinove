import { getAdminSupabaseClient } from './server/config/supabase';
async function run() {
  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase.rpc('execute_sql', { sql: `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public';
  `});
  console.log("Tables:", data, error);
}
run();
