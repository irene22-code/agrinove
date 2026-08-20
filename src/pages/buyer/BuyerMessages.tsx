import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink, Circle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function BuyerMessages() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/buyer/inquiries');
        if (res.success) {
          setInquiries(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch inquiries:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInquiries();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
      <div className="h-32 bg-slate-200 rounded w-full"></div>
    </div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
      </div>
      
      {inquiries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No messages</h3>
          <p className="mt-1 text-sm text-slate-500">Your message inquiries will appear here.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-xl border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {inquiries.map((inquiry) => {
              const unreadCount = inquiry.messages?.filter((m: any) => m.sender_id !== user?.id && !m.read_at).length || 0;
              
              return (
                <li key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                  <Link to={`/buyer/inquiries/${inquiry.id}`} className="p-5 flex items-start justify-between group">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 relative">
                        <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <MessageSquare className="h-5 w-5" />
                        </div>
                        {unreadCount > 0 && (
                          <div className="absolute -top-1 -right-1 h-5 w-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                            {unreadCount}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className={`text-base ${unreadCount > 0 ? 'font-bold text-slate-900' : 'font-medium text-slate-800'}`}>
                            Inquiry: {inquiry.products?.title || 'General'}
                          </p>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            inquiry.status === 'open' ? 'bg-amber-100 text-amber-800' :
                            inquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {inquiry.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500">Created on {new Date(inquiry.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end justify-center h-full pt-1">
                      <span className="text-green-600 group-hover:text-green-700 p-2 inline-flex items-center text-sm font-medium">
                        View <ExternalLink className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
