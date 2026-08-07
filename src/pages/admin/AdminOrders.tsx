import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { ShoppingCart, Search, Filter, Eye, X } from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.patch<{success: boolean}>(`/admin/orders/${id}/status`, { status: newStatus });
      if (res.success) {
        setOrders(orders.map(o => o.id === id ? { ...o, order_status: newStatus } : o));
        if (selectedOrder?.id === id) {
          setSelectedOrder({ ...selectedOrder, order_status: newStatus });
        }
      }
    } catch (error) {
      alert('Failed to update order status');
    }
  };
  
  const handleCancelOrder = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    handleUpdateOrderStatus(id, 'cancelled');
  };

  const fetchOrders = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/orders');
      if (res.success) {
        setOrders(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.buyers?.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sellers?.business_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  if (isLoading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;

  if (selectedOrder) {
      return (
          <div className="space-y-6">
              <div className="flex items-center justify-between">
                 <button onClick={() => setSelectedOrder(null)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">← Back to Orders</button>
                 <h1 className="text-2xl font-bold text-slate-900">Order Details</h1>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
                      <div>
                          <p className="text-sm text-slate-500 font-medium">Order ID</p>
                          <p className="text-lg font-bold text-slate-900 font-mono">{selectedOrder.id}</p>
                          <p className="text-sm text-slate-500 mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                          <p className="text-sm text-slate-500 font-medium mb-1">Status</p>
                          <div className="flex flex-col gap-2 items-end">
                              
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${selectedOrder.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                  Payment: {selectedOrder.payment_status}
                              </span>
                              <div className="flex items-center gap-2 mt-2">
                                  <span className="text-sm font-medium text-slate-700">Order Status:</span>
                                  <select 
                                    value={selectedOrder.order_status}
                                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                                    className="border border-slate-300 rounded-md py-1 px-2 text-sm font-medium focus:ring-emerald-500 focus:border-emerald-500"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="refunded">Refunded</option>
                                  </select>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                      <div>
                          <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Buyer Information</h3>
                          <div className="text-sm text-slate-600 space-y-1">
                              <p className="font-medium text-slate-900">{selectedOrder.buyers?.users?.full_name}</p>
                              <p>{selectedOrder.customer_email || selectedOrder.buyers?.users?.email}</p>
                              <p>{selectedOrder.customer_phone || 'No phone' || 'No phone'}</p>
                          </div>
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Delivery Address</h3>
                          <div className="text-sm text-slate-600 space-y-1">
                              <p>{selectedOrder.street_address}</p>
                              <p>{selectedOrder.sector}, {selectedOrder.district}</p>
                              <p>{selectedOrder.city}, {selectedOrder.country}</p>
                          </div>
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Seller Information</h3>
                          <div className="text-sm text-slate-600 space-y-1">
                              <p className="font-medium text-slate-900">{selectedOrder.sellers?.business_name}</p>
                              <p>{selectedOrder.sellers?.users?.full_name} ({selectedOrder.sellers?.users?.email})</p>
                              <p>Phone: {selectedOrder.sellers?.phone_number || 'N/A'}</p>
                              <p>WhatsApp: {selectedOrder.sellers?.whatsapp_number || 'N/A'}</p>
                              <p>{selectedOrder.sellers?.address || selectedOrder.sellers?.location}</p>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h3 className="font-bold text-slate-900 mb-3 uppercase tracking-wider text-xs">Order Items</h3>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                  <tr>
                                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Qty</th>
                                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price</th>
                                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Total</th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-slate-200">
                                  {selectedOrder.order_items?.map((item: any) => {
                                      const primaryImage = item.products?.product_images?.find((img: any) => img.is_primary) || item.products?.product_images?.[0];
                                      return (
                                      <tr key={item.id}>
                                          <td className="px-4 py-3">
                                              <div className="flex items-center">
                                                  <div className="h-10 w-10 flex-shrink-0 bg-slate-100 rounded overflow-hidden">
                                                      {primaryImage ? (
                                                          <img src={primaryImage.url} alt="" className="h-full w-full object-cover" />
                                                      ) : (
                                                          <div className="h-full w-full bg-slate-200"></div>
                                                      )}
                                                  </div>
                                                  <div className="ml-3">
                                                      <p className="text-sm font-medium text-slate-900">{item.products?.title}</p>
                                                      <p className="text-xs text-slate-500">Brand: {item.products?.brand || 'N/A'} | SKU: {item.products?.sku || 'N/A'}</p>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-4 py-3 text-center text-sm text-slate-900">{item.quantity}</td>
                                          <td className="px-4 py-3 text-right text-sm text-slate-900">${item.unit_price}</td>
                                          <td className="px-4 py-3 text-right text-sm font-medium text-slate-900">${item.subtotal}</td>
                                      </tr>
                                  )})}
                              </tbody>
                          </table>
                      </div>
                      
                      <div className="mt-6 flex justify-end">
                          <div className="w-full max-w-sm space-y-3 text-sm">
                              <div className="flex justify-between text-slate-600">
                                  <span>Payment Method:</span>
                                  <span className="font-medium text-slate-900 uppercase">{selectedOrder.payment_method}</span>
                              </div>
                              {selectedOrder.tracking_number && (
                                  <div className="flex justify-between text-slate-600">
                                      <span>Tracking Number:</span>
                                      <span className="font-medium text-slate-900">{selectedOrder.tracking_number}</span>
                                  </div>
                              )}
                              <div className="pt-3 border-t border-slate-200 flex justify-between font-bold text-lg">
                                  <span>Total Amount:</span>
                                  <span className="text-emerald-600">${selectedOrder.total_amount}</span>
                              </div>
                          </div>
                      </div>
                      
                      {selectedOrder.order_notes && (
                          <div className="mt-8 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-100">
                              <p className="font-semibold mb-1">Order Notes:</p>
                              <p>{selectedOrder.order_notes}</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Manage Orders</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, Buyer, or Seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex gap-4">
            <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white min-w-[150px]"
            >
                <option value="all">All Order Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
            </select>
            </div>
            <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white min-w-[150px]"
            >
                <option value="all">All Payment Statuses</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
            </select>
            </div>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No orders found</h3>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID & Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Buyer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Seller</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-slate-900">{order.id.slice(0, 8)}...</div>
                      <div className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.buyers?.users?.full_name || 'N/A'}</div>
                      <div className="text-xs text-slate-500">{order.buyers?.users?.phone_number || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">{order.sellers?.business_name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-slate-900">${order.total_amount}</div>
                      <div className="text-xs text-slate-500 uppercase">{order.payment_method}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                          <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full capitalize ${
                            order.order_status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                            order.order_status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : 
                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            O: {order.order_status}
                          </span>
                          <span className={`px-2 py-0.5 inline-flex text-[10px] leading-4 font-semibold rounded-full capitalize ${
                            order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                            order.payment_status === 'failed' ? 'bg-red-100 text-red-800' : 
                            'bg-slate-100 text-slate-800'
                          }`}>
                            P: {order.payment_status}
                          </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button onClick={() => setSelectedOrder(order)} className="text-emerald-600 hover:text-emerald-900 transition-colors flex items-center justify-end gap-1 ml-auto">
                           <Eye className="h-4 w-4" /> View
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
