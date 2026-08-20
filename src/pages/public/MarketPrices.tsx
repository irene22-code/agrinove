import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Minus, RefreshCw, Calendar, MapPin, Info, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { api } from '../../lib/api';

export function MarketPrices() {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  
  // Search and Filter State
  const [productSearch, setProductSearch] = useState('');
  const [marketSearch, setMarketSearch] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedChangeFilter, setSelectedChangeFilter] = useState(''); // 'increased' | 'decreased' | 'unchanged' | ''
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'lowest' | 'highest' | 'changed'
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Selected item for history/source detail modal
  const [detailModalItem, setDetailModalItem] = useState<any | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchMarketPrices();
  }, [sortBy]);

  const fetchInitialData = async () => {
    try {
      const [catRes, settingsRes] = await Promise.all([
        api.get<{ success: boolean; data: any[] }>('/categories'),
        api.get<{ success: boolean; data: { markets: any[]; sources: any[] } }>('/admin/market-settings').catch(() => ({ success: false, data: { markets: [], sources: [] } }))
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (settingsRes.success && settingsRes.data) {
        setMarkets(settingsRes.data.markets || []);
        setSources(settingsRes.data.sources || []);
      }
    } catch (err) {
      console.error('Failed to load filters:', err);
    }
  };

  const fetchMarketPrices = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: any[] }>(`/products/market-prices?sort=${sortBy}`);
      if (res.success) {
        setPrices(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load market prices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper for Price Change calculation
  const calculateChange = (current: number, previous?: number) => {
    if (!previous || previous <= 0) return { percent: 0, type: 'unchanged' };
    const diff = current - previous;
    const percent = (diff / previous) * 100;
    if (percent > 0.01) return { percent, type: 'increased' };
    if (percent < -0.01) return { percent: Math.abs(percent), type: 'decreased' };
    return { percent: 0, type: 'unchanged' };
  };

  // Filtered and Processed Market Prices
  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      // Product Search
      if (productSearch.trim()) {
        const query = productSearch.toLowerCase();
        const pName = (item.product_name || '').toLowerCase();
        const catName = (item.category_name || '').toLowerCase();
        if (!pName.includes(query) && !catName.includes(query)) return false;
      }

      // Market Search
      if (marketSearch.trim()) {
        const mQuery = marketSearch.toLowerCase();
        const mName = (item.market_name || '').toLowerCase();
        const mLoc = (item.market_location || '').toLowerCase();
        if (!mName.includes(mQuery) && !mLoc.includes(mQuery)) return false;
      }

      // Market Dropdown
      if (selectedMarket) {
        if ((item.market_name || '').toLowerCase() !== selectedMarket.toLowerCase() && item.market_id !== selectedMarket) {
          return false;
        }
      }

      // Category Dropdown
      if (selectedCategory) {
        if (item.category_id !== selectedCategory && (item.category_name || '').toLowerCase() !== selectedCategory.toLowerCase()) {
          return false;
        }
      }

      // Price Range Filter
      if (minPrice && parseFloat(minPrice) > 0) {
        if (item.current_price < parseFloat(minPrice)) return false;
      }
      if (maxPrice && parseFloat(maxPrice) > 0) {
        if (item.current_price > parseFloat(maxPrice)) return false;
      }

      // Price Change Filter
      if (selectedChangeFilter) {
        const { type } = calculateChange(item.current_price, item.previous_price);
        if (selectedChangeFilter !== type) return false;
      }

      return true;
    });
  }, [prices, productSearch, marketSearch, selectedMarket, selectedCategory, selectedChangeFilter, minPrice, maxPrice]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalCount = filteredPrices.length;
    let totalPricesSum = 0;
    let priceIncreases = 0;
    let priceDecreases = 0;

    filteredPrices.forEach((p) => {
      totalPricesSum += p.current_price || 0;
      const { type } = calculateChange(p.current_price, p.previous_price);
      if (type === 'increased') priceIncreases++;
      if (type === 'decreased') priceDecreases++;
    });

    const avgPrice = totalCount > 0 ? Math.round(totalPricesSum / totalCount) : 0;

    return { totalCount, avgPrice, priceIncreases, priceDecreases };
  }, [filteredPrices]);

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Header Banner */}
      <div className="bg-green-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-green-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-green-300 font-semibold text-sm mb-2 uppercase tracking-wider">
                <Tag className="h-4 w-4" /> Live Commodity Insights
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Market Prices</h1>
              <p className="mt-2 text-green-100 text-base sm:text-lg max-w-2xl">
                Check the latest prices of agricultural products across different markets.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchMarketPrices}
                className="inline-flex items-center gap-2 bg-green-800 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors border border-green-700"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Market Price Trends Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Tracked Commodities</span>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <Tag className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.totalCount}</p>
            <p className="text-xs text-slate-500 mt-1">Real-time market updates</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Average Commodity Price</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{stats.avgPrice.toLocaleString()} RWF</p>
            <p className="text-xs text-slate-500 mt-1">Across active markets</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Prices Increased</span>
              <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-rose-600">+{stats.priceIncreases}</p>
            <p className="text-xs text-slate-500 mt-1">Higher than previous records</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Prices Decreased</span>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <ArrowDownRight className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-green-600">-{stats.priceDecreases}</p>
            <p className="text-xs text-slate-500 mt-1">More affordable this period</p>
          </div>
        </div>

        {/* Search & Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-lg border-b border-slate-100 pb-3">
            <Search className="h-5 w-5 text-green-600" /> Search & Filter Market Prices
          </div>

          {/* Search Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products, e.g. potatoes, tomatoes, bananas..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Search Markets
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search markets, e.g. Nyabugogo, Kimironko, Munini..."
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Market
              </label>
              <select
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">All Markets</option>
                {markets.map((m: any) => (
                  <option key={m.id || m.name} value={m.name}>
                    {m.name} {m.location ? `(${m.location})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Price Change
              </label>
              <select
                value={selectedChangeFilter}
                onChange={(e) => setSelectedChangeFilter(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="">All Price Trends</option>
                <option value="increased">Price Increased ↑</option>
                <option value="decreased">Price Decreased ↓</option>
                <option value="unchanged">Price Unchanged -</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full py-2.5 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              >
                <option value="latest">Latest Updated</option>
                <option value="lowest">Lowest Price</option>
                <option value="highest">Highest Price</option>
                <option value="changed">Most Changed (%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Price Range (RWF)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 py-2 px-2 border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 py-2 px-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {(productSearch || marketSearch || selectedMarket || selectedCategory || selectedChangeFilter || minPrice || maxPrice) && (
            <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
              <span>Showing filtered results ({filteredPrices.length})</span>
              <button
                onClick={() => {
                  setProductSearch('');
                  setMarketSearch('');
                  setSelectedMarket('');
                  setSelectedCategory('');
                  setSelectedChangeFilter('');
                  setMinPrice('');
                  setMaxPrice('');
                }}
                className="text-green-600 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Market Price Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-bold text-slate-900">Latest Market Prices Table</h2>
            <span className="text-xs text-slate-500 font-medium">
              Updated automatically from verified sources
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto text-green-600 mb-3" />
              <p className="text-sm font-medium">Fetching live market prices...</p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Info className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-700 mb-1">No market prices available at the moment.</p>
              <p className="text-xs text-slate-500">Try adjusting your search keywords or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-100/70">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Market</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Previous Price</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Change</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {filteredPrices.map((item) => {
                    const { percent, type } = calculateChange(item.current_price, item.previous_price);
                    const formattedDate = item.updated_at || item.created_at || item.effective_date
                      ? new Date(item.updated_at || item.created_at || item.effective_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'Today';

                    return (
                      <tr key={item.id} className="hover:bg-green-50/40 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {item.image_url ? (
                              <img src={item.image_url} alt={item.product_name} className="h-10 w-10 rounded-lg object-cover border border-slate-200" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                                {item.product_name ? item.product_name.charAt(0).toUpperCase() : 'P'}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-bold text-slate-900">{item.product_name}</p>
                              <span className="inline-block text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5">
                                {item.category_name || 'Agriculture'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-800">
                            <MapPin className="h-3.5 w-3.5 text-green-600 shrink-0" />
                            <span>{item.market_name || 'Central Market'}</span>
                          </div>
                          {item.market_location && (
                            <p className="text-xs text-slate-400 pl-5">{item.market_location}</p>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                          {item.unit || '1 Kg'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-extrabold text-slate-900">
                            {Number(item.current_price).toLocaleString()} RWF
                          </span>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-medium">
                          {item.previous_price && item.previous_price > 0
                            ? `${Number(item.previous_price).toLocaleString()} RWF`
                            : '-'}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap">
                          {type === 'increased' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <TrendingUp className="h-3.5 w-3.5" /> ↑ {percent.toFixed(1)}%
                            </span>
                          )}
                          {type === 'decreased' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                              <TrendingDown className="h-3.5 w-3.5" /> ↓ {percent.toFixed(1)}%
                            </span>
                          )}
                          {type === 'unchanged' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <Minus className="h-3.5 w-3.5" /> - 0.0%
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 font-medium">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {formattedDate}
                          </div>
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <button
                            onClick={() => setDetailModalItem(item)}
                            className="inline-flex items-center gap-1 text-green-600 font-semibold hover:text-green-800 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Info className="h-3.5 w-3.5" />
                            {item.source || 'Official Source'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Source & Details Modal */}
        {detailModalItem && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{detailModalItem.product_name}</h3>
                  <p className="text-xs text-slate-500">{detailModalItem.market_name} Market</p>
                </div>
                <button
                  onClick={() => setDetailModalItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-slate-600 font-medium">Current Price</span>
                  <span className="font-extrabold text-green-700 text-base">{Number(detailModalItem.current_price).toLocaleString()} RWF / {detailModalItem.unit || '1 Kg'}</span>
                </div>

                {detailModalItem.previous_price && (
                  <div className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Previous Price</span>
                    <span className="font-semibold text-slate-700">{Number(detailModalItem.previous_price).toLocaleString()} RWF</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="border border-slate-200 p-2.5 rounded-lg">
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Source</span>
                    <span className="text-xs font-semibold text-slate-800">{detailModalItem.source || 'Government / Market Authority'}</span>
                  </div>
                  <div className="border border-slate-200 p-2.5 rounded-lg">
                    <span className="text-[11px] text-slate-400 block uppercase font-bold">Effective Date</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {detailModalItem.effective_date || new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {detailModalItem.notes && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-600 block mb-1">Market Notes / Inspection</span>
                    <p className="text-xs text-slate-600 bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg">
                      {detailModalItem.notes}
                    </p>
                  </div>
                )}

                {detailModalItem.official_document_url && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-slate-600 block mb-1">Official Document</span>
                    <a
                      href={detailModalItem.official_document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-3 py-2 rounded-lg hover:bg-green-100 border border-green-200"
                    >
                      <Info className="h-3.5 w-3.5" />
                      View Official Source Document
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setDetailModalItem(null)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
