import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { CalendarDays, Leaf, LayoutDashboard, FileText, Users, UserCheck, PackageCheck, Tags, ShoppingCart, MessageSquare, BarChart, Settings, ShieldAlert, LogOut, Sprout, Star, Bell, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Users', href: '/admin/users', icon: Users },
    
    { name: 'Sellers', href: '/admin/sellers', icon: UserCheck },
    { name: 'Buyers', href: '/admin/buyers', icon: Users },

    { name: 'Products', href: '/admin/products', icon: PackageCheck },
    { name: 'Market Prices', href: '/admin/market-prices', icon: TrendingUp },
    { name: 'Plant Health', href: '/admin/plant-health', icon: Leaf },
    { name: 'Crop Calendar', href: '/admin/crop-calendar', icon: CalendarDays },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { name: 'Reviews', href: '/admin/reviews', icon: Star },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },

    { name: 'Reports', href: '/admin/reports', icon: BarChart },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Security Logs', href: '/admin/logs', icon: ShieldAlert },
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Admin Topbar */}
      <header className="bg-slate-900 border-b border-slate-800 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sprout className="h-8 w-8 text-green-400" />
            <span className="text-xl font-bold text-white tracking-tight">AgroMart Admin</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
               <p className="text-sm font-medium text-white">{user?.full_name}</p>
               <p className="text-xs text-slate-400">Administrator</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-500' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-slate-200 min-h-[500px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
