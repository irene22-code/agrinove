import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Package, Clock, Ban, CheckCircle, Truck } from 'lucide-react';

export function BuyerOrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get<{ success: boolean; data: any }>(`/orders/${id}`);
        if (res.success) {
          setOrder(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load order');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setIsCancelling(true);
    try {
      const res = await api.patch<{ success: boolean; data: any }>(`/orders/${id}/cancel`);
      if (res.success) {
        setOrder({ ...order, order_status: 'cancelled' });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-64 bg-slate-200 rounded w-full"></div>
    </div>;
  }

  if (error || !order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-rose-600 mb-2">Error</h3>
        <p className="text-slate-500">{error || 'Order not found'}</p>
        <Link to="/buyer/orders" className="mt-4 inline-flex items-center text-emerald-600 hover:text-emerald-700">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/buyer/orders" className="text-slate-500 hover:text-emerald-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
        </div>
        {order.order_status === 'pending' && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="px-4 py-2 border border-rose-300 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors font-medium text-sm flex items-center disabled:opacity-50"
          >
            <Ban className="mr-2 h-4 w-4" />
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header info */}
        <div className="border-b border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Order Number</p>
              <p className="text-lg font-bold text-slate-900">#{String(order.id).substring(0, 8)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Date Placed</p>
              <p className="text-lg font-bold text-slate-900">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Total Amount</p>
              <p className="text-lg font-bold text-slate-900">${order.total_amount}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                ${order.order_status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                  order.order_status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  order.order_status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                  order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                {order.order_status}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline / Tracking (Simple representation) */}
        <div className="p-6 border-b border-slate-200">
           <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">Tracking</h3>
           <div className="relative">
             <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0 hidden sm:block"></div>
             <div className="relative z-10 flex flex-col sm:flex-row justify-between gap-6 sm:gap-0">
               
               <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${order.order_status !== 'cancelled' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                   <Package className="h-4 w-4" />
                 </div>
                 <div className="sm:text-center">
                   <p className="text-sm font-medium text-slate-900">Placed</p>
                 </div>
               </div>

               <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${['processing', 'shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                   <Clock className="h-4 w-4" />
                 </div>
                 <div className="sm:text-center">
                   <p className="text-sm font-medium text-slate-900">Processing</p>
                 </div>
               </div>

               <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${['shipped', 'delivered'].includes(order.order_status) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                   <Truck className="h-4 w-4" />
                 </div>
                 <div className="sm:text-center">
                   <p className="text-sm font-medium text-slate-900">Shipped</p>
                 </div>
               </div>

               <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
                 <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${order.order_status === 'delivered' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-400'}`}>
                   <CheckCircle className="h-4 w-4" />
                 </div>
                 <div className="sm:text-center">
                   <p className="text-sm font-medium text-slate-900">Delivered</p>
                 </div>
               </div>

             </div>
           </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Items in Order</h3>
          <div className="space-y-4">
            {order.order_items?.map((item: any) => {
               const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary)?.url || item.products?.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
               return (
                 <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 gap-4">
                   <div className="flex items-start gap-4">
                     <div className="h-20 w-20 bg-white rounded border border-slate-200 overflow-hidden flex-shrink-0">
                       <img src={primaryImage} alt={item.products?.title} className="h-full w-full object-cover" />
                     </div>
                     <div>
                       <Link to={`/products/${item.product_id}`} className="font-bold text-slate-900 hover:text-emerald-600 line-clamp-1 text-lg">
                         {item.products?.title}
                       </Link>
                       <p className="text-sm text-slate-600 line-clamp-2 mt-1">{item.products?.description}</p>
                       <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                         {item.products?.categories?.name && <span className="bg-slate-200 px-2 py-0.5 rounded-full">{item.products?.categories?.name}</span>}
                         {item.products?.brand && <span>Brand: <span className="font-medium text-slate-700">{item.products?.brand}</span></span>}
                         <span>ID: <span className="font-mono">{String(item.product_id).substring(0,8)}</span></span>
                       </div>
                       {item.products?.sellers && (
                          <div className="mt-1 text-xs text-slate-500">
                            Seller: <span className="font-medium text-emerald-700">{item.products.sellers.business_name}</span>
                          </div>
                       )}
                     </div>
                   </div>
                   <div className="text-left sm:text-right w-full sm:w-auto flex flex-row sm:flex-col justify-between items-center sm:items-end">
                     <div>
                       <p className="text-sm text-slate-500">${item.unit_price} each × {item.quantity}</p>
                       <p className="font-bold text-slate-900 text-lg mt-1">${item.subtotal}</p>
                     </div>
                   </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Details footer */}
        <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Delivery Address</h3>
            <p className="text-slate-600 text-sm leading-relaxed font-medium">{order.customer_name}</p>
            <p className="text-slate-600 text-sm leading-relaxed">{order.street_address}, {order.sector}</p>
            <p className="text-slate-600 text-sm leading-relaxed">{order.district}, {order.city}</p>
            <p className="text-slate-600 text-sm leading-relaxed">{order.country}</p>
            {order.shipping_address && !order.street_address && (
              <p className="text-slate-600 text-sm leading-relaxed">{order.shipping_address}</p>
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Payment Details</h3>
            <p className="text-sm text-slate-600 mb-1"><span className="font-semibold text-slate-700">Method:</span> {order.payment_method || 'N/A'}</p>
            <p className="text-sm text-slate-600 mb-4"><span className="font-semibold text-slate-700">Status:</span> {order.payment_status}</p>
            
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Seller Details</h3>
            <p className="text-slate-600 font-medium text-sm">{order.sellers?.business_name}</p>
            {order.sellers?.users?.email && <p className="text-sm text-slate-500">{order.sellers.users.email}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
