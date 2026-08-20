import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BuyerNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/buyer/notifications');
        if (res.success) {
          setNotifications(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const res = await api.patch<{ success: boolean }>(`/buyer/notifications/${id}/read`, {});
      if (res.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await api.delete<{ success: boolean }>(`/buyer/notifications/${id}`);
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete notification', error);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-32 bg-slate-200 rounded w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
         <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
         {notifications.length > 0 && (
           <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
             {notifications.filter(n => !n.is_read).length} unread
           </span>
         )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
          <p className="mt-1 text-sm text-slate-500">You have no new notifications.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <li key={notification.id} className={`p-5 hover:bg-slate-50 transition-colors ${!notification.is_read ? 'bg-green-50/30' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className={`text-base ${!notification.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{notification.content}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                    {notification.link && (
                      <Link to={notification.link} className="inline-block mt-3 text-sm text-green-600 hover:text-green-700 font-medium">
                        View Details &rarr;
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.is_read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors"
                        title="Mark as read"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(notification.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
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
