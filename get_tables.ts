import { getAdminSupabaseClient } from './server/config/supabase';
const supabase = getAdminSupabaseClient();
async function test() {
    const { data } = await supabase.from('information_schema.tables').select('table_name').eq('table_schema', 'public');
    console.log(data?.map(d => d.table_name).filter(t => t.startsWith('plant_health')));
}
test();
