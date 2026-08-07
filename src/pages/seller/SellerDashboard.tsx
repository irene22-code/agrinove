import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Package, ShoppingCart, DollarSign, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SellerDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    messages: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/seller/stats');
        if (res.success && res.data) {
          setStats({
            products: res.data.inventory?.activeProducts || 0,
            orders: res.data.sales?.pendingOrders || 0, // Using pending orders for immediate attention
            revenue: res.data.sales?.totalRevenue || 0,
            messages: res.data.communications?.unreadInquiries || 0
          });
        }
      } catch (error) {
        console.error('Failed to fetch seller stats', error);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { name: 'Active Products', value: stats.products, icon: Package, href: '/seller/products' },
    { name: 'Pending Orders', value: stats.orders, icon: ShoppingCart, href: '/seller/orders' },
    { name: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: DollarSign, href: '/seller/analytics' },
    { name: 'Unread Messages', value: stats.messages, icon: MessageSquare, href: '/seller/messages' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.name} to={card.href} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <card.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-500">{card.name}</p>
                <p className="text-2xl font-semibold text-slate-900">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h2>
        <div className="text-sm text-slate-500">
          No recent activity to show.
        </div>
      </div>
    </div>
  );
}
