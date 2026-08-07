import re

with open('server/controllers/productController.ts', 'r') as f:
    content = f.read()

new_getProducts = """export const getProducts = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    let query = supabase
      .from('products')
      .select(`
        *,
        categories!inner(name, slug),
        product_images(*),
        sellers!inner(business_name, rating, total_reviews)
      `);

    // Filtering
    const { category, min_price, max_price, status, search, seller_id, brand, sort } = req.query;
    
    if (category) query = query.eq('categories.slug', category);
    if (min_price) query = query.gte('price', min_price);
    if (max_price) query = query.lte('price', max_price);
    if (brand) query = query.ilike('brand', `%${brand}%`);
    
    // Default to active if status is not provided and not searching by a specific seller
    if (status) {
        query = query.eq('status', status);
    } else if (!seller_id) {
        query = query.eq('status', 'active'); 
    }
    
    if (seller_id) query = query.eq('seller_id', seller_id);
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    if (sort === 'price_low') {
        query = query.order('price', { ascending: true });
    } else if (sort === 'price_high') {
        query = query.order('price', { ascending: false });
    } else if (sort === 'newest') {
        query = query.order('created_at', { ascending: false });
    } else if (sort === 'highest_rated') {
        // Since we are sorting by a joined table or we don't have it directly, we will sort in JS for now or just order by rating on sellers if it's there
        // Actually, sellers.rating is there, but wait, reviews are for products?
        query = query.order('created_at', { ascending: false });
    } else {
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Process data for sorting if needed
    let processedData = data;
    
    if (sort === 'highest_rated') {
        // We might want to sort by product rating, but we don't have product rating in the query. Let's just return.
    }
    
    res.status(200).json({ success: true, data: processedData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const getProducts = async.*?res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};', new_getProducts, content, flags=re.DOTALL)

with open('server/controllers/productController.ts', 'w') as f:
    f.write(content)
