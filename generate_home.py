import os

header_code = """import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, LogOut, User as UserIcon, Heart, MessageSquare, Bell, Search, Menu } from 'lucide-react';
import { api } from '../../lib/api';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/categories');
        if (res.success) {
          setCategories(res.data);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">AgroMart</span>
            </Link>
          </div>
          
          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600">
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          <div className="flex items-center space-x-4">
            <nav className="hidden lg:flex items-center space-x-6 mr-4">
              <div className="relative group">
                <button 
                  className="flex items-center text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                  onMouseEnter={() => setShowCategories(true)}
                  onMouseLeave={() => setShowCategories(false)}
                >
                  <Menu className="h-4 w-4 mr-1" /> Categories
                </button>
                {showCategories && (
                  <div 
                    className="absolute top-full left-0 w-48 bg-white shadow-lg border border-slate-100 rounded-md py-2 z-50"
                    onMouseEnter={() => setShowCategories(true)}
                    onMouseLeave={() => setShowCategories(false)}
                  >
                    {categories.map(c => (
                      <Link key={c.id} to={`/products?category=${c.id}`} className="block px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600">
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Home</Link>
              <Link to="/products" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Products</Link>
            </nav>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/buyer/saved" className="text-slate-500 hover:text-rose-500 transition-colors">
                  <Heart className="h-5 w-5" />
                </Link>
                <Link to={user.role === 'admin' ? '/admin/messages' : user.role === 'seller' ? '/seller/messages' : '/buyer/messages'} className="text-slate-500 hover:text-emerald-600 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link to={user.role === 'admin' ? '/admin/notifications' : user.role === 'seller' ? '/seller/settings' : '/buyer/notifications'} className="text-slate-500 hover:text-amber-500 transition-colors">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                <Link 
                  to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/buyer'}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden sm:inline">Account</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors ml-2"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/seller/login" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors mr-2 hidden sm:block">
                  Seller Portal
                </Link>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Search */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-md focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
"""

footer_code = """import { Link } from 'react-router-dom';
import { Leaf, Facebook, Twitter, Instagram, Linkedin, CreditCard, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Leaf className="h-8 w-8 text-emerald-500" />
              <span className="text-2xl font-bold text-white tracking-tight">AgroMart</span>
            </Link>
            <p className="text-sm text-slate-400 mb-6 max-w-xs">
              Your direct marketplace connecting verified local farmers with buyers for fresh, authentic, and sustainable agricultural produce.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors"><Linkedin className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link to="/about" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Contact Us</Link></li>
              <li><Link to="/careers" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Careers</Link></li>
              <li><Link to="/blog" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal & Support</h3>
            <ul className="space-y-3">
              <li><Link to="/privacy" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/returns" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">Return & Refund</Link></li>
              <li><Link to="/faq" className="text-sm text-slate-400 hover:text-emerald-400 transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Secure Shopping</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-400"><CreditCard className="h-4 w-4" /> Secure Payment Methods</li>
              <li className="flex items-center gap-2 text-sm text-slate-400"><ShieldCheck className="h-4 w-4" /> Buyer Protection</li>
            </ul>
            <div className="mt-4 flex gap-2">
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">VISA</div>
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">MC</div>
              <div className="w-10 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold">PAY</div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} AgroMart. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex gap-4 text-sm text-slate-500">
            <span>Powered by secure farm-to-table logistics.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
"""

