import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Minus, Calendar, MapPin } from 'lucide-react';
import { api } from '../lib/api';

const MarketPrices = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketFilter, setMarketFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sort, setSort] = useState('latest');
  const [categories, setCategories] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);

  useEffect(() => {
    fetchPrices();
    fetchCategories();
    // In a real app we might fetch public markets from a public endpoint, but for now we extract from prices
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const res = await api.get<{success: boolean, data: any[]}>(`/products/market-prices?sort=${sort}`);
      if (res.success) {
        setPrices(res.data);
        const uniqueMarkets = Array.from(new Set(res.data.map(p => p.market_name).filter(Boolean)));
        setMarkets(uniqueMarkets.map(m => ({ name: m })));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get<{success: boolean, data: any[]}>('/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPrices();
  }, [sort]);

  const filteredPrices = prices.filter(p => {
    if (searchTerm && !p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) && !p.market_name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (marketFilter && p.market_name !== marketFilter) return false;
    if (categoryFilter && p.category_name !== categoryFilter) return false;
    return true;
  });

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600 bg-red-50'; // Increased price is generally bad for buyers, good for sellers. Wait, standard is green up, red down, but let's stick to simple green up
    if (change < 0) return 'text-green-600 bg-green-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 mr-1" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 mr-1" />;
    return <Minus className="h-4 w-4 mr-1" />;
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Market Prices</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Check the latest prices of agricultural products across different markets.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products or markets..." 
                className="w-full pl-10 pr-4 py-2 border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              className="w-full border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500"
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
            >
              <option value="">All Markets</option>
              {markets.map((m, i) => (
                <option key={i} value={m.name}>{m.name}</option>
              ))}
            </select>

            <select 
              className="w-full border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            <select 
              className="w-full border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="latest">Latest Updates</option>
              <option value="lowest">Lowest Price</option>
              <option value="highest">Highest Price</option>
              <option value="changed">Most Changed</option>
            </select>
          </div>
        </div>

        {/* Trends Summary (optional, just basic stats for now) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-slate-500 text-sm font-medium mb-1">Total Tracked Products</h3>
             <p className="text-3xl font-bold text-slate-900">{prices.length}</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-slate-500 text-sm font-medium mb-1">Markets Covered</h3>
             <p className="text-3xl font-bold text-slate-900">{markets.length}</p>
           </div>
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
             <h3 className="text-slate-500 text-sm font-medium mb-1">Price Increased (Today)</h3>
             <p className="text-3xl font-bold text-red-600">
                {prices.filter(p => (p.price_change || 0) > 0).length}
             </p>
           </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-slate-500">Loading market prices...</div>
            ) : filteredPrices.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No market prices available at the moment.</div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Market</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Previous Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Change</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date Published</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredPrices.map((price) => (
                    <tr key={price.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {price.image_url ? (
                            <img className="h-10 w-10 rounded-full object-cover mr-3" src={price.image_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold mr-3">
                              {price.product_name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-slate-900">{price.product_name}</div>
                            <div className="text-xs text-slate-500">{price.category_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-slate-900">
                          <MapPin className="h-4 w-4 text-slate-400 mr-1" />
                          {price.market_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {price.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                        {price.current_price?.toLocaleString()} RWF
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {price.previous_price ? `${price.previous_price.toLocaleString()} RWF` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {price.price_change ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getChangeColor(price.price_change)}`}>
                            {getChangeIcon(price.price_change)}
                            {Math.abs(price.price_change).toFixed(1)}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-slate-600 bg-slate-100">
                            Unchanged
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-slate-400" />
                          {new Date(price.updated_at).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          Source: {price.source || 'Admin Entry'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketPrices;
