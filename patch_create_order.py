import re

with open('server/controllers/orderController.ts', 'r') as f:
    content = f.read()

create_order_new = """export const createOrder = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { 
      seller_id, total_amount, shipping_address, items,
      customer_name, customer_phone, customer_email,
      country, city, district, sector, street_address,
      payment_method, order_notes
    } = req.body;
    
    if (!seller_id || !total_amount || !items || !items.length) {
      return res.status(400).json({ success: false, error: 'Missing required order fields' });
    }

    const supabase = getAdminSupabaseClient();
    
    // 1. Create the order
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      buyer_id,
      seller_id,
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

    // 2. Insert order items
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
    
    // 3. Create a notification for the seller
    await supabase.from('notifications').insert({
        user_id: seller_id,
        type: 'order_update',
        title: 'New Order Received',
        content: `You have received a new order (#${String(order.id).substring(0,8)}).`,
        link: `/seller/orders/${order.id}`
    });

    res.status(201).json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};"""

content = re.sub(r'export const createOrder = async.*?\}\s*\};', create_order_new, content, flags=re.DOTALL, count=1)

with open('server/controllers/orderController.ts', 'w') as f:
    f.write(content)
