import { useState, useEffect } from 'react';
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
  const [favoritesCount, setFavoritesCount] = useState(0);

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

  useEffect(() => {
    async function fetchFavorites() {
      if (user && user.role === 'buyer') {
        try {
          const res = await api.get<{ success: boolean; data: any }>('/buyer/stats');
          if (res.success) {
            setFavoritesCount(res.data.favoritesCount || 0);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setFavoritesCount(0);
      }
    }
    fetchFavorites();

    const handleFavoritesUpdate = () => fetchFavorites();
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);
    return () => window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
  }, [user]);

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
                <Link to="/buyer/saved" className="text-slate-500 hover:text-rose-500 transition-colors relative">
                  <Heart className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <Link to={user.role === 'seller' ? '/seller/messages' : '/buyer/messages'} className="text-slate-500 hover:text-emerald-600 transition-colors">
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link to={user.role === 'seller' ? '/seller/settings' : '/buyer/notifications'} className="text-slate-500 hover:text-amber-500 transition-colors">
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                <Link 
                  to={user.role === 'seller' ? '/seller' : '/buyer'}
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
                <Link to="/buyer/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Buyer Login
                </Link>
                <span className="text-slate-300 hidden sm:inline">|</span>
                <Link to="/seller/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Seller Login
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
