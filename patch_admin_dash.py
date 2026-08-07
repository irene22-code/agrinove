import re

with open('server/controllers/adminController.ts', 'r') as f:
    content = f.read()

dashboard_function = """export const getDashboardStats = async (req: Request, res: Response) => {
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
};"""

content = re.sub(r'export const getDashboardStats = async \(req: Request, res: Response\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);\s*\}\s*\};', dashboard_function, content)

with open('server/controllers/adminController.ts', 'w') as f:
    f.write(content)
