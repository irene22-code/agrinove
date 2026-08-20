import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Package } from 'lucide-react';

export function SellerOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get<{ success: boolean; data: any }>(`/orders/${id}`);
        if (res.success) setOrder(res.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await api.patch<{ success: boolean; data: any }>(`/orders/${id}/status`, { order_status: newStatus });
      if (res.success) {
        setOrder({ ...order, order_status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) return <div className="animate-pulse">Loading order...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Link to="/seller/orders" className="text-slate-400 hover:text-green-600">
             <ArrowLeft className="h-6 w-6" />
           </Link>
           <h1 className="text-2xl font-bold text-slate-900">Order #{order.id.slice(0, 8)}</h1>
        </div>
        <div className="flex items-center gap-2">
           <span className="text-sm font-medium text-slate-700">Status:</span>
           <select 
             value={order.order_status} 
             onChange={(e) => handleStatusChange(e.target.value)}
             disabled={isUpdating || order.order_status === 'cancelled'}
             className="text-sm border-slate-300 rounded-md focus:ring-green-500 focus:border-green-500 disabled:opacity-50"
           >
             <option value="pending">Pending</option>
             <option value="confirmed">Confirmed</option>
             <option value="processing">Processing</option>
             <option value="shipped">Shipped</option>
             <option value="delivered">Delivered</option>
             <option value="cancelled">Cancelled</option>
           </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Buyer Information</h3>
            <p className="text-sm text-slate-900 font-medium">{order.customer_name || order.buyers?.users?.full_name}</p>
            <p className="text-sm text-slate-600">{order.customer_phone}</p>
            <p className="text-sm text-slate-600">{order.customer_email || order.buyers?.users?.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Delivery Address</h3>
            <p className="text-sm text-slate-900">{order.street_address}, {order.sector}</p>
            <p className="text-sm text-slate-900">{order.district}, {order.city}</p>
            <p className="text-sm text-slate-900">{order.country}</p>
            {order.shipping_address && !order.street_address && (
              <p className="text-sm text-slate-900">{order.shipping_address}</p>
            )}
          </div>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Payment Details</h3>
            <p className="text-sm text-slate-900"><span className="font-semibold">Method:</span> {order.payment_method || 'N/A'}</p>
            <p className="text-sm text-slate-900"><span className="font-semibold">Status:</span> {order.payment_status}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-2">Order Notes</h3>
            <p className="text-sm text-slate-700 italic">{order.notes || 'No order notes.'}</p>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-medium text-slate-900 mb-4">Order Items</h3>
          <ul className="divide-y divide-slate-200">
            {order.order_items?.map((item: any) => {
               const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary)?.url || item.products?.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150';
               return (
                 <li key={item.id} className="py-4 flex flex-col sm:flex-row justify-between gap-4">
                   <div className="flex items-start gap-4">
                     <div className="h-16 w-16 bg-slate-100 rounded-md border border-slate-200 overflow-hidden flex-shrink-0">
                       <img src={primaryImage} alt={item.products?.title} className="h-full w-full object-cover" />
                     </div>
                     <div>
                       <p className="text-sm font-bold text-slate-900">{item.products?.title}</p>
                       <p className="text-sm text-slate-500 mt-1">ID: {String(item.product_id).substring(0,8)}</p>
                       {item.products?.categories?.name && <p className="text-xs text-slate-500 mt-1">Category: {item.products?.categories?.name}</p>}
                       <p className="text-sm text-slate-700 mt-1">Qty: {item.quantity}</p>
                     </div>
                   </div>
                   <div className="text-left sm:text-right">
                     <p className="text-sm text-slate-500">${item.unit_price} each</p>
                     <p className="text-base font-bold text-slate-900 mt-1">${item.subtotal}</p>
                   </div>
                 </li>
               );
            })}
          </ul>
        </div>
        <div className="bg-slate-50 p-6 flex justify-end">
          <div className="text-right">
            <p className="text-sm text-slate-500 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-slate-900">${order.total_amount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
