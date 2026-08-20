import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ShoppingBag, MessageSquare, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BuyerDashboard() {
  const [stats, setStats] = useState({
    orders: 0,
    messages: 0,
    saved: 0,
    recent: 0
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/buyer/stats');
        if (res.success && res.data) {
          setStats({
            orders: res.data.activeOrders || 0,
            messages: res.data.unreadNotifications || 0, // we use notifications here
            saved: res.data.favoritesCount || 0,
            recent: JSON.parse(localStorage.getItem('agromart_recent') || '[]').length
          });
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { name: 'Active Orders', value: stats.orders, icon: ShoppingBag, href: '/buyer/orders' },
    { name: 'Unread Messages', value: stats.messages, icon: MessageSquare, href: '/buyer/messages' },
    { name: 'Saved Products', value: stats.saved, icon: Heart, href: '/buyer/saved' },
    { name: 'Recently Viewed', value: stats.recent, icon: Clock, href: '/buyer/recent' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Link key={card.name} to={card.href} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
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
          No recent activity to show. Start browsing products!
        </div>
      </div>
    </div>
  );
}
