import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ShoppingBag, MapPin, CreditCard, User as UserIcon } from 'lucide-react';

export function Checkout() {
  const { id } = useParams<{ id: string }>(); // product id
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    country: 'Rwanda',
    city: '',
    district: '',
    sector: '',
    street_address: '',
    payment_method: 'Cash on Delivery',
    order_notes: ''
  });

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get<{ success: boolean; data: any }>(`/products/${id}`);
        if (res.success) {
          setProduct(res.data);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    }
    
    // Also fetch buyer profile to prefill if possible
    async function fetchProfile() {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/buyer/profile');
        if (res.success && res.data) {
          setFormData(prev => ({
            ...prev,
            customer_name: res.data.full_name || '',
            customer_phone: res.data.phone_number || '',
            customer_email: res.data.email || ''
          }));
        }
      } catch(e) {}
    }

    if (id) {
      fetchProduct();
      fetchProfile();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const hasDiscount = product.discount > 0;
      const currentPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

      const orderData = {
        total_amount: currentPrice,
        shipping_address: `${formData.street_address}, ${formData.sector}, ${formData.district}, ${formData.city}, ${formData.country}`,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        country: formData.country,
        city: formData.city,
        district: formData.district,
        sector: formData.sector,
        street_address: formData.street_address,
        payment_method: formData.payment_method,
        order_notes: formData.order_notes,
        items: [{
          product_id: product.id,
          quantity: 1,
          unit_price: currentPrice
        }]
      };

      const res = await api.post<{ success: boolean; data?: any; error?: string }>('/orders', orderData);
      
      if (res.success) {
        navigate('/buyer/orders');
      } else {
        setError(res.error || 'Failed to place order');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-rose-600 mb-2">Error</h2>
        <p className="text-slate-600">{error || 'Product not found'}</p>
        <button onClick={() => navigate('/products')} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
          Back to Products
        </button>
      </div>
    );
  }

  const hasDiscount = product.discount > 0;
  const currentPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;
  const primaryImage = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        <p className="text-slate-500 mt-2">Complete your order details below</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column - Form */}
        <div className="flex-1">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-emerald-600" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                  <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Phone Number</label>
                  <input type="tel" name="customer_phone" required value={formData.customer_phone} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                  <input type="email" name="customer_email" required value={formData.customer_email} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
              </div>
            </section>

            {/* Delivery Address */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-emerald-600" /> Delivery Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Country</label>
                  <input type="text" name="country" required value={formData.country} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">City/Province</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">District</label>
                  <input type="text" name="district" required value={formData.district} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Sector</label>
                  <input type="text" name="sector" required value={formData.sector} onChange={handleInputChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Street Address</label>
                  <input type="text" name="street_address" required value={formData.street_address} onChange={handleInputChange} placeholder="E.g. KN 5 Rd, House 12" className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                </div>
              </div>
            </section>

            {/* Payment Options */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-emerald-600" /> Payment Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Cash on Delivery', 'Mobile Money', 'Bank Transfer'].map(method => (
                  <label key={method} className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm transition-all ${formData.payment_method === method ? 'border-emerald-600 bg-emerald-50' : 'border-slate-300 hover:border-emerald-300'}`}>
                    <input type="radio" name="payment_method" value={method} checked={formData.payment_method === method} onChange={handleInputChange} className="sr-only" />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className={`block text-sm font-bold ${formData.payment_method === method ? 'text-emerald-900' : 'text-slate-900'}`}>{method}</span>
                      </span>
                    </span>
                    <span className={`h-5 w-5 rounded-full border flex items-center justify-center ${formData.payment_method === method ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                      {formData.payment_method === method && <span className="h-2.5 w-2.5 rounded-full bg-white"></span>}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            {/* Order Notes */}
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-emerald-600" /> Order Information
              </h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Order Notes (Optional)</label>
                <textarea name="order_notes" rows={3} value={formData.order_notes} onChange={handleInputChange} placeholder="Special instructions for delivery..." className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"></textarea>
              </div>
            </section>

            <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>

        {/* Right Column - Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-24 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                  {primaryImage ? (
                    <img src={primaryImage} alt={product.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-slate-200"></div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">{product.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Qty: 1</p>
                  <p className="text-sm font-bold text-emerald-700 mt-1">${currentPrice.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium">${currentPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>
                <div className="pt-4 border-t border-slate-200 flex justify-between">
                  <span className="text-lg font-bold text-slate-900">Total</span>
                  <span className="text-lg font-extrabold text-slate-900">${currentPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
