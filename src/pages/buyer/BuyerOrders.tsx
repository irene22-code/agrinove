import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { Package, ExternalLink } from 'lucide-react';

export function BuyerOrders() {
  
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get<{success: boolean; data: any[]}>('/orders');
        if (res.success) setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchOrders();
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/orders/buyer');
        if (res.success) {
          setOrders(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Package className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No orders yet</h3>
          <p className="mt-1 text-sm text-slate-500">When you place orders, they will appear here.</p>
          <div className="mt-6">
            <Link to="/products" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              Start Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {orders.map((order) => (
              <li key={order.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-slate-500">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.order_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.order_status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {order.order_status}
                      </span>
                      <span className="text-sm font-medium text-slate-900">${order.total_amount}</span>
                    </div>
                  </div>
                  <div>
                    <Link to={`/buyer/orders/${order.id}`} className="text-emerald-600 hover:text-emerald-700 p-2 inline-flex items-center text-sm font-medium">
                      View Details
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
