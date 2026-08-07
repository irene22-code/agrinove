import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, ShoppingBag, Box, Activity, DollarSign, Clock, UserCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/admin/dashboard');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;
  }

  if (!stats) return <div className="text-center py-12">Failed to load dashboard</div>;

  const summaryCards = [
    { name: 'Total Users', value: stats.users?.total || 0, icon: Users, color: 'bg-blue-100 text-blue-600', href: '/admin/users' },
    { name: 'Buyers / Sellers', value: `${stats.users?.buyers || 0} / ${stats.users?.sellers || 0}`, icon: Users, color: 'bg-indigo-100 text-indigo-600', href: '/admin/users' },
    { name: 'Pending Sellers', value: stats.sellers?.pending || 0, icon: UserCheck, color: 'bg-amber-100 text-amber-600', href: '/admin/sellers' },
    { name: 'Total Revenue', value: `$${stats.revenue?.total || 0}`, icon: DollarSign, color: 'bg-emerald-100 text-emerald-600', href: '/admin/orders' },
    { name: 'Total Orders', value: stats.orders?.total || 0, icon: ShoppingBag, color: 'bg-purple-100 text-purple-600', href: '/admin/orders' },
    { name: 'Pending Orders', value: stats.orders?.pending || 0, icon: Clock, color: 'bg-orange-100 text-orange-600', href: '/admin/orders' },
    { name: 'Total Products', value: stats.products?.total || 0, icon: Box, color: 'bg-slate-100 text-slate-600', href: '/admin/products' },
    { name: 'Active Products', value: stats.products?.active || 0, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600', href: '/admin/products' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Link key={card.name} to={card.href} className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.name}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Orders</h2>
            <Link to="/admin/orders" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-200">
            {stats.orders?.recent?.map((order: any) => (
              <div key={order.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                  <p className="text-xs text-slate-500">{order.buyers?.users?.full_name} • ${order.total_amount}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.order_status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {order.order_status}
                </span>
              </div>
            ))}
            {(!stats.orders?.recent || stats.orders.recent.length === 0) && (
              <div className="p-4 text-center text-sm text-slate-500">No recent orders.</div>
            )}
          </div>
        </div>

        {/* Recent Seller Registrations */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Sellers</h2>
            <Link to="/admin/sellers" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-200">
            {stats.sellers?.recent?.map((seller: any) => (
              <div key={seller.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{seller.business_name}</p>
                  <p className="text-xs text-slate-500">{seller.users?.full_name} • {seller.users?.email}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${seller.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {seller.status}
                </span>
              </div>
            ))}
            {(!stats.sellers?.recent || stats.sellers.recent.length === 0) && (
              <div className="p-4 text-center text-sm text-slate-500">No recent sellers.</div>
            )}
          </div>
        </div>
        
        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Products</h2>
            <Link to="/admin/products" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-200">
            {stats.products?.recent?.map((product: any) => (
              <div key={product.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{product.title}</p>
                  <p className="text-xs text-slate-500">{product.sellers?.business_name} • ${product.price}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${product.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                  {product.status}
                </span>
              </div>
            ))}
            {(!stats.products?.recent || stats.products.recent.length === 0) && (
              <div className="p-4 text-center text-sm text-slate-500">No recent products.</div>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Users</h2>
            <Link to="/admin/users" className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">View All</Link>
          </div>
          <div className="divide-y divide-slate-200">
            {stats.users?.recent?.map((user: any) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="text-sm font-medium text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize">
                  {user.role}
                </span>
              </div>
            ))}
            {(!stats.users?.recent || stats.users.recent.length === 0) && (
              <div className="p-4 text-center text-sm text-slate-500">No recent users.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
