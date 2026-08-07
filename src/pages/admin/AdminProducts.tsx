import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Package, Search, Filter, Eye, CheckCircle, XCircle, Archive, Trash2, ArrowUpDown } from 'lucide-react';

export function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/products');
      if (res.success) {
        setProducts(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProductStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch<{success: boolean}>(`/admin/products/${id}/status`, { status });
      if (res.success) {
        fetchProducts();
        if (selectedProduct && selectedProduct.id === id) {
           setSelectedProduct({...selectedProduct, status});
        }
      }
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };


  const deleteProduct = async (id: string) => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      const res = await api.delete<{success: boolean}>(`/admin/products/${id}`);
      if (res.success) {
        fetchProducts();
        setProductToDelete(null);
        setDeleteConfirmText('');
        if (selectedProduct?.id === id) setSelectedProduct(null);
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert(error.message || 'Failed to delete product');
    }
  };

  const sortData = (key: string) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCategory = categoryFilter === 'all' || product.categories?.id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (sortConfig.key === 'price' || sortConfig.key === 'stock_quantity') {
      aValue = Number(aValue || 0);
      bValue = Number(bValue || 0);
    } else if (sortConfig.key === 'created_at') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const categories = Array.from(new Set(products.map(p => p.categories?.id).filter(Boolean))).map(id => {
      const cat = products.find(p => p.categories?.id === id)?.categories;
      return cat;
  });

  if (isLoading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;

  if (selectedProduct) {
      const primaryImage = selectedProduct.product_images?.find((img: any) => img.is_primary) || selectedProduct.product_images?.[0];
      return (
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <button onClick={() => setSelectedProduct(null)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">← Back to Products</button>
                 <div className="flex gap-2">
                    {selectedProduct.status !== 'active' && <button onClick={() => updateProductStatus(selectedProduct.id, 'active')} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700">Activate</button>}
                    {selectedProduct.status !== 'inactive' && <button onClick={() => updateProductStatus(selectedProduct.id, 'inactive')} className="bg-slate-600 text-white px-3 py-1.5 rounded text-sm hover:bg-slate-700">Deactivate</button>}
                    {selectedProduct.status !== 'archived' && <button onClick={() => updateProductStatus(selectedProduct.id, 'archived')} className="bg-orange-600 text-white px-3 py-1.5 rounded text-sm hover:bg-orange-700">Archive</button>}
                    <button onClick={() => { setProductToDelete(selectedProduct.id); setDeleteConfirmText(''); }} className="bg-red-600 text-white px-3 py-1.5 rounded text-sm hover:bg-red-700">Delete</button>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                          <div className="aspect-square bg-slate-100 rounded-lg mb-4 overflow-hidden">
                              {primaryImage ? (
                                  <img src={primaryImage.url} alt={selectedProduct.title} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                              )}
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                              {selectedProduct.product_images?.map((img: any, i: number) => (
                                  <div key={i} className={`aspect-square bg-slate-100 rounded overflow-hidden ${img.is_primary ? 'ring-2 ring-emerald-500' : ''}`}>
                                      <img src={img.url} className="w-full h-full object-cover" />
                                  </div>
                              ))}
                          </div>
                      </div>
                      <div className="space-y-6">
                          <div>
                              <div className="flex justify-between items-start">
                                  <h1 className="text-2xl font-bold text-slate-900">{selectedProduct.title}</h1>
                                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${selectedProduct.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>{selectedProduct.status}</span>
                              </div>
                              <p className="text-sm text-slate-500 mt-1">ID: {selectedProduct.id} | SKU: {selectedProduct.sku || 'N/A'}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 p-3 rounded">
                                  <p className="text-xs text-slate-500 font-medium">Price</p>
                                  <p className="text-lg font-bold text-slate-900">${selectedProduct.price}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded">
                                  <p className="text-xs text-slate-500 font-medium">Stock Quantity</p>
                                  <p className="text-lg font-bold text-slate-900">{selectedProduct.stock_quantity}</p>
                              </div>
                          </div>
                          
                          <div>
                              <h3 className="font-semibold text-slate-900 mb-2">Basic Information</h3>
                              <div className="text-sm text-slate-600 space-y-1">
                                  <p><span className="font-medium text-slate-900">Category:</span> {selectedProduct.categories?.name}</p>
                                  <p><span className="font-medium text-slate-900">Brand:</span> {selectedProduct.brand || 'N/A'}</p>
                                  <p><span className="font-medium text-slate-900">Discount:</span> {selectedProduct.discount_percentage ? `${selectedProduct.discount_percentage}%` : 'None'}</p>
                                  <p><span className="font-medium text-slate-900">Tax/VAT:</span> {selectedProduct.tax_percentage ? `${selectedProduct.tax_percentage}%` : 'None'}</p>
                              </div>
                          </div>

                          <div>
                              <h3 className="font-semibold text-slate-900 mb-2">Physical Details</h3>
                              <div className="text-sm text-slate-600 space-y-1">
                                  <p><span className="font-medium text-slate-900">Weight:</span> {selectedProduct.weight || 'N/A'}</p>
                                  <p><span className="font-medium text-slate-900">Dimensions:</span> {selectedProduct.length || '-'} x {selectedProduct.width || '-'} x {selectedProduct.height || '-'}</p>
                                  <p><span className="font-medium text-slate-900">Color:</span> {selectedProduct.color || 'N/A'}</p>
                                  <p><span className="font-medium text-slate-900">Size:</span> {selectedProduct.size || 'N/A'}</p>
                                  <p><span className="font-medium text-slate-900">Material:</span> {selectedProduct.material || 'N/A'}</p>
                              </div>
                          </div>

                          <div>
                              <h3 className="font-semibold text-slate-900 mb-2">Seller Information</h3>
                              <div className="text-sm text-slate-600 space-y-1">
                                  <p><span className="font-medium text-slate-900">Business Name:</span> {selectedProduct.sellers?.business_name}</p>
                                  <p><span className="font-medium text-slate-900">Owner Name:</span> {selectedProduct.sellers?.users?.full_name}</p>
                                  <p><span className="font-medium text-slate-900">Email:</span> {selectedProduct.sellers?.users?.email}</p>
                                  <p><span className="font-medium text-slate-900">Phone:</span> {selectedProduct.sellers?.phone_number || 'N/A'}</p>
                                  <p><span className="font-medium text-slate-900">Location:</span> {selectedProduct.sellers?.location || 'N/A'}</p>
                              </div>
                          </div>

                          {selectedProduct.description && (
                              <div>
                                  <h3 className="font-semibold text-slate-900 mb-2">Description</h3>
                                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedProduct.description}</p>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Manage Products</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-4">
            <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white min-w-[150px]"
            >
                <option value="all">All Categories</option>
                {categories.map((c: any) => c && <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            </div>
            <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white min-w-[150px]"
            >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
                <option value="rejected">Rejected</option>
            </select>
            </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No products found</h3>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Seller</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => sortData('price')}>
                    <div className="flex items-center gap-1">Price <ArrowUpDown className="h-4 w-4" /></div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => sortData('stock_quantity')}>
                    <div className="flex items-center gap-1">Stock <ArrowUpDown className="h-4 w-4" /></div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer" onClick={() => sortData('created_at')}>
                    <div className="flex items-center gap-1">Date <ArrowUpDown className="h-4 w-4" /></div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredProducts.map((product) => {
                    const primaryImage = product.product_images?.find((img: any) => img.is_primary) || product.product_images?.[0];
                    return (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
                            {primaryImage ? (
                                <img src={primaryImage.url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <Package className="h-6 w-6 text-slate-400 m-2" />
                            )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{product.title}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[200px]">{product.categories?.name} • SKU: {product.sku || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{product.sellers?.business_name}</div>
                      <div className="text-xs text-slate-500">{product.sellers?.users?.full_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">${product.price}</div>
                      {product.discount_percentage && <div className="text-xs text-emerald-600">-{product.discount_percentage}%</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{product.stock_quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        product.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                        product.status === 'inactive' ? 'bg-slate-100 text-slate-800' : 
                        product.status === 'archived' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                         <button onClick={() => setSelectedProduct(product)} className="text-slate-400 hover:text-emerald-600 transition-colors" title="View Details">
                            <Eye className="h-5 w-5" />
                         </button>
                         {product.status !== 'active' && (
                             <button onClick={() => updateProductStatus(product.id, 'active')} className="text-slate-400 hover:text-emerald-600 transition-colors" title="Activate">
                                 <CheckCircle className="h-5 w-5" />
                             </button>
                         )}
                         {product.status === 'active' && (
                             <button onClick={() => updateProductStatus(product.id, 'inactive')} className="text-slate-400 hover:text-slate-600 transition-colors" title="Deactivate">
                                 <XCircle className="h-5 w-5" />
                             </button>
                         )}
                         <button onClick={(e) => { e.stopPropagation(); setProductToDelete(product.id); setDeleteConfirmText(''); }} className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                             <Trash2 className="h-5 w-5" />
                         </button>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Product Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Product</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this product? This is a destructive action.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => deleteProduct(productToDelete)} 
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
