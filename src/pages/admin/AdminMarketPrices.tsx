import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, TrendingUp, TrendingDown, Minus, RefreshCw, Upload, Settings, Filter, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

const AdminMarketPrices = () => {
  const [prices, setPrices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [markets, setMarkets] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<any>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [newMarketName, setNewMarketName] = useState('');
  const [newMarketLoc, setNewMarketLoc] = useState('');
  const [newSourceName, setNewSourceName] = useState('');

  // Table Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Form State
  const [formData, setFormData] = useState({
    product_id: '',
    product_name: '',
    category_id: '',
    unit: '1 Kg',
    current_price: '',
    previous_price: '',
    market_name: '',
    market_id: '',
    source: '',
    source_id: '',
    notes: '',
    effective_date: '',
    expiry_date: '',
    status: 'published',
    official_document_url: '',
    official_document_name: '',
    official_document_date: '',
    official_document_ref: '',
    has_government_document: 'no'
  });

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<any>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesRes, catRes, settingsRes, prodRes] = await Promise.all([
        api.get<{ success: boolean; data: any[] }>('/admin/market-prices'),
        api.get<{ success: boolean; data: any[] }>('/admin/categories'),
        api.get<{ success: boolean; data: { markets: any[]; sources: any[] } }>('/admin/market-settings'),
        api.get<{ success: boolean; data: any[] }>('/admin/products')
      ]);
      if (pricesRes.success) setPrices(pricesRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (prodRes.success) setProducts(prodRes.data || []);
      if (settingsRes.success && settingsRes.data) {
        setMarkets(settingsRes.data.markets || []);
        setSources(settingsRes.data.sources || []);
      }
    } catch (error) {
      console.error('Failed to load admin market prices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return;
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const parsed = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = values[i]?.trim(); });
      
      const errors = [];
      if (!obj.product_name) errors.push('Missing product_name');
      if (!obj.market_name) errors.push('Missing market_name');
      if (!obj.current_price || isNaN(parseFloat(obj.current_price))) errors.push('Invalid current_price');
      
      const cat = categories.find(c => c.name.toLowerCase() === obj.category?.toLowerCase());
      if (cat) obj.category_id = cat.id;
      else if (!obj.category_id && categories.length > 0) obj.category_id = categories[0].id;
      
      return { ...obj, errors, valid: errors.length === 0 };
    });
    setPreviewData(parsed);
  };

  const handleBulkSubmit = async () => {
    const validRecords = previewData.filter(p => p.valid);
    if (validRecords.length === 0) {
      alert("No valid records to import.");
      return;
    }
    
    setLoading(true);
    let successCount = 0;
    for (const record of validRecords) {
      try {
        const payload = {
          product_name: record.product_name,
          category_id: record.category_id,
          unit: record.unit || '1 Kg',
          current_price: parseFloat(record.current_price),
          previous_price: record.previous_price ? parseFloat(record.previous_price) : null,
          market_name: record.market_name,
          source: record.source || 'Bulk Upload',
          status: 'published'
        };
        await api.post('/admin/market-prices', payload);
        successCount++;
      } catch (err) {
        console.error("Failed to import record", record);
      }
    }
    setLoading(false);
    setShowBulkUpload(false);
    setPreviewData([]);
    alert(`Successfully imported ${successCount} records.`);
    fetchData();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productNameInput = formData.product_name.trim();
      const matchedProduct = products.find(p => p.title.toLowerCase() === productNameInput.toLowerCase());
      
      if (!matchedProduct) {
        alert('Product not found. Please create this product in Products first.');
        return;
      }

      setUploadingDoc(true);
      let documentUrl = formData.official_document_url;
      
      if (formData.has_government_document === 'yes' && documentFile) {
        const formDataToUpload = new FormData();
        formDataToUpload.append('document', documentFile);
        const uploadRes = await api.post<{success: boolean; data: {url: string}}>('/admin/market-prices/document', formDataToUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (uploadRes.success && uploadRes.data?.url) {
            documentUrl = uploadRes.data.url;
        }
      }
      
      const payload = {
        ...formData,
        product_id: matchedProduct.id,
        category_id: matchedProduct.category_id || formData.category_id,
        official_document_url: formData.has_government_document === 'yes' ? documentUrl : '',
        current_price: parseFloat(formData.current_price) || 0,
        previous_price: formData.previous_price ? parseFloat(formData.previous_price) : null
      };

      if (editingPrice) {
        await api.put(`/admin/market-prices/${editingPrice.id}`, payload);
      } else {
        await api.post('/admin/market-prices', payload);
      }
      setUploadingDoc(false);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      setUploadingDoc(false);
      alert(`Failed to save market price: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleAddMarketSetting = async () => {
    if (!newMarketName.trim()) return;
    const updatedMarkets = [...markets, { id: `m_${Date.now()}`, name: newMarketName.trim(), location: newMarketLoc.trim() }];
    try {
      await api.post('/admin/market-settings', { key: 'markets', value: updatedMarkets });
      setMarkets(updatedMarkets);
      setNewMarketName('');
      setNewMarketLoc('');
    } catch (err) {
      alert('Failed to save market setting');
    }
  };

  const handleDeleteMarket = async (m: any) => {
    console.log("DELETE MARKET CLICKED:", m);
    if (!window.confirm(`Are you sure you want to delete the market "${m.name}"?`)) return;
    try {
      const res = await api.delete<{success: boolean, action: string}>(`/admin/market-settings/market/${m.id}`);
      if (res.success) {
         if (res.action === 'deactivated') {
             alert('Market is in use. It has been deactivated but historical records are preserved.');
             setMarkets(markets.map(x => x.id === m.id ? { ...x, active: false } : x));
         } else {
             setMarkets(markets.filter(x => x.id !== m.id));
         }
      }
    } catch (err: any) {
      alert(`Failed to delete market: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleAddSourceSetting = async () => {
    if (!newSourceName.trim()) return;
    const updatedSources = [...sources, { id: `s_${Date.now()}`, name: newSourceName.trim() }];
    try {
      await api.post('/admin/market-settings', { key: 'price_sources', value: updatedSources });
      setSources(updatedSources);
      setNewSourceName('');
    } catch (err) {
      alert('Failed to save source setting');
    }
  };

  const handleDeleteSource = async (s: any) => {
    console.log("DELETE SOURCE CLICKED:", s);
    if (!window.confirm(`Are you sure you want to delete the source "${s.name}"?`)) return;
    try {
      const res = await api.delete<{success: boolean, action: string}>(`/admin/market-settings/source/${s.id}`);
      if (res.success) {
         if (res.action === 'deactivated') {
             alert('Source is in use. It has been deactivated but historical records are preserved.');
             setSources(sources.map(x => x.id === s.id ? { ...x, active: false } : x));
         } else {
             setSources(sources.filter(x => x.id !== s.id));
         }
      }
    } catch (err: any) {
      alert(`Failed to delete source: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/market-prices/${id}`);
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert("Failed to delete market price");
    }
  };

  const openEdit = (price: any) => {
    setEditingPrice(price);
    setFormData({ product_id: "", 
      product_name: price.product_name || '',
      category_id: price.category_id || '',
      unit: price.unit || '1 Kg',
      current_price: price.current_price || '',
      previous_price: price.previous_price || '',
      market_name: price.market_name || '',
      market_id: price.market_id || '',
      source: price.source || '',
      source_id: price.source_id || '',
      notes: price.notes || '',
      effective_date: price.effective_date || '',
      expiry_date: price.expiry_date || '',
      status: price.status || 'published',
      official_document_url: price.official_document_url || '',
      official_document_name: price.official_document_name || '',
      official_document_date: price.official_document_date || '',
      official_document_ref: price.official_document_ref || '',
      has_government_document: price.official_document_url ? 'yes' : 'no'
    });
    setDocumentFile(null);
    setShowModal(true);
  };

  const openNew = () => {
    setEditingPrice(null);
    setFormData({ product_id: "", 
      product_name: '',
      category_id: categories[0]?.id || '',
      unit: '1 Kg',
      current_price: '',
      previous_price: '',
      market_name: '',
      market_id: '',
      source: '',
      source_id: '',
      notes: '',
      effective_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      status: 'published',
      official_document_url: '',
      official_document_name: '',
      official_document_date: '',
      official_document_ref: '',
      has_government_document: 'no'
    });
    setDocumentFile(null);
    setShowModal(true);
  };

  const filteredPrices = useMemo(() => {
    return prices.filter((item) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const pName = (item.product_name || '').toLowerCase();
        const mName = (item.market_name || '').toLowerCase();
        if (!pName.includes(s) && !mName.includes(s)) return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'published' && item.status !== 'published' && item.status !== 'active') return false;
        if (statusFilter === 'draft' && item.status !== 'draft' && item.status !== 'pending') return false;
      }

      if (categoryFilter !== 'all') {
        if (item.category_id !== categoryFilter) return false;
      }

      return true;
    });
  }, [prices, searchTerm, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Market Prices Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage agricultural commodity prices across markets and regions.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 shadow-xs"
          >
            <Settings className="h-4 w-4" /> Market Settings
          </button>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-200 shadow-xs"
          >
            <Upload className="h-4 w-4" /> Bulk CSV Upload
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Add Market Price
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Market Prices</span>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{prices.length}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Published Prices</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">
            {prices.filter(p => p.status === 'published' || p.status === 'active').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending / Drafts</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-2">
            {prices.filter(p => p.status === 'draft' || p.status === 'pending').length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Configured Markets</span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-2">{markets.length}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search products or markets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published / Active</option>
            <option value="draft">Draft / Pending</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="py-2 px-3 border border-slate-300 rounded-lg text-sm bg-white font-medium text-slate-700"
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <button
            onClick={fetchData}
            className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
            title="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-xs rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Market</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Unit</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredPrices.map((price) => {
                const changeVal = price.price_change || 0;
                return (
                  <tr key={price.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">{price.product_name}</div>
                      <div className="text-xs text-slate-500">{price.category_name || 'Agriculture'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700 font-medium">
                      {price.market_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {price.unit || '1 Kg'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-extrabold text-slate-900">{Number(price.current_price).toLocaleString()} RWF</div>
                      {price.previous_price && (
                        <div className="text-xs text-slate-400 line-through">{Number(price.previous_price).toLocaleString()} RWF</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {changeVal > 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <TrendingUp className="h-3 w-3" /> +{changeVal.toFixed(1)}%
                        </span>
                      ) : changeVal < 0 ? (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <TrendingDown className="h-3 w-3" /> {changeVal.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <Minus className="h-3 w-3" /> 0.0%
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full capitalize ${
                        (price.status === 'published' || price.status === 'active') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {price.status === 'active' ? 'published' : price.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => openEdit(price)} className="text-indigo-600 hover:text-indigo-900 mr-3 p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(price)} className="text-rose-600 hover:text-rose-900 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredPrices.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    No market prices matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Market Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Market & Source Settings</h2>
            
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-600 uppercase">Configured Markets</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-lg bg-slate-50">
                {markets.filter(m => m.active !== false).map((m: any, idx: number) => (
                  <div key={m.id || idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-md border border-slate-200">
                    <div>
                      <span className="font-semibold text-slate-800">{m.name}</span>
                      <span className="text-slate-400 ml-2">({m.location || 'Default'})</span>
                    </div>
                    <button onClick={() => handleDeleteMarket(m)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Add New Market</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Market Name (e.g. Nyabugogo)"
                    value={newMarketName}
                    onChange={(e) => setNewMarketName(e.target.value)}
                    className="p-2 border border-slate-300 rounded-md text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g. Kigali)"
                    value={newMarketLoc}
                    onChange={(e) => setNewMarketLoc(e.target.value)}
                    className="p-2 border border-slate-300 rounded-md text-xs focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddMarketSetting}
                  className="mt-2 text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                >
                  Save New Market
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-600 uppercase">Configured Price Sources</label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 border border-slate-200 p-2 rounded-lg bg-slate-50">
                {sources.filter(s => s.active !== false).map((s: any, idx: number) => (
                  <div key={s.id || idx} className="flex justify-between items-center text-xs bg-white p-2 rounded-md border border-slate-200">
                    <span className="font-semibold text-slate-800">{s.name || s}</span>
                    <button onClick={() => handleDeleteSource(s)} className="text-rose-500 hover:text-rose-700">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Add New Source</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Government Survey"
                    value={newSourceName}
                    onChange={(e) => setNewSourceName(e.target.value)}
                    className="p-2 border border-slate-300 rounded-md text-xs flex-1 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddSourceSetting}
                    className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full my-8 shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Bulk Upload Market Prices</h2>
            <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
              />
              <p className="text-xs text-slate-500 mt-2">
                Required CSV Headers: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800">product_name, market_name, current_price, unit, category</code>
              </p>
            </div>
            
            {previewData.length > 0 && (
              <div className="mt-6 border border-slate-200 rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-bold text-slate-600">Status</th>
                      <th className="px-4 py-2 font-bold text-slate-600">Product</th>
                      <th className="px-4 py-2 font-bold text-slate-600">Market</th>
                      <th className="px-4 py-2 font-bold text-slate-600">Price</th>
                      <th className="px-4 py-2 font-bold text-slate-600">Validation</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {previewData.map((row, i) => (
                      <tr key={i} className={row.valid ? 'bg-white' : 'bg-rose-50/50'}>
                        <td className="px-4 py-2">
                          {row.valid ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1">
                              <CheckCircle className="h-3.5 w-3.5" /> VALID
                            </span>
                          ) : (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" /> INVALID
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 font-medium">{row.product_name}</td>
                        <td className="px-4 py-2">{row.market_name}</td>
                        <td className="px-4 py-2 font-bold">{row.current_price}</td>
                        <td className="px-4 py-2 text-rose-600 font-medium">{row.errors.join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => { setShowBulkUpload(false); setPreviewData([]); }}
                className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={previewData.filter(p => p.valid).length === 0}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
              >
                Import {previewData.filter(p => p.valid).length} Valid Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Price Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full my-8 shadow-xl border border-slate-200">
            <h2 className="text-xl font-bold mb-4 text-slate-900">{editingPrice ? 'Edit Market Price' : 'Add Market Price'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter product name..."
                    value={formData.product_name}
                    onChange={e => setFormData({ product_id: "", ...formData, product_name: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Category</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={e => setFormData({ product_id: "", ...formData, category_id: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Market Name</label>
                  {markets.length === 0 ? (
                    <div className="text-xs text-rose-500 font-semibold p-2.5 border border-rose-200 bg-rose-50 rounded-lg">
                      No markets configured. Please add a market in Market & Source Settings first.
                    </div>
                  ) : (
                      <select
                      required
                      value={formData.market_id}
                      onChange={e => {
                        const selected = markets.find(m => m.id === e.target.value);
                        setFormData({ product_id: "", ...formData, market_id: selected?.id || '', market_name: selected?.name || ''})
                      }}
                      className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                    >
                      <option value="">Select Market ▼</option>
                      {markets.filter(m => m.active !== false).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unit of Measure</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. 1 Kg"
                    value={formData.unit}
                    onChange={e => setFormData({ product_id: "", ...formData, unit: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Price (RWF)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1200"
                    value={formData.current_price}
                    onChange={e => setFormData({ product_id: "", ...formData, current_price: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Previous Price (RWF)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1100"
                    value={formData.previous_price}
                    onChange={e => setFormData({ product_id: "", ...formData, previous_price: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Price Source</label>
                  <select
                    required
                    value={formData.source_id}
                    onChange={e => {
                        const selected = sources.find(s => s.id === e.target.value);
                        setFormData({ product_id: "", ...formData, source_id: selected?.id || '', source: selected?.name || ''})
                      }}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                  >
                    <option value="">Select Price Source ▼</option>
                    {sources.filter(s => s.active !== false).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ product_id: "", ...formData, status: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white font-semibold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Official Government Document</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Government Document Available?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="has_doc"
                          value="yes"
                          checked={formData.has_government_document === 'yes'}
                          onChange={() => setFormData({ product_id: "", ...formData, has_government_document: 'yes'})}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-slate-700">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="has_doc"
                          value="no"
                          checked={formData.has_government_document === 'no'}
                          onChange={() => setFormData({ product_id: "", ...formData, has_government_document: 'no'})}
                          className="text-slate-600 focus:ring-slate-500"
                        />
                        <span className="text-sm font-medium text-slate-700">No official government document available</span>
                      </label>
                    </div>
                  </div>

                  {formData.has_government_document === 'yes' && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Upload Document</label>
                        {formData.official_document_url ? (
                          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2">
                            <CheckCircle className="h-4 w-4" /> Document currently attached
                            <a href={formData.official_document_url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 ml-2 hover:underline">View</a>
                            <button type="button" onClick={() => setFormData({ product_id: "", ...formData, official_document_url: ''})} className="text-xs text-rose-600 ml-3 hover:underline">Remove</button>
                          </div>
                        ) : null}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={e => setDocumentFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                          required={!formData.official_document_url}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Name</label>
                          <input
                            type="text"
                            placeholder="e.g. MINAGRI Weekly Report"
                            value={formData.official_document_name}
                            onChange={e => setFormData({ product_id: "", ...formData, official_document_name: e.target.value})}
                            required={formData.has_government_document === 'yes'}
                            className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Reference Number (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. REF-2026-08"
                            value={formData.official_document_ref}
                            onChange={e => setFormData({ product_id: "", ...formData, official_document_ref: e.target.value})}
                            className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Document Date (Optional)</label>
                          <input
                            type="date"
                            value={formData.official_document_date}
                            onChange={e => setFormData({ product_id: "", ...formData, official_document_date: e.target.value})}
                            className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Notes / Inspection Details</label>
                <textarea
                  rows={2}
                  placeholder="Optional notes or condition of commodity..."
                  value={formData.notes}
                  onChange={e => setFormData({ product_id: "", ...formData, notes: e.target.value})}
                  className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 shadow-xs disabled:opacity-50"
                >
                  {uploadingDoc ? 'Uploading...' : 'Save Market Price'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold mb-2 text-rose-600">Delete Market Price</h2>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirm.product_name}</span> at <span className="font-bold text-slate-900">{deleteConfirm.market_name}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMarketPrices;
