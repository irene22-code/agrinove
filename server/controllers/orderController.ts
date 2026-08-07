import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { 
      total_amount, shipping_address, items,
      customer_name, customer_phone, customer_email,
      country, city, district, sector, street_address,
      payment_method, order_notes
    } = req.body;
    
    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'Missing required order fields (items)' });
    }

    const supabase = getAdminSupabaseClient();
    
    // Verify buyer profile exists
    const { data: buyerData, error: buyerError } = await supabase
      .from('buyers')
      .select('id')
      .eq('id', buyer_id)
      .single();
      
    if (buyerError || !buyerData) {
      return res.status(400).json({ success: false, error: 'Buyer profile not found. Please complete your buyer profile.' });
    }

    // 1. Validate items and get true seller_id from the product
    const firstProductId = items[0].product_id;
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('seller_id')
      .eq('id', firstProductId)
      .single();
      
    if (productError || !productData) {
      return res.status(400).json({ success: false, error: 'Product not found or invalid' });
    }
    
    const true_seller_id = productData.seller_id;
    
    // Verify all items belong to the same seller
    for (const item of items) {
      const { data: pData } = await supabase.from('products').select('seller_id').eq('id', item.product_id).single();
      if (!pData || pData.seller_id !== true_seller_id) {
         return res.status(400).json({ success: false, error: 'All items must belong to the same seller' });
      }
    }

    // 2. Create the order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      buyer_id,
      seller_id: true_seller_id,
      total_amount,
      shipping_address,
      customer_name,
      customer_phone,
      customer_email,
      country,
      city,
      district,
      sector,
      street_address,
      payment_method,
      notes: order_notes,
      order_status: 'pending',
      payment_status: 'pending' // No online payment yet
    }).select().single();

    if (orderError) throw orderError;

    // 3. Insert order items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

    if (itemsError) {
      // rollback or handle error in a real app
      throw itemsError;
    }
    
    // 4. Create a notification for the seller
    await supabase.from('notifications').insert({
        user_id: true_seller_id,
        type: 'order_update',
        title: 'New Order Received',
        content: `You have received a new order (#${String(order.id).substring(0,8)}).`,
        link: `/seller/orders/${order.id}`
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getBuyerOrders = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, sellers(business_name, users(email))')
      .eq('buyer_id', buyer_id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSellerOrders = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, buyers(users(full_name))')
      .eq('seller_id', seller_id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
                *,
        order_items(*, products(id, title, description, categories(name), brand, price, product_images(url, is_primary), sellers(business_name, users(email)))),
        buyers(users(full_name, email)),
        sellers(business_name, users(email))
      `)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Auth check: only buyer or seller of the order can view it
    if (order.buyer_id !== user_id && order.seller_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to view this order' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Order not found' });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const seller_id = req.user.sub;
    const { id } = req.params;
    const { order_status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order_status)) {
        return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    const supabase = getAdminSupabaseClient();
    
    const { data: order } = await supabase.from('orders').select('seller_id, buyer_id').eq('id', id).single();
    if (!order || order.seller_id !== seller_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to update this order' });
    }

    const { data, error } = await supabase.from('orders').update({ order_status }).eq('id', id).select().single();
    if (error) throw error;
    
    // Audit log
    await supabase.from('audit_logs').insert({
        user_id: seller_id,
        action: 'UPDATE_ORDER_STATUS',
        entity_type: 'order',
        entity_id: id,
        metadata: { new_status: order_status }
    });

    // Notify buyer
    await supabase.from('notifications').insert({
        user_id: order.buyer_id,
        type: 'order_update',
        title: 'Order Status Updated',
        content: `Your order (#${String(id).substring(0,8)}) is now ${order_status}.`,
        link: `/buyer/orders/${id}`
    });
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    const { data: order } = await supabase.from('orders').select('buyer_id, order_status, seller_id').eq('id', id).single();
    
    if (!order || order.buyer_id !== buyer_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to cancel this order' });
    }

    if (order.order_status !== 'pending') {
        return res.status(400).json({ success: false, error: 'Only pending orders can be cancelled by the buyer' });
    }

    const { data, error } = await supabase.from('orders').update({ order_status: 'cancelled' }).eq('id', id).select().single();
    if (error) throw error;
    
    // Audit log
    await supabase.from('audit_logs').insert({
        user_id: buyer_id,
        action: 'UPDATE_ORDER_STATUS',
        entity_type: 'order',
        entity_id: id,
        metadata: { new_status: 'cancelled' }
    });

    // Notify seller
    await supabase.from('notifications').insert({
        user_id: order.seller_id,
        type: 'order_update',
        title: 'Order Cancelled',
        content: `Order (#${String(id).substring(0,8)}) has been cancelled by the buyer.`,
        link: `/seller/orders/${id}`
    });
    
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
