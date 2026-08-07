import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { MessageSquare, ExternalLink } from 'lucide-react';

export function SellerMessages() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchInquiries() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/inquiries');
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
    return <div className="animate-pulse">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Messages & Inquiries</h1>
      
      {inquiries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No messages yet</h3>
          <p className="mt-1 text-sm text-slate-500">Inquiries from buyers will appear here.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {inquiries.map((inquiry) => (
              <li key={inquiry.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Buyer: {inquiry.users?.full_name}</p>
                    <p className="text-sm text-slate-500 mt-1">Product: {inquiry.products?.title}</p>
                    <p className="text-xs text-slate-400 mt-1">Created on {new Date(inquiry.created_at).toLocaleDateString()}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        inquiry.status === 'open' ? 'bg-yellow-100 text-yellow-800' :
                        inquiry.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Link to={`/seller/messages/${inquiry.id}`} className="text-emerald-600 hover:text-emerald-700 p-2 inline-flex items-center text-sm font-medium">
                      Respond
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
