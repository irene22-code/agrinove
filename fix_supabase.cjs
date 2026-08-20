const fs = require('fs');

let file = 'server/controllers/plantHealthController.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("import { supabase } from '../config/supabase';", "import { getAdminSupabaseClient } from '../config/supabase';\nconst supabase = getAdminSupabaseClient();");

fs.writeFileSync(file, content);
