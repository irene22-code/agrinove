const fs = require('fs');

let file = 'server/controllers/plantHealthController.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /export const getPublicPlantHealth = async \(req: Request, res: Response\) => \{[\s\S]*?const \{ data, error \} = await query\.order\('created_at', \{ ascending: false \}\);/m;

const replacement = `export const getPublicPlantHealth = async (req: Request, res: Response) => {
    try {
        const { search, crop_id, type_id, part_id, risk_level, season } = req.query;
        
        let selectString = \`
            id, name, slug, scientific_name, risk_level, short_description, status,
            problem_type_id, category_id, cause_type, cause_description, season,
            plant_health_images ( image_url, image_type ),
            plant_health_problem_types ( name ),
            plant_health_symptoms ( name )
        \`;
        
        if (crop_id) {
            selectString += ', plant_health_problem_crops!inner ( crop_id, plant_health_crops (name) )';
        } else {
            selectString += ', plant_health_problem_crops ( crop_id, plant_health_crops (name) )';
        }
        
        if (part_id) {
            selectString += ', plant_health_problem_parts!inner ( part_id, plant_health_affected_parts (name) )';
        } else {
            selectString += ', plant_health_problem_parts ( part_id, plant_health_affected_parts (name) )';
        }

        let query = supabase.from('plant_health_problems').select(selectString).eq('status', 'Published');
        
        if (search) {
            query = query.or(\`name.ilike.%$\{search}%,scientific_name.ilike.%$\{search}%\`);
        }
        if (crop_id) {
            query = query.eq('plant_health_problem_crops.crop_id', crop_id);
        }
        if (type_id) {
            query = query.eq('problem_type_id', type_id);
        }
        if (part_id) {
            query = query.eq('plant_health_problem_parts.part_id', part_id);
        }
        if (risk_level) {
            query = query.eq('risk_level', risk_level);
        }
        if (season) {
            query = query.eq('season', season);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });`;

content = content.replace(regex, replacement);
fs.writeFileSync(file, content);
