import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, Users, ShoppingCart, Package, AlertCircle, RefreshCcw } from 'lucide-react';

export function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      let url = '/admin/reports';
      
      let start = '', end = '';
      const today = new Date();
      
      if (dateRange !== 'all') {
          if (dateRange === 'today') {
              start = new Date().toISOString();
              end = new Date().toISOString();
          } else if (dateRange === '7days') {
              const d = new Date(); d.setDate(d.getDate() - 7);
              start = d.toISOString(); end = today.toISOString();
          } else if (dateRange === '30days') {
              const d = new Date(); d.setDate(d.getDate() - 30);
              start = d.toISOString(); end = today.toISOString();
          } else if (dateRange === '90days') {
              const d = new Date(); d.setDate(d.getDate() - 90);
              start = d.toISOString(); end = today.toISOString();
          } else if (dateRange === 'year') {
              const d = new Date(today.getFullYear(), 0, 1);
              start = d.toISOString(); end = today.toISOString();
          } else if (dateRange === 'custom' && customStart && customEnd) {
              start = new Date(customStart).toISOString();
              end = new Date(customEnd).toISOString();
          }
          
          if (start && end) {
              url += `?startDate=${start}&endDate=${end}`;
          }
      }

      const res = await api.get<{ success: boolean; data: any }>(url);
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (customStart && customEnd) {
          fetchData();
      }
  };

  const exportCSV = (filename: string, rows: any[]) => {
      if (!rows || !rows.length) return;
      const headers = Object.keys(rows[0]);
      const csvContent = [
          headers.join(','),
          ...rows.map(row => headers.map(header => {
              const val = row[header] === null || row[header] === undefined ? '' : row[header];
              return `"${String(val).replace(/"/g, '""')}"`;
          }).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  if (isLoading && !data) {
    return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;
  }

  const { metrics, inventory, orderStatusCounts, chartData, topProducts, topCategories, topSellers } = data || {};
  
  const statusChartData = orderStatusCounts ? Object.keys(orderStatusCounts).map(key => ({
      name: key, value: orderStatusCounts[key]
  })) : [];
  
  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white min-w-[160px] text-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>
          
          <button 
            onClick={() => fetchData()}
            className="p-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-600 transition-colors"
            title="Refresh Data"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {dateRange === 'custom' && (
          <form onSubmit={handleCustomDateSubmit} className="flex items-end gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} required className="border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              <button type="submit" className="bg-emerald-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-emerald-700 transition-colors font-medium">Apply</button>
          </form>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Overview</button>
              <button onClick={() => setActiveTab('sales')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Sales & Orders</button>
              <button onClick={() => setActiveTab('products')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Products</button>
              <button onClick={() => setActiveTab('sellers')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sellers' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Sellers</button>
              <button onClick={() => setActiveTab('categories')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'categories' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Categories</button>
          </nav>
      </div>

      <div className={`space-y-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          
          {activeTab === 'overview' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">${metrics?.totalRevenue?.toFixed(2)}</h3>
                            </div>
                            <div className="bg-emerald-100 p-2 rounded-lg"><TrendingUp className="h-5 w-5 text-emerald-600" /></div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Orders</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.totalOrders}</h3>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-lg"><ShoppingCart className="h-5 w-5 text-blue-600" /></div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Users</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.totalUsers}</h3>
                            </div>
                            <div className="bg-purple-100 p-2 rounded-lg"><Users className="h-5 w-5 text-purple-600" /></div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Active Products</p>
                                <h3 className="text-2xl font-bold text-slate-900 mt-1">{metrics?.activeProducts}</h3>
                            </div>
                            <div className="bg-orange-100 p-2 rounded-lg"><Package className="h-5 w-5 text-orange-600" /></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Users Breakdown</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Total Buyers</span>
                                <span className="font-semibold text-slate-900">{metrics?.totalBuyers}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Total Sellers</span>
                                <span className="font-semibold text-slate-900">{metrics?.totalSellers}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Verified Sellers</span>
                                <span className="font-semibold text-emerald-600">{metrics?.verifiedSellers}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-slate-600">Pending Sellers</span>
                                <span className="font-semibold text-amber-600">{metrics?.pendingSellers}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Inventory Health</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-600">Total Products</span>
                                <span className="font-semibold text-slate-900">{inventory?.totalProducts}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-600 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> In Stock</span>
                                <span className="font-semibold text-slate-900">{inventory?.inStock}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                                <span className="text-slate-600 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Low Stock (&lt; 10)</span>
                                <span className="font-semibold text-amber-600">{inventory?.lowStock}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-slate-600 flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500"></span> Out of Stock</span>
                                <span className="font-semibold text-red-600">{inventory?.outOfStock}</span>
                            </div>
                        </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === 'sales' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Sales</p>
                        <p className="text-2xl font-bold text-slate-900">${metrics?.totalRevenue?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                        <p className="text-sm font-medium text-slate-500 mb-1">Avg Order Value</p>
                        <p className="text-2xl font-bold text-slate-900">${metrics?.averageOrderValue?.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                        <p className="text-sm font-medium text-slate-500 mb-1">Completed Orders</p>
                        <p className="text-2xl font-bold text-emerald-600">{metrics?.completedOrders}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 text-center">
                        <p className="text-sm font-medium text-slate-500 mb-1">Cancelled Orders</p>
                        <p className="text-2xl font-bold text-red-600">{metrics?.cancelledOrders}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue Over Time</h3>
                        <div className="h-[300px]">
                            {chartData && chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                                        <YAxis tickFormatter={(val) => `$${val}`} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} dx={-10} />
                                        <RechartsTooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 0}} activeDot={{r: 6, fill: '#059669', strokeWidth: 0}} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">No revenue data for this period</div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-1 bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Order Status</h3>
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
                            {statusChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusChartData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                                            {statusChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                        <Legend iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-slate-500">No orders for this period</div>
                            )}
                        </div>
                    </div>
                </div>
              </>
          )}

          {activeTab === 'products' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900">Product Performance</h3>
                      <button onClick={() => exportCSV('product_performance', topProducts)} className="text-sm flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm"><Download className="h-4 w-4" /> Export CSV</button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-white">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Product</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Seller</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Units Sold</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Revenue</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Stock</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                              {topProducts?.length > 0 ? topProducts.map((p: any) => (
                                  <tr key={p.id} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                          <div className="flex items-center gap-3">
                                              <div className="h-10 w-10 bg-slate-100 rounded overflow-hidden">
                                                  {p.image_url ? <img src={p.image_url} alt="" className="h-full w-full object-cover" /> : <Package className="h-5 w-5 m-2.5 text-slate-400" />}
                                              </div>
                                              <div>
                                                  <div className="text-sm font-medium text-slate-900">{p.title}</div>
                                                  <div className="text-xs text-slate-500">{p.status}</div>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{p.seller_name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.units_sold}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">${p.revenue.toFixed(2)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : p.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                                              {p.stock}
                                          </span>
                                      </td>
                                  </tr>
                              )) : (
                                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No product sales in this period</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'sellers' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900">Seller Performance</h3>
                      <button onClick={() => exportCSV('seller_performance', topSellers)} className="text-sm flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm"><Download className="h-4 w-4" /> Export CSV</button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-white">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Seller / Business</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Units Sold</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Revenue</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                              {topSellers?.length > 0 ? topSellers.map((s: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{s.name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{s.units_sold}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">${s.revenue.toFixed(2)}</td>
                                  </tr>
                              )) : (
                                  <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No seller data for this period</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

          {activeTab === 'categories' && (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                      <h3 className="text-lg font-bold text-slate-900">Category Performance</h3>
                      <button onClick={() => exportCSV('category_performance', topCategories)} className="text-sm flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-sm"><Download className="h-4 w-4" /> Export CSV</button>
                  </div>
                  <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200">
                          <thead className="bg-white">
                              <tr>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Category</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Unique Products Sold</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Total Units</th>
                                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Revenue</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 bg-white">
                              {topCategories?.length > 0 ? topCategories.map((c: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-slate-50">
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{c.products}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{c.units_sold}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">${c.revenue.toFixed(2)}</td>
                                  </tr>
                              )) : (
                                  <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">No category data for this period</td></tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
}
