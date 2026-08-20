import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Box, ShoppingCart, MessageSquare, BarChart, Star, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SellerLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/seller', icon: LayoutDashboard },
    { name: 'Products', href: '/seller/products', icon: Package },
    { name: 'Add Product', href: '/seller/products/new', icon: PlusCircle },
    { name: 'Inventory', href: '/seller/inventory', icon: Box },
    { name: 'Orders', href: '/seller/orders', icon: ShoppingCart },
    { name: 'Messages', href: '/seller/messages', icon: MessageSquare },
    { name: 'Analytics', href: '/seller/analytics', icon: BarChart },
    { name: 'Reviews', href: '/seller/reviews', icon: Star },
    { name: 'Settings', href: '/seller/settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <div className="pb-4 mb-4 border-b border-slate-200">
              <p className="font-semibold text-slate-900">{user?.full_name}</p>
              <p className="text-sm text-slate-500">Seller Account</p>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/seller');
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
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
