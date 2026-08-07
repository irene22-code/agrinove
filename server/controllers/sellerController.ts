import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getSellerDashboardStats = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    // 1. Total products & low stock products
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('id, stock_quantity, status')
      .eq('seller_id', seller_id);
      
    if (pErr) throw pErr;

    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length;
    const outOfStockProducts = products.filter(p => p.stock_quantity === 0).length;

    // 2. Orders stats (Total revenue, pending orders)
    const { data: orders, error: oErr } = await supabase
      .from('orders')
      .select('id, total_amount, order_status, payment_status')
      .eq('seller_id', seller_id);

    if (oErr) throw oErr;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.order_status === 'pending').length;
    
    // Revenue from paid/completed orders (rough estimate)
    const totalRevenue = orders
        .filter(o => o.payment_status === 'paid')
        .reduce((sum, order) => sum + Number(order.total_amount), 0);

    // 3. Unread Inquiries
    const { count: unreadInquiries, error: iErr } = await supabase
      .from('inquiries')
      .select('id', { count: 'exact' })
      .eq('seller_id', seller_id)
      .eq('status', 'pending');

    res.status(200).json({
      success: true,
      data: {
        inventory: {
          totalProducts,
          activeProducts,
          lowStockProducts,
          outOfStockProducts
        },
        sales: {
          totalOrders,
          pendingOrders,
          totalRevenue
        },
        communications: {
          unreadInquiries: unreadInquiries || 0
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSellerReviews = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    // Fetch all reviews for products owned by this seller
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, comment, created_at,
        users(full_name),
        products!inner(id, title, seller_id)
      `)
      .eq('products.seller_id', seller_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateSellerProfile = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { full_name, phone_number, business_name, business_description, address } = req.body;
    
    const supabase = getAdminSupabaseClient();
    
    // Update users table
    const { error: userError } = await supabase
      .from('users')
      .update({ full_name })
      .eq('id', user_id);
    if (userError) throw userError;

    // Update sellers table
    const { error: sellerError } = await supabase
      .from('sellers')
      .update({ phone_number, business_name, business_description, address })
      .eq('id', user_id);
    if (sellerError) throw sellerError;

    res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
