import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Leaf, 
  LogOut, 
  User as UserIcon, 
  Heart, 
  MessageSquare, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ChevronDown,
  CloudSun,
  TrendingUp,
  ShieldAlert,
  Calendar,
  ShoppingBag,
  Grid
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { api } from '../../lib/api';

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategories, setShowCategories] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  // Close mobile menu on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileCategoriesOpen(false);
    setShowCategories(false);
  }, [location.pathname]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/categories');
        if (res.success) {
          setCategories(res.data || []);
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
      setMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-2 sm:gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-slate-600 hover:text-green-600 lg:hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600 shrink-0" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">AgroNavo</span>
            </Link>
          </div>
          
          {/* Desktop Search Bar */}
          <div className="flex-1 max-w-lg hidden md:block mx-2">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder={t('home.search_placeholder') || "Search products, brands, or categories..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-full focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600" aria-label="Search">
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-5">
            <div className="relative group">
              <button 
                className={`flex items-center text-sm font-medium py-1 transition-colors ${
                  showCategories ? 'text-green-600' : 'text-slate-600 hover:text-green-600'
                }`}
                onMouseEnter={() => setShowCategories(true)}
                onMouseLeave={() => setShowCategories(false)}
              >
                <Grid className="h-4 w-4 mr-1" />
                <span>{t('nav.categories')}</span>
                <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
              </button>
              {showCategories && (
                <div 
                  className="absolute top-full left-0 w-56 bg-white shadow-xl border border-slate-100 rounded-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseEnter={() => setShowCategories(true)}
                  onMouseLeave={() => setShowCategories(false)}
                >
                  <Link 
                    to="/products" 
                    className="block px-4 py-2 text-xs font-bold uppercase tracking-wider text-green-700 hover:bg-green-50"
                  >
                    {language === 'rw' ? 'Ibyiciro Byose' : 'All Categories'}
                  </Link>
                  <div className="h-px bg-slate-100 my-1"></div>
                  {categories.map(c => (
                    <Link 
                      key={c.id} 
                      to={`/products?category=${c.id}`} 
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-green-50 hover:text-green-600"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors ${
                isActive('/') && location.pathname === '/' ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'
              }`}
            >
              {t('nav.home')}
            </Link>

            <Link 
              to="/products" 
              className={`text-sm font-medium transition-colors ${
                isActive('/products') || isActive('/marketplace') ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'
              }`}
            >
              {t('nav.marketplace') || t('nav.products')}
            </Link>

            <Link 
              to="/market-prices" 
              className={`text-sm font-medium transition-colors ${
                isActive('/market-prices') ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'
              }`}
            >
              {t('nav.market_prices')}
            </Link>

            <Link 
              to="/plant-health" 
              className={`text-sm font-medium transition-colors ${
                isActive('/plant-health') ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'
              }`}
            >
              {t('nav.plant_health')}
            </Link>

            <Link 
              to="/crop-calendar" 
              className={`text-sm font-medium transition-colors ${
                isActive('/crop-calendar') ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'
              }`}
            >
              {t('nav.crop_calendar')}
            </Link>

            <Link 
              to="/weather" 
              className={`text-sm font-medium transition-colors ${
                isActive('/weather') ? 'text-green-600 font-semibold' : 'text-slate-600 hover:text-green-600'
              }`}
            >
              {t('nav.weather')}
            </Link>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-0.5 border border-slate-200">
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-2 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                  language === 'en' ? 'bg-white text-green-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden xl:inline">EN</span>
              </button>
              <button 
                onClick={() => setLanguage('rw')} 
                className={`px-2 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 ${
                  language === 'rw' ? 'bg-white text-green-700 shadow-xs' : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Kinyarwanda"
              >
                <span>🇷🇼</span>
                <span className="hidden xl:inline">RW</span>
              </button>
            </div>

            {user ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Link to="/buyer/saved" className="p-1.5 text-slate-500 hover:text-rose-500 transition-colors relative" aria-label="Saved products">
                  <Heart className="h-5 w-5" />
                  {favoritesCount > 0 && (
                    <span className="absolute 0 right-0 bg-rose-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to={user.role === 'seller' ? '/seller/messages' : '/buyer/messages'} 
                  className="p-1.5 text-slate-500 hover:text-green-600 transition-colors"
                  aria-label="Messages"
                >
                  <MessageSquare className="h-5 w-5" />
                </Link>
                <Link 
                  to={user.role === 'seller' ? '/seller/settings' : '/buyer/notifications'} 
                  className="p-1.5 text-slate-500 hover:text-amber-500 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </Link>
                <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                <Link 
                  to={user.role === 'seller' ? '/seller' : '/buyer'}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-green-600 transition-colors"
                >
                  <UserIcon className="h-5 w-5" />
                  <span className="hidden md:inline">{t('nav.account')}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/buyer/login" className="text-xs sm:text-sm font-medium text-slate-700 hover:text-green-600 transition-colors px-2 py-1">
                  {t('nav.buyer_login')}
                </Link>
                <span className="text-slate-300">|</span>
                <Link to="/seller/login" className="text-xs sm:text-sm font-medium text-slate-700 hover:text-green-600 transition-colors px-2 py-1">
                  {t('nav.seller_login')}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder={t('home.search_placeholder') || "Search products..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-green-600" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/') && location.pathname === '/' ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Leaf className="w-4 h-4 text-green-600" />
              {t('nav.home')}
            </Link>

            <Link
              to="/products"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/products') || isActive('/marketplace') ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-green-600" />
              {t('nav.marketplace') || t('nav.products')}
            </Link>

            {/* Collapsible Mobile Categories */}
            <div>
              <button
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span className="flex items-center gap-3">
                  <Grid className="w-4 h-4 text-green-600" />
                  {t('nav.categories')}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileCategoriesOpen && (
                <div className="pl-9 pr-3 py-1 space-y-1 bg-slate-50 rounded-xl mb-1">
                  <Link
                    to="/products"
                    className="block py-1.5 text-xs font-semibold text-green-700 hover:text-green-800"
                  >
                    {language === 'rw' ? 'Ibyiciro Byose' : 'Browse All Products'}
                  </Link>
                  {categories.map(c => (
                    <Link
                      key={c.id}
                      to={`/products?category=${c.id}`}
                      className="block py-1.5 text-xs text-slate-600 hover:text-green-600"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/market-prices"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/market-prices') ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-green-600" />
              {t('nav.market_prices')}
            </Link>

            <Link
              to="/plant-health"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/plant-health') ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-green-600" />
              {t('nav.plant_health')}
            </Link>

            <Link
              to="/crop-calendar"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/crop-calendar') ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4 text-green-600" />
              {t('nav.crop_calendar')}
            </Link>

            <Link
              to="/weather"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive('/weather') ? 'bg-green-50 text-green-700 font-bold' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CloudSun className="w-4 h-4 text-green-600" />
              {t('nav.weather')}
            </Link>

            {/* Mobile Auth Links */}
            <div className="pt-4 border-t border-slate-200 mt-2">
              {user ? (
                <div className="space-y-1">
                  <Link
                    to={user.role === 'seller' ? '/seller' : '/buyer'}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-green-700 hover:bg-green-50"
                  >
                    <UserIcon className="w-4 h-4" />
                    {user.full_name || user.email} ({user.role})
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    {language === 'rw' ? 'Sohoka' : 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/buyer/login"
                    className="text-center py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
                  >
                    {t('nav.buyer_login')}
                  </Link>
                  <Link
                    to="/seller/login"
                    className="text-center py-2.5 px-3 rounded-xl bg-green-600 text-white text-xs font-bold hover:bg-green-700 shadow-xs"
                  >
                    {t('nav.seller_login')}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
