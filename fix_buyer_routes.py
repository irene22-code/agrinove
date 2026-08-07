import re

with open('server/controllers/buyerController.ts', 'r') as f:
    content = f.read()

new_get = """export const getBuyerProfile = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { data: user } = await supabase.from('users').select('*').eq('id', buyer_id).single();
    const { data: buyer } = await supabase.from('buyers').select('*').eq('id', buyer_id).single();
    
    res.status(200).json({ success: true, data: { ...user, ...buyer } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateBuyerProfile = async (req: Request, res: Response) => {"""

content = content.replace("export const updateBuyerProfile = async (req: Request, res: Response) => {", new_get)

with open('server/controllers/buyerController.ts', 'w') as f:
    f.write(content)

with open('server/routes/buyerRoutes.ts', 'r') as f:
    content2 = f.read()

content2 = content2.replace("updateBuyerProfile,", "updateBuyerProfile,\n   getBuyerProfile,")
content2 = content2.replace("router.put('/profile'", "router.get('/profile', requireAuth, requireRole(['buyer']), getBuyerProfile);\nrouter.put('/profile'")

with open('server/routes/buyerRoutes.ts', 'w') as f:
    f.write(content2)

