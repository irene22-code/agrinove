import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';

export function BuyerRecent() {
  const [recentProducts, setRecentProducts] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('agromart_recent');
    if (stored) {
      try {
        setRecentProducts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent products');
      }
    }
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your viewing history?')) {
      localStorage.removeItem('agromart_recent');
      setRecentProducts([]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Recently Viewed</h1>
        {recentProducts.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:text-rose-600 transition-colors font-medium text-sm shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </button>
        )}
      </div>
      
      {recentProducts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <Clock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No recently viewed items</h3>
          <p className="mt-1 text-sm text-slate-500">Products you view will appear here.</p>
          <div className="mt-6">
            <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
              Start Browsing
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recentProducts.map((product) => {
            const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
            
            return (
              <Link key={product.id} to={`/products/${product.id}`} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col">
                <div className="aspect-w-4 aspect-h-3 bg-slate-100 w-full overflow-hidden h-48">
                  <img src={primaryImage} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">{product.categories?.name || 'Category'}</p>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">{product.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <p className="text-lg font-extrabold text-slate-900">${product.price} <span className="text-sm font-normal text-slate-500">/ {product.unit}</span></p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
