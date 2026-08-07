import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SellerAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/seller/stats');
        if (res.success) {
          setStats(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  if (!stats) return null;

  // Mock data for the chart since backend doesn't provide time-series yet
  const mockChartData = [
    { name: 'Mon', revenue: stats.sales.totalRevenue * 0.1 },
    { name: 'Tue', revenue: stats.sales.totalRevenue * 0.15 },
    { name: 'Wed', revenue: stats.sales.totalRevenue * 0.12 },
    { name: 'Thu', revenue: stats.sales.totalRevenue * 0.2 },
    { name: 'Fri', revenue: stats.sales.totalRevenue * 0.25 },
    { name: 'Sat', revenue: stats.sales.totalRevenue * 0.1 },
    { name: 'Sun', revenue: stats.sales.totalRevenue * 0.08 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Analytics Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-slate-900">${stats.sales.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Orders</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.sales.totalOrders}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Pending Orders</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.sales.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Low Stock Items</p>
              <p className="text-2xl font-semibold text-slate-900">{stats.inventory.lowStockProducts + stats.inventory.outOfStockProducts}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Revenue Over Time</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Inventory Overview</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Active Products</span>
                <span className="text-slate-500">{stats.inventory.activeProducts} / {stats.inventory.totalProducts}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(stats.inventory.activeProducts / Math.max(stats.inventory.totalProducts, 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Low Stock</span>
                <span className="text-slate-500">{stats.inventory.lowStockProducts}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(stats.inventory.lowStockProducts / Math.max(stats.inventory.totalProducts, 1)) * 100}%` }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700">Out of Stock</span>
                <span className="text-slate-500">{stats.inventory.outOfStockProducts}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${(stats.inventory.outOfStockProducts / Math.max(stats.inventory.totalProducts, 1)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
