import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Package, Search, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SellerInventory() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/products');
        if (res.success) {
          const sellerProducts = res.data.filter(p => p.seller_id === user?.id);
          setProducts(sellerProducts);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [user]);

  const updateStock = async (id: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    setUpdatingId(id);
    try {
      const res = await api.patch<{ success: boolean; data: any }>(`/products/${id}/stock`, { stock_quantity: newQuantity, note: 'Manual update from inventory' });
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock_quantity: newQuantity } : p));
      }
    } catch (err) {
      console.error('Failed to update stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredProducts = products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="animate-pulse">Loading inventory...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No inventory found</h3>
          <p className="mt-1 text-sm text-slate-500">Add products to start managing inventory.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Unit</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Stock Quantity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{product.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{product.unit_of_measure}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.stock_quantity <= 0 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Out of Stock</span>
                    ) : product.stock_quantity < 10 ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Low Stock</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-3">
                      <button 
                        onClick={() => updateStock(product.id, product.stock_quantity - 1)}
                        disabled={product.stock_quantity <= 0 || updatingId === product.id}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium text-slate-900">
                        {updatingId === product.id ? '...' : product.stock_quantity}
                      </span>
                      <button 
                        onClick={() => updateStock(product.id, product.stock_quantity + 1)}
                        disabled={updatingId === product.id}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
