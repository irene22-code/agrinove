import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

// ---------------------------
// Dashboard & Analytics
// ---------------------------
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();

    const [
      { count: usersCount },
      { count: buyersCount },
      { count: sellersCount },
      { count: productsCount },
      { count: activeProductsCount },
      { count: ordersCount },
      { count: categoriesCount },
      { count: reviewsCount },
      { count: inquiriesCount },
      { count: pendingSellersCount },
      { count: pendingOrdersCount },
      { data: paidOrders },
      { data: recentOrders },
      { data: recentUsers },
      { data: recentSellers },
      { data: recentProducts }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('buyers').select('*', { count: 'exact', head: true }),
      supabase.from('sellers').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('categories').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('inquiries').select('*', { count: 'exact', head: true }),
      supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending'),
      supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
      supabase.from('orders').select('*, buyers(users(full_name)), sellers(business_name)').order('created_at', { ascending: false }).limit(5),
      supabase.from('users').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('sellers').select('*, users(full_name, email)').order('created_at', { ascending: false }).limit(5),
      supabase.from('products').select('*, sellers(business_name)').order('created_at', { ascending: false }).limit(5)
    ]);

    const totalRevenue = (paidOrders || []).reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);

    res.status(200).json({
      success: true,
      data: {
        users: { total: usersCount, buyers: buyersCount, sellers: sellersCount, recent: recentUsers },
        products: { total: productsCount, active: activeProductsCount, recent: recentProducts },
        orders: { total: ordersCount, pending: pendingOrdersCount, recent: recentOrders },
        categories: { total: categoriesCount },
        reviews: { total: reviewsCount },
        inquiries: { total: inquiriesCount, unread: 0 },
        sellers: { pending: pendingSellersCount, recent: recentSellers },
        revenue: { total: totalRevenue }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ---------------------------
// User Management
// ---------------------------
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    const supabase = getAdminSupabaseClient();
    let query = supabase.from('users').select('*').neq('status', 'deleted').order('created_at', { ascending: false });
    
    if (role) query = query.eq('role', role);
    
    const { data, error } = await query;
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const verifySeller = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body; // 'verified', 'rejected', 'suspended'
    
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('sellers').update({ status }).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'VERIFY_SELLER',
        entity_type: 'seller',
        entity_id: id,
        metadata: { new_status: status }
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('users').update({ status }).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_USER_ROLE',
        entity_type: 'user',
        entity_id: id,
        metadata: { new_status: status }
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// Product Management
// ---------------------------
export const getAdminProducts = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, sellers(business_name, phone_number, whatsapp_number, address, location, users!inner(full_name, email)), categories(*), product_images(url, is_primary)').neq('status', 'archived')
      .neq('status', 'archived')
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
    // Try to delete, if fails due to foreign key, then soft delete
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      if (error.code === '23503') { // foreign_key_violation
         const { error: softErr } = await supabase.from('products').update({ status: 'archived' }).eq('id', id);
         if (softErr) throw softErr;
      } else {
         throw error;
      }
    }
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'DELETE_PRODUCT',
        entity_type: 'product',
        entity_id: id,
        metadata: { deleted_product_id: id, method: error ? 'soft' : 'hard' }
    });
    
    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// ---------------------------
// Category Management
// ---------------------------
export const getAdminCategories = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { name, slug, description, image_url, parent_id } = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').insert({ name, slug, description, image_url, parent_id }).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'CREATE_CATEGORY',
        entity_type: 'category',
        entity_id: data.id,
        metadata: { category_name: name }
    });

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const updates = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_CATEGORY',
        entity_type: 'category',
        entity_id: id,
        metadata: { updates }
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    // Check if products reference this category
    const { count, error: countError } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('category_id', id);
    if (countError) throw countError;
    if (count && count > 0) {
        return res.status(400).json({ success: false, error: 'Cannot delete category because it has products associated with it. Please move the products to another category first.' });
    }

    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'DELETE_CATEGORY',
        entity_type: 'category',
        entity_id: id,
        metadata: { deleted_category_id: id }
    });

    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};




