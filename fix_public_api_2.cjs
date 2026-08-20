const fs = require('fs');
let content = fs.readFileSync('server/controllers/cropCalendarController.ts', 'utf8');

content = content.replace(/export const getRecommendations = async \(req: Request, res: Response\) => \{[\s\S]*?catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: error\.message \}\);\n  \}\n\};/m, 
`export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, season_id, month } = req.query;
    
    let query = supabase.from('crop_calendar_recommendations').select('*, crop_calendar_crops(*)').eq('status', 'published');
    
    if (district_id) query = query.or(\`district_id.eq.\${district_id},district_id.is.null\`);
    if (season_id) query = query.or(\`season_id.eq.\${season_id},season_id.is.null\`);
    if (month) query = query.or(\`month.eq.\${month},month.is.null\`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};`);

content = content.replace(/export const getActivities = async \(req: Request, res: Response\) => \{[\s\S]*?catch \(error: any\) \{[\s\S]*?res\.status\(500\)\.json\(\{ error: error\.message \}\);\n  \}\n\};/m, 
`export const getActivities = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, season_id, month } = req.query;
    
    let query = supabase.from('crop_calendar_activities').select('*, crop_calendar_crops(*)').eq('status', 'published').order('priority', { ascending: false });
    
    if (district_id) query = query.or(\`district_id.eq.\${district_id},district_id.is.null\`);
    if (season_id) query = query.or(\`season_id.eq.\${season_id},season_id.is.null\`);
    if (month) query = query.or(\`month.eq.\${month},month.is.null\`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};`);

fs.writeFileSync('server/controllers/cropCalendarController.ts', content);
console.log("Patched public controller 2");
