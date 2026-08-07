import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getAdminReports = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { startDate, endDate } = req.query;

    // 1. Users metrics
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: totalBuyers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer');
    const { count: totalSellers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller');
    const { count: verifiedSellers } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'verified');
    const { count: pendingSellers } = await supabase.from('sellers').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    // 2. Products metrics
    const { count: totalProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
    const { count: activeProducts } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active');
    
    // Inventory
    const { data: inventoryData } = await supabase.from('products').select('stock_quantity, status');
    let inStock = 0, lowStock = 0, outOfStock = 0, archived = 0, draft = 0;
    inventoryData?.forEach(p => {
        if (p.status === 'archived') archived++;
        else if (p.status === 'inactive') draft++;
        else {
            if (p.stock_quantity === 0) outOfStock++;
            else if (p.stock_quantity < 10) lowStock++;
            else inStock++;
        }
    });

    // 3. Orders metrics
    let ordersQuery = supabase.from('orders').select('*');
    if (startDate && endDate) {
        ordersQuery = ordersQuery.gte('created_at', startDate).lte('created_at', endDate);
    }
    const { data: orders, error: ordersError } = await ordersQuery;
    
    if (ordersError) throw ordersError;

    let totalRevenue = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let pendingOrders = 0;
    let orderStatusCounts: Record<string, number> = {};
    
    const revenueByDate: Record<string, number> = {};
    const validOrdersMap = new Set();
    
    orders?.forEach(o => {
        const status = o.order_status || 'pending';
        orderStatusCounts[status] = (orderStatusCounts[status] || 0) + 1;
        
        if (status === 'delivered') {
            completedOrders++;
            totalRevenue += Number(o.total_amount || 0);
            validOrdersMap.add(o.id);
            
            const dateStr = new Date(o.created_at).toISOString().split('T')[0];
            revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + Number(o.total_amount || 0);
        } else if (status === 'cancelled') {
            cancelledOrders++;
        } else if (status === 'pending') {
            pendingOrders++;
        }
    });

    const { data: orderItems, error: oiError } = await supabase.from('order_items').select('quantity, subtotal, order_id, products(id, title, price, stock_quantity, status, product_images(url, is_primary), categories(name), sellers(business_name))');
    
    if (oiError) throw oiError;
    
    const productStats: Record<string, any> = {};
    const categoryStats: Record<string, any> = {};
    const sellerStats: Record<string, any> = {};
    
    orderItems?.forEach(item => {
        // Only count items from valid/completed orders for revenue/sales stats
        if (!validOrdersMap.has(item.order_id)) return;
        
        const prod = item.products as any;
        if (!prod) return;
        
        // Product Stats
        if (!productStats[prod.id]) {
            let primaryImg = prod.product_images?.find((i:any) => i.is_primary)?.url || prod.product_images?.[0]?.url;
            productStats[prod.id] = {
                id: prod.id,
                title: prod.title,
                image_url: primaryImg,
                seller_name: prod.sellers?.business_name,
                units_sold: 0,
                revenue: 0,
                stock: prod.stock_quantity,
                status: prod.status
            };
        }
        productStats[prod.id].units_sold += Number(item.quantity);
        productStats[prod.id].revenue += Number(item.subtotal);
        
        // Category Stats
        const catName = prod.categories?.name || 'Uncategorized';
        if (!categoryStats[catName]) {
            categoryStats[catName] = { name: catName, products: new Set(), units_sold: 0, orders: 0, revenue: 0 };
        }
        categoryStats[catName].products.add(prod.id);
        categoryStats[catName].units_sold += Number(item.quantity);
        categoryStats[catName].revenue += Number(item.subtotal);
        
        // Seller Stats
        const sellerName = prod.sellers?.business_name || 'Unknown';
        if (!sellerStats[sellerName]) {
            sellerStats[sellerName] = { name: sellerName, units_sold: 0, revenue: 0 };
        }
        sellerStats[sellerName].units_sold += Number(item.quantity);
        sellerStats[sellerName].revenue += Number(item.subtotal);
    });
    
    const topProducts = Object.values(productStats).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 15);
    const topCategories = Object.values(categoryStats).map((c: any) => ({...c, products: c.products.size })).sort((a: any, b: any) => b.revenue - a.revenue);
    const topSellers = Object.values(sellerStats).sort((a: any, b: any) => b.revenue - a.revenue).slice(0, 15);

    const chartData = Object.keys(revenueByDate).sort().map(date => ({
        date,
        revenue: revenueByDate[date]
    }));

    res.status(200).json({
      success: true,
      data: {
        metrics: {
            totalUsers, totalBuyers, totalSellers, verifiedSellers, pendingSellers,
            totalProducts, activeProducts, 
            totalOrders: orders?.length || 0,
            pendingOrders, completedOrders, cancelledOrders,
            totalRevenue,
            averageOrderValue: completedOrders > 0 ? totalRevenue / completedOrders : 0
        },
        inventory: {
            totalProducts, inStock, lowStock, outOfStock, archived, draft
        },
        orderStatusCounts,
        chartData,
        topProducts,
        topCategories,
        topSellers
      }
    });
    
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
