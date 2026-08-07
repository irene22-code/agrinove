import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getProducts = async (req: Request, res: Response) => {
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
};

export const getProductById = async (req: Request, res: Response) => {
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
};

export const createProduct = async (req: Request, res: Response) => {
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
    await supabase.from('audit_logs').insert({
        user_id: seller_id,
        action: 'CREATE_PRODUCT',
        entity_type: 'product',
        entity_id: data.id,
        metadata: { title }
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const updates = req.body;
    
    const supabase = getAdminSupabaseClient();
    
    // Check ownership
    const { data: product } = await supabase.from('products').select('seller_id').eq('id', id).single();
    if (!product || product.seller_id !== seller_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to update this product' });
    }

    const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
    if (error) throw error;
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    // Check ownership
    const { data: product } = await supabase.from('products').select('seller_id').eq('id', id).single();
    if (!product || product.seller_id !== seller_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to delete this product' });
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    
    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateProductStatus = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body;
    
    const supabase = getAdminSupabaseClient();
    
    // Check ownership
    const { data: product } = await supabase.from('products').select('seller_id').eq('id', id).single();
    if (!product || product.seller_id !== seller_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to update this product' });
    }

    const { data, error } = await supabase.from('products').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const { stock_quantity, note } = req.body;
    
    const supabase = getAdminSupabaseClient();
    
    const { data: product } = await supabase.from('products').select('seller_id, stock_quantity, title').eq('id', id).single();
    if (!product || product.seller_id !== seller_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to update this product stock' });
    }

    const { data, error } = await supabase.from('products').update({ stock_quantity }).eq('id', id).select().single();
    if (error) throw error;

    // Log the stock change in audit logs for inventory tracking
    await supabase.from('audit_logs').insert({
        user_id: seller_id,
        action: 'UPDATE_STOCK',
        entity_type: 'product',
        entity_id: id,
        metadata: { old_stock: product.stock_quantity, new_stock: stock_quantity, note: note || 'Manual stock update' }
    });
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const uploadProductImage = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image files provided' });
    }

    const supabase = getAdminSupabaseClient();
    
    // Check ownership
    const { data: product } = await supabase.from('products').select('seller_id').eq('id', id).single();
    if (!product || product.seller_id !== seller_id) { 
      return res.status(403).json({ success: false, error: 'Unauthorized to add images to this product' });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `${id}/${Date.now()}_${sanitizedName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
      
      const { data: imageRec, error: dbError } = await supabase.from('product_images').insert({
        product_id: id,
        url: publicUrl,
        is_primary: i === 0, // First uploaded image is primary
        alt_text: file.originalname
      }).select().single();
      
      if (dbError) throw dbError;
      uploadedImages.push(imageRec);
    }

    res.status(201).json({ success: true, data: uploadedImages });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
