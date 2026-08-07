import re

with open('server/controllers/productController.ts', 'r') as f:
    content = f.read()

new_get = """export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    // We also fetch reviews
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        sellers(id, business_name, business_description, rating, total_reviews, phone_number, whatsapp_number, address, location, users(full_name, avatar_url)),
        categories(name, slug, parent_id),
        product_images(*),
        reviews(id, rating, comment, created_at, users(full_name, avatar_url))
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Product not found', detail: error.message });
  }
};"""

content = re.sub(r'export const getProductById = async.*?res\.status\(404\)\.json\(\{ success: false, error: \'Product not found\', detail: error\.message \}\);\s*\}\s*\};', new_get, content, flags=re.DOTALL)

with open('server/controllers/productController.ts', 'w') as f:
    f.write(content)
