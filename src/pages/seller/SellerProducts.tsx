import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Package, Edit2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await api.patch<{success: boolean}>(`/products/${id}/status`, { status: newStatus });
      if (res.success) {
        setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };


  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/products');
        if (res.success) {
          // Filter products for the current seller
          // (In a real app, we'd have a specific endpoint like /seller/products)
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

  if (isLoading) {
    return <div className="animate-pulse">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
        <Link to="/seller/products/new" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
          Add Product
        </Link>
      </div>
      
      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No products yet</h3>
          <p className="mt-1 text-sm text-slate-500">Get started by creating your first product.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {products.map((product) => {
                const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
                return (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-200 rounded-md overflow-hidden">
                         <img src={primaryImage} alt="" className="h-10 w-10 object-cover" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{product.title}</div>
                        <div className="text-sm text-slate-500">{product.category_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">${product.price} / {product.unit_of_measure}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{product.stock_quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={product.status} 
                      onChange={(e) => handleStatusChange(product.id, e.target.value)}
                      className={`text-xs font-semibold rounded-full px-2 py-1 border-0 focus:ring-2 focus:ring-green-500 cursor-pointer ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/products/${product.id}`} className="text-slate-400 hover:text-green-600 mr-3" title="View Public Page">
                      <ExternalLink className="h-4 w-4 inline" />
                    </Link>
                    <Link to={`/seller/products/${product.id}/edit`} className="text-slate-400 hover:text-green-600" title="Edit Product">
                      <Edit2 className="h-4 w-4 inline" />
                    </Link>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
