import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Save, AlertCircle, CheckCircle2, Globe, Settings, ShoppingBag, CreditCard, Truck, Bell, FileText } from 'lucide-react';

const DEFAULT_SETTINGS = {
  platform: {
    websiteName: 'AgroMart',
    websiteDescription: 'The premier agricultural marketplace',
    supportEmail: 'support@agromart.com',
    supportPhone: '+1234567890',
    whatsappNumber: '+1234567890',
    currency: 'USD',
    country: 'US',
    timezone: 'UTC',
    maintenanceMode: false
  },
  marketplace: {
    allowBuyerRegistration: true,
    allowSellerRegistration: true,
    requireSellerVerification: true,
    allowProductReviews: true,
    allowBuyerInquiries: true,
    allowSellerMessaging: true,
    allowProductListings: true,
    defaultProductStatus: 'active',
    maxProductImages: 5,
    minStockThreshold: 10
  },
  orders: {
    enableOrders: true,
    allowBuyerCancellation: true,
    cancellationWindowHours: 24,
    allowSellerStatusUpdates: true,
    defaultOrderStatus: 'pending',
    defaultPaymentStatus: 'pending'
  },
  payments: {
    cashOnDelivery: true,
    mobileMoney: true,
    bankTransfer: true
  },
  delivery: {
    deliveryEnabled: true,
    defaultDeliveryFee: 10,
    freeDeliveryThreshold: 100,
    estimatedDeliveryDays: 3,
    deliveryCountries: 'US, UK, CA'
  },
  notifications: {
    newOrder: true,
    newSeller: true,
    newProduct: true,
    newInquiry: true,
    orderStatus: true
  },
  content: {
    aboutUs: 'We connect farmers directly with buyers.',
    contactEmail: 'contact@agromart.com',
    contactPhone: '+1234567890',
    whatsappNumber: '+1234567890',
    businessAddress: '123 Farm Road, Agrotown',
    supportMessage: 'How can we help you today?'
  }
};

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState('platform');
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/settings');
      if (res.success && res.data) {
        const merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        res.data.forEach((row: any) => {
           if (merged[row.key]) {
               merged[row.key] = { ...merged[row.key], ...row.value };
           } else {
               merged[row.key] = row.value;
           }
        });
        setSettings(merged);
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (sectionKey: string) => {
    setIsSaving(true);
    setMessage(null);
    try {
      // Basic validation for delivery section
      if (sectionKey === 'delivery') {
          const s = settings.delivery;
          if (Number(s.defaultDeliveryFee) < 0 || Number(s.freeDeliveryThreshold) < 0 || Number(s.estimatedDeliveryDays) < 0) {
              throw new Error("Delivery values cannot be negative");
          }
      }
      
      const res = await api.post<{ success: boolean; error?: string }>('/admin/settings', {
        key: sectionKey,
        value: settings[sectionKey]
      });
      if (res.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: res.error || 'Failed to save settings' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error saving settings' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChange = (section: string, field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  if (isLoading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;

  const tabs = [
    { id: 'platform', name: 'Platform', icon: Globe },
    { id: 'marketplace', name: 'Marketplace', icon: Settings },
    { id: 'orders', name: 'Orders', icon: ShoppingBag },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'delivery', name: 'Delivery', icon: Truck },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'content', name: 'Content / Contact', icon: FileText }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6">
            
            {message && (
              <div className={`mb-6 p-4 rounded-md flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />}
                <p className="text-sm font-medium">{message.text}</p>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Platform Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website Name</label>
                    <input type="text" value={settings.platform.websiteName} onChange={(e) => handleChange('platform', 'websiteName', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Website Description</label>
                    <input type="text" value={settings.platform.websiteDescription} onChange={(e) => handleChange('platform', 'websiteDescription', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Support Email</label>
                    <input type="email" value={settings.platform.supportEmail} onChange={(e) => handleChange('platform', 'supportEmail', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone</label>
                    <input type="text" value={settings.platform.supportPhone} onChange={(e) => handleChange('platform', 'supportPhone', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Support Number</label>
                    <input type="text" value={settings.platform.whatsappNumber} onChange={(e) => handleChange('platform', 'whatsappNumber', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Default Currency</label>
                    <select value={settings.platform.currency} onChange={(e) => handleChange('platform', 'currency', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="NGN">NGN (₦)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
                    <input type="text" value={settings.platform.country} onChange={(e) => handleChange('platform', 'country', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
                    <input type="text" value={settings.platform.timezone} onChange={(e) => handleChange('platform', 'timezone', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                  </div>
                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={settings.platform.maintenanceMode} onChange={(e) => handleChange('platform', 'maintenanceMode', e.target.checked)} className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-900">Maintenance Mode</span>
                        <span className="block text-xs text-slate-500">Temporarily disable the marketplace for buyers and sellers. Admins can still log in.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'marketplace' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Marketplace Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'allowBuyerRegistration', label: 'Allow Buyer Registration', desc: 'New buyers can sign up.' },
                    { key: 'allowSellerRegistration', label: 'Allow Seller Registration', desc: 'New sellers can sign up.' },
                    { key: 'requireSellerVerification', label: 'Require Seller Verification', desc: 'Sellers must be verified by admin before listing products.' },
                    { key: 'allowProductReviews', label: 'Allow Product Reviews', desc: 'Buyers can leave reviews on purchased products.' },
                    { key: 'allowBuyerInquiries', label: 'Allow Buyer Inquiries', desc: 'Buyers can send inquiries to sellers.' },
                    { key: 'allowSellerMessaging', label: 'Allow Seller Messaging', desc: 'Sellers can reply to inquiries.' },
                    { key: 'allowProductListings', label: 'Allow Product Listings', desc: 'Sellers can create new product listings.' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-md transition-colors">
                      <input type="checkbox" checked={settings.marketplace[item.key]} onChange={(e) => handleChange('marketplace', item.key, e.target.checked)} className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                        <span className="block text-xs text-slate-500">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Default Product Status</label>
                      <select value={settings.marketplace.defaultProductStatus} onChange={(e) => handleChange('marketplace', 'defaultProductStatus', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Max Product Images</label>
                      <input type="number" min="1" max="10" value={settings.marketplace.maxProductImages} onChange={(e) => handleChange('marketplace', 'maxProductImages', parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Stock Threshold</label>
                      <input type="number" min="0" value={settings.marketplace.minStockThreshold} onChange={(e) => handleChange('marketplace', 'minStockThreshold', parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                      <p className="text-xs text-slate-500 mt-1">Products below this are considered low stock.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Order Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'enableOrders', label: 'Enable Orders', desc: 'Buyers can place new orders.' },
                    { key: 'allowBuyerCancellation', label: 'Allow Buyer Cancellation', desc: 'Buyers can cancel orders within the window.' },
                    { key: 'allowSellerStatusUpdates', label: 'Allow Seller Status Updates', desc: 'Sellers can mark orders as shipped/delivered.' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-md transition-colors">
                      <input type="checkbox" checked={settings.orders[item.key]} onChange={(e) => handleChange('orders', item.key, e.target.checked)} className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                        <span className="block text-xs text-slate-500">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation Window (Hours)</label>
                      <input type="number" min="0" value={settings.orders.cancellationWindowHours} onChange={(e) => handleChange('orders', 'cancellationWindowHours', parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Default Order Status</label>
                      <select value={settings.orders.defaultOrderStatus} onChange={(e) => handleChange('orders', 'defaultOrderStatus', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500 bg-white">
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Payment Settings</h2>
                <div className="space-y-4">
                  {[
                    { key: 'cashOnDelivery', label: 'Cash on Delivery', desc: 'Allow buyers to pay upon receiving the items.' },
                    { key: 'mobileMoney', label: 'Mobile Money', desc: 'Enable mobile money payments (e.g. M-Pesa, MTN).' },
                    { key: 'bankTransfer', label: 'Bank Transfer', desc: 'Allow direct bank transfers.' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer p-4 border border-slate-200 rounded-lg shadow-sm hover:border-emerald-300 transition-colors">
                      <input type="checkbox" checked={settings.payments[item.key]} onChange={(e) => handleChange('payments', item.key, e.target.checked)} className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                        <span className="block text-xs text-slate-500">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      Payment provider API keys and secrets are securely managed on the server via environment variables. This prevents sensitive credentials from being exposed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Delivery & Shipping</h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-md transition-colors">
                    <input type="checkbox" checked={settings.delivery.deliveryEnabled} onChange={(e) => handleChange('delivery', 'deliveryEnabled', e.target.checked)} className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                    <div>
                      <span className="block text-sm font-medium text-slate-900">Enable Delivery</span>
                      <span className="block text-xs text-slate-500">Provide shipping options during checkout.</span>
                    </div>
                  </label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Default Delivery Fee</label>
                      <input type="number" min="0" step="0.01" value={settings.delivery.defaultDeliveryFee} onChange={(e) => handleChange('delivery', 'defaultDeliveryFee', parseFloat(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Free Delivery Threshold</label>
                      <input type="number" min="0" step="0.01" value={settings.delivery.freeDeliveryThreshold} onChange={(e) => handleChange('delivery', 'freeDeliveryThreshold', parseFloat(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                      <p className="text-xs text-slate-500 mt-1">Orders above this amount get free delivery.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Delivery Days</label>
                      <input type="number" min="1" value={settings.delivery.estimatedDeliveryDays} onChange={(e) => handleChange('delivery', 'estimatedDeliveryDays', parseInt(e.target.value))} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Supported Countries</label>
                      <input type="text" value={settings.delivery.deliveryCountries} onChange={(e) => handleChange('delivery', 'deliveryCountries', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                      <p className="text-xs text-slate-500 mt-1">Comma separated list (e.g. US, UK, CA)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Platform Notifications</h2>
                <div className="space-y-4">
                  {[
                    { key: 'newOrder', label: 'New Order Alerts', desc: 'Receive notifications when a new order is placed.' },
                    { key: 'newSeller', label: 'New Seller Registrations', desc: 'Get alerted when a new seller registers.' },
                    { key: 'newProduct', label: 'New Product Listings', desc: 'Get alerted when a seller lists a new product.' },
                    { key: 'newInquiry', label: 'New Inquiries', desc: 'Notify sellers when they receive a buyer inquiry.' },
                    { key: 'orderStatus', label: 'Order Status Updates', desc: 'Notify buyers when their order status changes.' }
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-slate-50 rounded-md transition-colors">
                      <input type="checkbox" checked={settings.notifications[item.key]} onChange={(e) => handleChange('notifications', item.key, e.target.checked)} className="h-5 w-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                      <div>
                        <span className="block text-sm font-medium text-slate-900">{item.label}</span>
                        <span className="block text-xs text-slate-500">{item.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="space-y-6">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Content & Contact Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">About Us Text</label>
                    <textarea rows={4} value={settings.content.aboutUs} onChange={(e) => handleChange('content', 'aboutUs', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                      <input type="email" value={settings.content.contactEmail} onChange={(e) => handleChange('content', 'contactEmail', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                      <input type="text" value={settings.content.contactPhone} onChange={(e) => handleChange('content', 'contactPhone', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp Number</label>
                      <input type="text" value={settings.content.whatsappNumber} onChange={(e) => handleChange('content', 'whatsappNumber', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Support Message</label>
                      <input type="text" value={settings.content.supportMessage} onChange={(e) => handleChange('content', 'supportMessage', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                      <input type="text" value={settings.content.businessAddress} onChange={(e) => handleChange('content', 'businessAddress', e.target.value)} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => handleSave(activeTab)}
                disabled={isSaving}
                className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : `Save ${tabs.find(t => t.id === activeTab)?.name} Settings`}
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
