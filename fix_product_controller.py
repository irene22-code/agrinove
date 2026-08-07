import re

with open('server/controllers/productController.ts', 'r') as f:
    content = f.read()

new_create_product = """export const createProduct = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { 
      category_id, title, description, price, unit_of_measure, stock_quantity, tags,
      sku, brand, weight, dimensions, color, size, material, warranty, status,
      discount, tax_vat, manufacturer, country_of_origin, barcode, delivery_info, return_policy
    } = req.body;
    
    const supabase = getAdminSupabaseClient();
    
    // Verify seller is verified
    const { data: seller } = await supabase.from('sellers').select('status').eq('id', seller_id).single();
    if (seller?.status !== 'verified') { 
      return res.status(403).json({ success: false, error: 'Seller account must be verified to create products.' });
    }

    const { data, error } = await supabase.from('products').insert({
      seller_id,
      category_id,
      title,
      description,
      price,
      unit_of_measure,
      stock_quantity: stock_quantity || 0,
      tags: tags || [],
      sku, brand, weight, dimensions, color, size, material, warranty, 
      status: status || 'active',
      discount, tax_vat, manufacturer, country_of_origin, barcode, delivery_info, return_policy
    }).select().single();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const createProduct = async.*?res\.status\(400\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};', new_create_product, content, flags=re.DOTALL)

with open('server/controllers/productController.ts', 'w') as f:
    f.write(content)
