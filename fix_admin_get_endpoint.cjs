const fs = require('fs');

let file = 'server/controllers/plantHealthController.ts';
let content = fs.readFileSync(file, 'utf8');

const newEndpoint = `
export const getAdminPlantHealthById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('plant_health_problems').select(\`
            *,
            plant_health_problem_types ( name ),
            plant_health_categories ( name ),
            plant_health_images ( * ),
            plant_health_symptoms ( * ),
            plant_health_prevention ( * ),
            plant_health_control_methods ( * ),
            plant_health_videos ( * ),
            plant_health_resources ( * ),
            plant_health_expert_advice ( * ),
            plant_health_sources ( * ),
            plant_health_problem_crops ( crop_id ),
            plant_health_problem_parts ( part_id ),
            plant_health_problem_spread ( spread_method_id )
        \`).eq('id', id).single();
        
        if (error) {
            return res.status(404).json({ error: "Not found", details: error.message });
        }
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};
`;

content += '\n' + newEndpoint;
fs.writeFileSync(file, content);
