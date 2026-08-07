import re

with open('server/controllers/buyerController.ts', 'r') as f:
    content = f.read()

# Fix getFavorites
get_favorites_new = """export const getFavorites = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        product_id, created_at,
        products (*, product_images(url, is_primary))
      `)
      .eq('user_id', buyer_id);
      
    if (error) throw error;
    
    // Map product_id to id for frontend compatibility
    const mappedData = data.map(item => ({
      id: item.product_id,
      product_id: item.product_id,
      created_at: item.created_at,
      products: item.products
    }));
    
    res.status(200).json({ success: true, data: mappedData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const getFavorites = async.*?\}\s*\};', get_favorites_new, content, flags=re.DOTALL, count=1)


# Fix addFavorite
add_favorite_new = """export const addFavorite = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { product_id } = req.body;
    
    if (!product_id) return res.status(400).json({ success: false, error: 'product_id is required' });

    const supabase = getAdminSupabaseClient();

    // Check if it already exists
    const { data: existing } = await supabase.from('favorites').select('product_id').eq('user_id', buyer_id).eq('product_id', product_id).single();
    if (existing) {
      return res.status(200).json({ success: true, message: 'Already in favorites', data: existing });
    }

    const { data, error } = await supabase.from('favorites').insert({
      user_id: buyer_id,
      product_id
    }).select().single();
      
    if (error) throw error;

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const addFavorite = async.*?\}\s*\};', add_favorite_new, content, flags=re.DOTALL, count=1)


# Fix removeFavorite
remove_favorite_new = """export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { id } = req.params; // this is actually product_id because of our frontend change
    
    const supabase = getAdminSupabaseClient();
    
    const { error } = await supabase.from('favorites').delete().eq('product_id', id).eq('user_id', buyer_id);
      
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const removeFavorite = async.*?\}\s*\};', remove_favorite_new, content, flags=re.DOTALL, count=1)

with open('server/controllers/buyerController.ts', 'w') as f:
    f.write(content)