// ---------------------------
// Order & Interaction Management
// ---------------------------
export const getAdminOrders = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyers(users(full_name)), sellers(business_name, phone_number, whatsapp_number, location, address, users(full_name, email)), order_items(quantity, unit_price, subtotal, products(title, brand, sku, product_images(url, is_primary), categories(name)))')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ---------------------------
// System Settings
// ---------------------------
export const getSettings = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('system_settings').select('*');
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { key, value } = req.body;
    const supabase = getAdminSupabaseClient();
    
    if (!key || !value) throw new Error("Key and value are required");
    
    // Validation
    if (key === 'delivery') {
        if (Number(value.defaultDeliveryFee) < 0) throw new Error("Delivery fee cannot be negative");
        if (Number(value.freeDeliveryThreshold) < 0) throw new Error("Free delivery threshold cannot be negative");
        if (Number(value.estimatedDeliveryDays) < 0) throw new Error("Estimated delivery days cannot be negative");
    }
    if (key === 'orders') {
        if (Number(value.cancellationWindowHours) < 0) throw new Error("Cancellation window cannot be negative");
    }
    if (key === 'content') {
        if (value.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.contactEmail)) {
            throw new Error("Invalid contact email");
        }
    }
    if (key === 'platform') {
        if (value.supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.supportEmail)) {
            throw new Error("Invalid support email");
        }
    }
    
    // UPSERT pattern
    const { data, error } = await supabase.from('system_settings').upsert({ key, value }, { onConflict: 'key' }).select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_SYSTEM_SETTING',
        entity_type: 'system_settings',
        metadata: { key, new_value: value }
    });

    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// ---------------------------
