import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ExternalLink } from 'lucide-react';

export function BuyerSaved() {
  const [savedItems, setSavedItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/buyer/favorites');
        if (res.success) {
          setSavedItems(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch favorites', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      const res = await api.delete<{ success: boolean }>(`/buyer/favorites/${id}`);
      if (res.success) {
        setSavedItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Failed to remove favorite', error);
    }
  };

  const handleMoveToCart = (item: any) => {
    // In a real application, this would call a cart API or update Cart context
    alert(`Moved ${item.products?.title} to cart`);
    handleRemove(item.id);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-64 bg-slate-200 rounded-xl"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
        <div className="h-64 bg-slate-200 rounded-xl"></div>
      </div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Wishlist</h1>
        {savedItems.length > 0 && (
          <span className="text-sm font-medium text-slate-500">{savedItems.length} items</span>
        )}
      </div>
      
      {savedItems.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <Heart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No saved items</h3>
          <p className="mt-1 text-sm text-slate-500">Products you save for later will appear here.</p>
          <div className="mt-6">
            <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedItems.map((item) => {
            const product = item.products;
            const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
            
            return (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col group">
                <div className="relative aspect-w-4 aspect-h-3 bg-slate-100 w-full overflow-hidden h-48 block">
                  <img src={primaryImage} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleRemove(item.id)} 
                      className="p-2 bg-white rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 shadow-sm transition-colors" 
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <Link 
                      to={`/products/${product.id}`} 
                      className="p-2 bg-white rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50 shadow-sm transition-colors" 
                      title="Open Product Details"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <Link to={`/products/${product.id}`} className="hover:text-green-600 transition-colors">
                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{product.title}</h3>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4">{product.description || 'No description available.'}</p>
                  
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-lg font-extrabold text-slate-900">${product.price} <span className="text-sm font-normal text-slate-500">/ {product.unit}</span></p>
                    <button 
                      onClick={() => handleMoveToCart(item)}
                      className="inline-flex items-center justify-center p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors font-medium text-sm"
                      title="Move to Cart"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
