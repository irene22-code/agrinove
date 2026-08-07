import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Clock, MessageSquare, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function BuyerLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/buyer', icon: LayoutDashboard },
    { name: 'My Orders', href: '/buyer/orders', icon: ShoppingBag },
    { name: 'Saved Products', href: '/buyer/saved', icon: Heart },
    { name: 'Recently Viewed', href: '/buyer/recent', icon: Clock },
    { name: 'Messages', href: '/buyer/messages', icon: MessageSquare },
    { name: 'Notifications', href: '/buyer/notifications', icon: Bell },
    { name: 'Settings', href: '/buyer/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="pb-4 mb-4 border-b border-slate-200">
              <p className="font-semibold text-slate-900">{user?.full_name}</p>
              <p className="text-sm text-slate-500">Buyer Account</p>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/buyer');
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
