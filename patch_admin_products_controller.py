import re

with open('server/controllers/adminController.ts', 'r') as f:
    content = f.read()

replacement = """export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, sellers(business_name, phone_number, whatsapp_number, address, location, users!inner(full_name, email)), categories(*), product_images(url, is_primary)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAdminProductStatus = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body; // 'active', 'inactive', 'archived', 'rejected'
    
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('products').update({ status }).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_PRODUCT_STATUS',
        entity_type: 'product',
        entity_id: id,
        metadata: { new_status: status }
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteAdminProduct = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'DELETE_PRODUCT',
        entity_type: 'product',
        entity_id: id,
        metadata: { deleted_product_id: id }
    });

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
"""

content = re.sub(
    r'export const getAdminProducts = async.*?res\.status\(400\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};',
    replacement,
    content,
    flags=re.DOTALL
)

with open('server/controllers/adminController.ts', 'w') as f:
    f.write(content)

with open('server/routes/adminRoutes.ts', 'r') as f:
    routes = f.read()

routes = routes.replace('updateAdminProductStatus,', 'updateAdminProductStatus, deleteAdminProduct,')
routes = routes.replace("router.patch('/products/:id/status', updateAdminProductStatus);", "router.patch('/products/:id/status', updateAdminProductStatus);\nrouter.delete('/products/:id', deleteAdminProduct);")

with open('server/routes/adminRoutes.ts', 'w') as f:
    f.write(routes)
