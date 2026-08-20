const fs = require('fs');

const newHomeContent = `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, ShieldCheck, Truck, Star, ArrowRight, Leaf, Droplets, Map, Sun } from 'lucide-react';
import { api } from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get<{success: boolean, data: any[]}>('/products?limit=10');
        if (res.success) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured products', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const renderProductCard = (product: any) => (
    <Link key={product.id} to={\`/products/\${product.id}\`} className="group bg-white rounded-xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img 
          src={product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'} 
          alt={product.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.condition === 'New' && (
          <span className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
            New
          </span>
        )}
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold text-sky-600 mb-1.5 uppercase tracking-wider">{product.categories?.name || 'Produce'}</div>
        <h3 className="font-bold text-slate-900 text-base mb-1.5 line-clamp-1 group-hover:text-green-600 transition-colors">{product.title}</h3>
        <p className="text-slate-500 text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <span className="text-lg font-extrabold text-green-700">RWF {product.price.toLocaleString()}</span>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{product.unit}</span>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop" 
            alt="Agriculture Landscape" 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-sky-900/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-sm font-medium text-green-50 tracking-wide">AgroNavo Marketplace</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-tight max-w-4xl">
            {t('home.hero_title')}
          </h1>
          <p className="text-lg sm:text-xl text-green-50/90 mb-10 max-w-2xl font-light leading-relaxed">
            {t('home.hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
            <Link 
              to="/products" 
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {t('home.shop_now')} <ArrowRight size={20} />
            </Link>
            <Link 
              to="/market-prices" 
              className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2"
            >
              {t('home.explore_tools')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white relative -mt-8 rounded-t-3xl z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">{t('home.featured_categories')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: t('home.fresh_produce'), icon: <Leaf className="w-6 h-6 text-green-600" />, bg: 'bg-green-50' },
              { title: t('home.seeds_plants'), icon: <Droplets className="w-6 h-6 text-sky-600" />, bg: 'bg-sky-50' },
              { title: t('home.fertilizers'), icon: <Sun className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50' },
              { title: t('home.farm_tools'), icon: <Map className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
            ].map((cat, idx) => (
              <Link key={idx} to="/products" className={\`flex flex-col items-center justify-center p-6 rounded-2xl \${cat.bg} border border-slate-100 hover:shadow-md transition-all group\`}>
                <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <span className="font-semibold text-slate-800 text-center">{cat.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('home.trending_products')}</h2>
              <p className="text-slate-500 mt-2">Discover top-rated agricultural products.</p>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-white rounded-xl border border-slate-100 overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/2 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {products.slice(0, 10).map(p => renderProductCard(p))}
              {products.length === 0 && (
                 <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200">
                   <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                     <Search className="w-8 h-8 text-slate-400" />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 mb-2">No Products Found</h3>
                   <p className="text-slate-500">Products are currently being updated. Please check back later.</p>
                 </div>
              )}
            </div>
          )}
          
          {products.length > 0 && (
            <div className="mt-12 text-center">
              <Link to="/products" className="inline-flex items-center justify-center px-8 py-3 border-2 border-green-600 text-base font-bold rounded-xl text-green-700 bg-transparent hover:bg-green-50 transition-colors">
                {t('home.load_more')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Trust & Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-green-100 to-sky-100 rounded-3xl transform -rotate-3 scale-105 -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1595841696650-6f772ba1ceaa?q=80&w=800&auto=format&fit=crop" 
                alt="Farmers using technology" 
                className="w-full h-auto rounded-3xl shadow-xl object-cover"
              />
            </div>
            <div className="order-1 md:order-2 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">Empowering Farmers with <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-sky-600">Smart Technology</span></h2>
                <p className="text-lg text-slate-600 leading-relaxed">AgroNavo provides real-time market prices, AI-driven plant health diagnostics, and a secure marketplace to transform how agriculture operates.</p>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('home.fast_delivery')}</h3>
                    <p className="text-slate-600">{t('home.fast_delivery_desc')}</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{t('home.secure_payments')}</h3>
                    <p className="text-slate-600">{t('home.secure_payments_desc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
`;
fs.writeFileSync('src/pages/public/Home.tsx', newHomeContent);