// Security & Logs
// ---------------------------
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    let query = supabase.from('audit_logs').select('*, users(full_name, email, role)', { count: 'exact' });

    // Extract query params
    const { page = '1', limit = '20', search, action, entity_type, startDate, endDate } = req.query;
    
    // Pagination
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const from = (pageNum - 1) * limitNum;
    const to = from + limitNum - 1;

    // Filters
    if (action) query = query.eq('action', action);
    if (entity_type) query = query.eq('entity_type', entity_type);
    if (startDate) query = query.gte('created_at', startDate);
    if (endDate) query = query.lte('created_at', endDate);
    if (search) {
      // Supabase PostgREST search syntax for text/uuid can be tricky across joined tables.
      // We will search by action, entity_type or try to match exactly for entity_id if valid uuid.
      // Also user search is complex in a joined table without an explicit view.
      // We'll rely on client-side search for related users if not too many, or just filter server-side on direct string fields.
      query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Redact sensitive info
    const sensitiveKeys = ['password', 'token', 'access_token', 'refresh_token', 'jwt', 'secret', 'service_role_key', 'SUPABASE_SERVICE_ROLE_KEY', 'DATABASE_URL'];
    
    const redactedData = data.map((log: any) => {
      let meta = log.metadata;
      if (meta && typeof meta === 'object') {
        const redact = (obj: any) => {
           for (let k in obj) {
              if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk.toLowerCase()))) {
                 obj[k] = '[REDACTED]';
              } else if (typeof obj[k] === 'object' && obj[k] !== null) {
                 redact(obj[k]);
              }
           }
        };
        // clone meta before redact
        meta = JSON.parse(JSON.stringify(meta));
        redact(meta);
      }
      return { ...log, metadata: meta };
    });

    res.status(200).json({ success: true, data: redactedData, count, page: pageNum, limit: limitNum });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSellers = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('sellers').select(`
      *,
      users!inner(full_name, email, role, created_at, status)
    `).order('created_at', { ascending: false });
    
    if (error) throw error;
    const filteredData = data ? data.filter((d: any) => d.users?.status !== 'deleted') : [];
    res.status(200).json({ success: true, data: filteredData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminReviews = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('*, users(full_name), products(title)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ---------------------------
// Admin Messages (Inquiries)
// ---------------------------
export const getAdminMessages = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, buyers:users!buyer_id(id, full_name, email), sellers(id, business_name, users(full_name, email)), products(title)')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAdminMessageDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    // Get inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from('inquiries')
      .select('*, buyers:users!buyer_id(id, full_name, email, phone_number), sellers(id, business_name, phone_number, whatsapp_number, users(full_name, email)), products(id, title, price, sku, product_images(url, is_primary), categories(name))')
      .eq('id', id)
      .single();
      
    if (inquiryError) throw inquiryError;
    
    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*, sender:users!sender_id(id, full_name, role)')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: true });
      
    if (messagesError) throw messagesError;
    
    res.status(200).json({ success: true, data: { ...inquiry, messages } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAdminMessageStatus = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_INQUIRY_STATUS',
        entity_type: 'inquiry',
        entity_id: id,
        metadata: { status }
    });
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const replyToAdminMessage = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { content } = req.body;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
          inquiry_id: id,
          sender_id: admin_id,
          content
      })
      .select('*, sender:users!sender_id(id, full_name, role)')
      .single();
      
    if (error) throw error;
    
    // Update inquiry status and updated_at
    await supabase.from('inquiries').update({ status: 'responded', updated_at: new Date().toISOString() }).eq('id', id);
    
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { role } = req.body;
    
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('users').update({ role }).eq('id', id).select().single();
    if (error) throw error;
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_USER_ROLE',
        entity_type: 'user',
        entity_id: id,
        metadata: { new_role: role }
    });
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  console.log('Deleting user in controller, id:', req.params.id);
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    // Soft delete: update status to deleted
    const { data, error } = await supabase.from('users').update({ status: 'deleted' }).eq('id', id).select().single();
    if (error) throw error;
    
    // If seller, update seller status
    await supabase.from('sellers').update({ status: 'suspended' }).eq('id', id);
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'DELETE_USER',
        entity_type: 'user',
        entity_id: id,
        metadata: { note: 'Soft deleted' }
    });
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const createAdmin = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { email, password, full_name } = req.body;
    
    const supabase = getAdminSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'admin', full_name }
    });
    
    if (authError) throw authError;
    
    // Trigger should insert into public.users. We update the role to admin just in case.
    if (authData.user) {
      await supabase.from('users').update({ role: 'admin' }).eq('id', authData.user.id);
    }
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'CREATE_ADMIN',
        entity_type: 'user',
        entity_id: authData.user?.id,
        metadata: { email }
    });
    
    res.status(201).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateAdminOrderStatus = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body;
    
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('orders').update({ order_status: status }).eq('id', id).select().single();
    if (error) throw error;
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_ORDER_STATUS',
        entity_type: 'order',
        entity_id: id,
        metadata: { new_status: status }
    });
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteAdminReview = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'DELETE_REVIEW',
        entity_type: 'review',
        entity_id: id,
        metadata: { note: 'Deleted inappropriate review' }
    });
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const uploadAdminCategoryImage = async (req: Request, res: Response) => {
  try {
    const admin_id = req.user.sub;
    const { id } = req.params;
    const file = req.file as Express.Multer.File;
    
    if (!file) {
      return res.status(400).json({ success: false, error: 'No image file provided' });
    }
    
    const supabase = getAdminSupabaseClient();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileName = `category_${id}_${Date.now()}_${sanitizedName}`;
    
    const { error: uploadError } = await supabase.storage
        .from('category-images')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });
        
    if (uploadError) throw uploadError;
    
    const { data: publicUrlData } = supabase.storage
        .from('category-images')
        .getPublicUrl(fileName);
        
    const publicUrl = publicUrlData.publicUrl;
    
    const { error: updateError } = await supabase.from('categories').update({ image_url: publicUrl }).eq('id', id);
    if (updateError) throw updateError;
    
    await supabase.from('audit_logs').insert({
        user_id: admin_id,
        action: 'UPDATE_CATEGORY_IMAGE',
        entity_type: 'category',
        entity_id: id,
        metadata: { image_url: publicUrl }
    });
    
    res.status(200).json({ success: true, image_url: publicUrl });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
