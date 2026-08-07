import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getBuyerProfile = async (req: Request, res: Response) => {
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

export const updateBuyerProfile = async (req: Request, res: Response) => {
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
};

export const getBuyerStats = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { count: totalOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', buyer_id);
    const { count: activeOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('buyer_id', buyer_id).in('order_status', ['pending', 'confirmed', 'processing', 'shipped']);
    const { count: favoritesCount } = await supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('user_id', buyer_id);
    const { count: unreadNotifications } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', buyer_id).eq('is_read', false);

    res.status(200).json({
      success: true,
      data: {
        totalOrders: totalOrders || 0,
        activeOrders: activeOrders || 0,
        favoritesCount: favoritesCount || 0,
        unreadNotifications: unreadNotifications || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFavorites = async (req: Request, res: Response) => {
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
};

export const addFavorite = async (req: Request, res: Response) => {
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
};

export const removeFavorite = async (req: Request, res: Response) => {
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
};

export const getBuyerInquiries = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, products(title), messages(id, sender_id, read_at)')
      .eq('buyer_id', buyer_id);
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub; // Works for buyers or sellers
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    // Check ownership
    const { data: notification } = await supabase.from('notifications').select('user_id').eq('id', id).single();
    if (!notification || notification.user_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const { data, error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id).select().single();
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    const { data: notification } = await supabase.from('notifications').select('user_id').eq('id', id).single();
    if (!notification || notification.user_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized' });
    }
    
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (error) throw error;
    
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
