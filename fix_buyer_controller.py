import re

with open('server/controllers/buyerController.ts', 'r') as f:
    content = f.read()

new_update = """export const updateBuyerProfile = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { full_name, phone_number, shipping_address } = req.body;
    
    const supabase = getAdminSupabaseClient();
    
    // Update users table for full_name and phone_number
    if (full_name !== undefined || phone_number !== undefined) {
      const updateData: any = {};
      if (full_name !== undefined) updateData.full_name = full_name;
      if (phone_number !== undefined) updateData.phone_number = phone_number;
      await supabase.from('users').update(updateData).eq('id', buyer_id);
    }

    // Update buyers table for buyer-specific fields
    if (shipping_address !== undefined) {
      await supabase.from('buyers').update({
        shipping_address
      }).eq('id', buyer_id);
    }
    
    // fetch updated user profile
    const { data: user } = await supabase.from('users').select('*').eq('id', buyer_id).single();
    const { data: buyer } = await supabase.from('buyers').select('*').eq('id', buyer_id).single();

    res.status(200).json({ success: true, data: { ...user, ...buyer } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const updateBuyerProfile = async.*?res\.status\(400\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};', new_update, content, flags=re.DOTALL)

with open('server/controllers/buyerController.ts', 'w') as f:
    f.write(content)
