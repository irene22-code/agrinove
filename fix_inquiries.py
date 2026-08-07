import re

with open('server/controllers/buyerController.ts', 'r') as f:
    content = f.read()

new_get = """export const getBuyerInquiries = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, products(title), messages(id, sender_id, read_at)')
      .eq('buyer_id', buyer_id);
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const getBuyerInquiries = async.*?res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};', new_get, content, flags=re.DOTALL)

with open('server/controllers/buyerController.ts', 'w') as f:
    f.write(content)
