import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Bell } from 'lucide-react';

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/buyer/notifications'); // Using shared endpoint for now
        if (res.success) setNotifications(res.data);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  if (isLoading) return <div className="animate-pulse">Loading notifications...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
      
      {notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Bell className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No notifications</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <li key={notification.id} className="p-4">
                <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                <p className="text-sm text-slate-600">{notification.content}</p>
                <div className="mt-2 text-xs text-slate-400">{new Date(notification.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
