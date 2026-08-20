const fs = require('fs');
let content = fs.readFileSync('server/controllers/cropCalendarController.ts', 'utf8');

// Replace getAlerts
content = content.replace(/export const getAlerts = async \(req: Request, res: Response\) => \{[\s\S]*?catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: error\.message \}\);\n  \}\n\};/m, 
`export const getAlerts = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, crop_id } = req.query;
    
    let query = supabase.from('crop_calendar_alerts').select('*').eq('status', 'published');
    
    if (district_id) {
      query = query.or(\`district_id.eq.\${district_id},district_id.is.null\`);
    }
    if (crop_id) {
      // Because we already used an .or(), we need to chain properly or just add another .or()
      query = query.or(\`crop_id.eq.\${crop_id},crop_id.is.null\`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};`);

// Replace getBeforePlanting
content = content.replace(/export const getBeforePlanting = async \(req: Request, res: Response\) => \{[\s\S]*?catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: error\.message \}\);\n  \}\n\};/m, 
`export const getBeforePlanting = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, crop_id } = req.query;
    
    let query = supabase.from('crop_calendar_before_planting').select('*').eq('status', 'published');
    
    if (district_id) {
      query = query.or(\`district_id.eq.\${district_id},district_id.is.null\`);
    }
    if (crop_id) {
      query = query.or(\`crop_id.eq.\${crop_id},crop_id.is.null\`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};`);

fs.writeFileSync('server/controllers/cropCalendarController.ts', content);
console.log("Patched public controller");
