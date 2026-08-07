import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/routes/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { About } from './pages/public/About';
import { Contact } from './pages/public/Contact';
import { ProductListing } from './pages/public/ProductListing';
import { ProductDetails } from './pages/public/ProductDetails';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Unauthorized } from './pages/auth/Unauthorized';

import { SellerRegister } from './pages/auth/SellerRegister';
import { SellerLogin } from './pages/auth/SellerLogin';


// Dashboard Pages
import { BuyerLayout } from './components/layout/BuyerLayout';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BuyerOrders } from './pages/buyer/BuyerOrders';
import { BuyerSaved } from './pages/buyer/BuyerSaved';
import { BuyerRecent } from './pages/buyer/BuyerRecent';
import { BuyerMessages } from './pages/buyer/BuyerMessages';
import { BuyerMessageDetails } from "./pages/buyer/BuyerMessageDetails";
import { BuyerNotifications } from './pages/buyer/BuyerNotifications';
import { BuyerSettings } from './pages/buyer/BuyerSettings';
import { Checkout } from './pages/buyer/Checkout';

import { BuyerOrderDetails } from './pages/buyer/BuyerOrderDetails';
import { SellerLayout } from './components/layout/SellerLayout';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { SellerProducts } from './pages/seller/SellerProducts';
import { AddProduct } from './pages/seller/AddProduct';
import { EditProduct } from './pages/seller/EditProduct';
import { SellerInventory } from './pages/seller/SellerInventory';
import { SellerOrders } from './pages/seller/SellerOrders';
import { SellerOrderDetails } from './pages/seller/SellerOrderDetails';
import { SellerMessages } from './pages/seller/SellerMessages';
import { SellerMessageDetails } from "./pages/seller/SellerMessageDetails";
import { SellerAnalytics } from './pages/seller/SellerAnalytics';
import { SellerReviews } from './pages/seller/SellerReviews';
import { SellerSettings } from './pages/seller/SellerSettings';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminLogs } from './pages/admin/AdminLogs';
import { AdminBuyers } from './pages/admin/AdminBuyers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminNotifications } from './pages/admin/AdminNotifications';

import { AdminLogin } from './pages/admin/AdminLogin';

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Admin Auth Route - Outside main layout */}
      <Route path="/admin/login" element={user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLogin />} />
      
      {/* Protected Admin Routes - Outside main layout */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/sellers" element={<AdminSellers />} />
          <Route path="/admin/buyers" element={<AdminBuyers />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />

          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
        </Route>
      </Route>

      {/* Main Website Layout */}
      <Route element={<Layout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<ProductListing />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        
        {/* Auth Routes */}
        <Route path="/buyer/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/buyer/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/seller/login" element={user ? <Navigate to="/" replace /> : <SellerLogin />} />
        <Route path="/seller/register" element={user ? <Navigate to="/" replace /> : <SellerRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
          <Route element={<BuyerLayout />}>
            <Route path="/buyer" element={<BuyerDashboard />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
            <Route path="/buyer/checkout/:id" element={<Checkout />} />

            <Route path="/buyer/orders/:id" element={<BuyerOrderDetails />} />
            <Route path="/buyer/saved" element={<BuyerSaved />} />
            <Route path="/buyer/recent" element={<BuyerRecent />} />
            <Route path="/buyer/messages" element={<BuyerMessages />} />
            <Route path="/buyer/inquiries/:id" element={<BuyerMessageDetails />} />
            <Route path="/buyer/notifications" element={<BuyerNotifications />} />
            <Route path="/buyer/settings" element={<BuyerSettings />} />
          </Route>
        </Route>
        
        <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/seller/products" element={<SellerProducts />} />
            <Route path="/seller/products/new" element={<AddProduct />} />
            <Route path="/seller/products/:id/edit" element={<EditProduct />} />
            <Route path="/seller/inventory" element={<SellerInventory />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
          <Route path="/seller/orders/:id" element={<SellerOrderDetails />} />
            <Route path="/seller/messages" element={<SellerMessages />} />
            <Route path="/seller/messages/:id" element={<SellerMessageDetails />} />
            <Route path="/seller/analytics" element={<SellerAnalytics />} />
            <Route path="/seller/reviews" element={<SellerReviews />} />
            <Route path="/seller/settings" element={<SellerSettings />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