home_code = """import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, ShieldCheck, Truck, Clock, Star, Zap, ShoppingCart, Heart, MessageCircle, HelpCircle } from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function Home() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600 * 24); // 24 hours in seconds

  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get<{ success: boolean; data: any[] }>('/products'),
          api.get<{ success: boolean; data: any[] }>('/categories')
        ]);
        if (prodRes.success) setProducts(prodRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    }
    fetchData();

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderProductCard = (product: any, showDiscount = false) => {
    const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
    return (
      <Link key={product.id} to={`/products/${product.id}`} className="group bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-all flex flex-col h-full relative">
        {showDiscount && product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
            -{product.discount}%
          </div>
        )}
        <div className="aspect-w-4 aspect-h-3 bg-slate-100 w-full overflow-hidden h-48 relative">
          <img src={primaryImage} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Heart className="h-4 w-4 text-slate-400 hover:text-rose-500" />
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-1">{product.categories?.name || 'Produce'}</p>
          <h3 className="text-sm font-bold text-slate-900 mb-1 line-clamp-2 flex-grow">{product.title}</h3>
          <div className="flex items-center gap-1 mb-2">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-slate-700">4.8</span>
            <span className="text-xs text-slate-400">(124)</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
            <div>
              <p className="text-lg font-extrabold text-slate-900">
                ${product.discount ? (product.price * (1 - product.discount / 100)).toFixed(2) : parseFloat(product.price).toFixed(2)}
              </p>
              {product.discount > 0 && (
                <p className="text-xs text-slate-400 line-through">${parseFloat(product.price).toFixed(2)}</p>
              )}
            </div>
            <button className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white p-2 rounded-full transition-colors">
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Welcome Section (Personalized) */}
      {user && (
        <section className="bg-emerald-50 py-4 border-b border-emerald-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-emerald-800 font-medium mb-2 sm:mb-0">
              Welcome back, <span className="font-bold">{user.full_name}</span>! Find the freshest produce today.
            </p>
            <div className="flex gap-4">
              <Link to="/buyer/orders" className="text-sm text-emerald-700 hover:text-emerald-900 font-medium underline">My Orders</Link>
              <Link to="/buyer/orders" className="text-sm text-emerald-700 hover:text-emerald-900 font-medium underline">Track Order</Link>
              <Link to="/products" className="text-sm text-emerald-700 hover:text-emerald-900 font-medium underline">Continue Shopping</Link>
            </div>
          </div>
        </section>
      )}

      {/* Hero Banner */}
      <section className="relative bg-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" alt="Farm" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col md:flex-row items-center justify-between">
          <div className="max-w-2xl text-center md:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-emerald-800 text-emerald-100 text-sm font-semibold mb-4 tracking-wide uppercase">Seasonal Sales • Up to 30% Off</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Fresh from Farm <br className="hidden md:block" />to Your Table
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-10 max-w-xl mx-auto md:mx-0">
              Discover a direct marketplace connecting you with local farmers. Get the freshest produce, new arrivals, and special offers every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link to="/products" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-md text-emerald-900 bg-white hover:bg-emerald-50 transition-colors shadow-lg">
                Shop Now <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/products?discount=true" className="inline-flex items-center justify-center px-8 py-3 border border-emerald-400 text-base font-bold rounded-md text-white hover:bg-emerald-800 transition-colors">
                Explore Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl hover:bg-emerald-50 hover:shadow-md transition-all group border border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-110 transition-transform">
                    <img src={cat.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'} alt={cat.name} className="w-10 h-10 object-contain rounded-full" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-emerald-700 text-center">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Flash Deals */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-8 w-8 text-rose-500 fill-rose-500" /> Flash Deals
              </h2>
              <div className="bg-rose-100 text-rose-700 font-mono font-bold px-3 py-1 rounded-md tracking-wider">
                {formatTime(timeLeft)}
              </div>
            </div>
            <Link to="/products?discount=true" className="text-emerald-600 hover:text-emerald-700 font-medium inline-flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map(p => renderProductCard({...p, discount: p.discount || 15}, true))}
          </div>
        </div>
      </section>

      {/* Products Available & Filters (Preview) */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Discover Fresh Products</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Explore our wide selection of farm-fresh goods, carefully curated to ensure quality and taste. Filter by category, price, brand, or rating.</p>
          </div>
          
          {/* Mock Filter Bar */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center">
            <span className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium cursor-pointer">All Products</span>
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-200">Recent Searches</span>
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-200">Price: Low to High</span>
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-200">Top Rated</span>
            <span className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium cursor-pointer hover:bg-slate-200">Brand Filter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {products.slice(0, 10).map(p => renderProductCard(p))}
            {products.length === 0 && (
               <div className="col-span-full py-12 text-center text-slate-500">
                 No products available right now. Please check back later.
               </div>
            )}
          </div>
          
          {products.length > 0 && (
            <div className="mt-12 text-center">
              <Link to="/products" className="inline-flex items-center justify-center px-8 py-3 border border-slate-300 text-base font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                Load More Products
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recommended For You / Best Selling / New Arrivals */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Best Selling */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Best Selling</h3>
              <div className="space-y-4">
                {products.slice(0, 3).map(p => (
                  <Link key={`best-${p.id}`} to={`/products/${p.id}`} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                    <img src={p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt={p.title} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">{p.title}</h4>
                      <p className="text-emerald-600 font-bold mt-1">${p.price}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* New Arrivals */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">New Arrivals</h3>
              <div className="space-y-4">
                {products.slice().reverse().slice(0, 3).map(p => (
                  <Link key={`new-${p.id}`} to={`/products/${p.id}`} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                    <img src={p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt={p.title} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">{p.title}</h4>
                      <p className="text-emerald-600 font-bold mt-1">${p.price}</p>
                      <span className="inline-block mt-1 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recommended For You & Recently Viewed */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-2">Recommended & Recent</h3>
              <div className="space-y-4">
                {products.slice(1, 4).map(p => (
                  <Link key={`rec-${p.id}`} to={`/products/${p.id}`} className="flex gap-4 p-3 bg-white rounded-lg border border-slate-100 hover:shadow-md transition-shadow">
                    <img src={p.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'} alt={p.title} className="w-20 h-20 object-cover rounded-md" />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm line-clamp-2">{p.title}</h4>
                      <p className="text-emerald-600 font-bold mt-1">${p.price}</p>
                      <p className="text-xs text-slate-500 mt-1">Based on your interests</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Social Proof */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">What Our Buyers Say</h2>
            <p className="text-slate-500">Real reviews from verified purchases across our farm network.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-lg">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Happy Buyer {i}</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex text-amber-400">
                        <Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" />
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-semibold flex items-center"><ShieldCheck className="h-3 w-3 mr-0.5"/> Verified</span>
                    </div>
                  </div>
                </div>
                <p className="text-slate-600 text-sm italic">"The freshest produce I've ever bought online. The delivery was fast, and the quality is outstanding. Will definitely buy from this farmer again!"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Support Info */}
      <section className="py-12 bg-emerald-900 text-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Truck className="h-8 w-8 mb-4 text-emerald-400" />
              <h4 className="font-bold text-white mb-2">Fast Delivery</h4>
              <p className="text-sm text-emerald-200">Direct from farm to your door</p>
            </div>
            <div className="flex flex-col items-center">
              <MessageCircle className="h-8 w-8 mb-4 text-emerald-400" />
              <h4 className="font-bold text-white mb-2">Live Chat Support</h4>
              <p className="text-sm text-emerald-200">We're here to help 24/7</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-8 w-8 mb-4 text-emerald-400" />
              <h4 className="font-bold text-white mb-2">Secure Payments</h4>
              <p className="text-sm text-emerald-200">100% secure checkout</p>
            </div>
            <div className="flex flex-col items-center">
              <HelpCircle className="h-8 w-8 mb-4 text-emerald-400" />
              <h4 className="font-bold text-white mb-2">Return & Refund</h4>
              <p className="text-sm text-emerald-200">Money-back guarantee</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
"""

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(header_code)

with open('src/components/layout/Footer.tsx', 'w') as f:
    f.write(footer_code)

with open('src/pages/public/Home.tsx', 'w') as f:
    f.write(home_code)
