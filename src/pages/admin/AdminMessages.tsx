import { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/api';
import { MessageSquare, Search, Filter, Eye, X, Send, Clock, CheckCircle, MailOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminMessages() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [selectedInquiry, setSelectedInquiry] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/messages');
      if (res.success) {
        setInquiries(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch inquiries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInquiryDetails = async (id: string) => {
    try {
      const res = await api.get<{ success: boolean; data: any }>(`/admin/messages/${id}`);
      if (res.success) {
        setSelectedInquiry(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch inquiry details:', error);
    }
  };

  const handleOpenInquiry = (id: string) => {
    fetchInquiryDetails(id);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await api.patch<{success: boolean}>(`/admin/messages/${id}/status`, { status: newStatus });
      if (res.success) {
        // update local list
        setInquiries(inquiries.map(i => i.id === id ? { ...i, status: newStatus } : i));
        // update detail view if open
        if (selectedInquiry && selectedInquiry.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedInquiry) return;
    
    setIsSubmitting(true);
    try {
      const res = await api.post<{success: boolean, data: any}>(`/admin/messages/${selectedInquiry.id}/reply`, { content: replyContent });
      if (res.success) {
        setReplyContent('');
        fetchInquiryDetails(selectedInquiry.id);
        // Also update list to reflect new status 'responded'
        setInquiries(inquiries.map(i => i.id === selectedInquiry.id ? { ...i, status: 'responded' } : i));
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      alert('Failed to send reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedInquiry?.messages]);

  const filteredInquiries = inquiries.filter((inquiry) => {
    const searchString = searchTerm.toLowerCase();
    const matchesSearch = 
      inquiry.id?.toLowerCase().includes(searchString) || 
      inquiry.buyers?.full_name?.toLowerCase().includes(searchString) ||
      inquiry.buyers?.email?.toLowerCase().includes(searchString) ||
      inquiry.sellers?.business_name?.toLowerCase().includes(searchString) ||
      inquiry.sellers?.users?.full_name?.toLowerCase().includes(searchString) ||
      inquiry.products?.title?.toLowerCase().includes(searchString) ||
      inquiry.subject?.toLowerCase().includes(searchString);
      
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800',
      read: 'bg-blue-100 text-blue-800',
      responded: 'bg-emerald-100 text-emerald-800',
      closed: 'bg-slate-100 text-slate-800'
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (isLoading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;

  if (selectedInquiry) {
      return (
          <div className="flex flex-col h-[calc(100vh-8rem)]">
              <div className="flex items-center justify-between mb-4">
                 <button onClick={() => setSelectedInquiry(null)} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">← Back to Messages</button>
                 <div className="flex items-center gap-3">
                    {selectedInquiry.status === 'pending' && (
                        <button onClick={() => updateStatus(selectedInquiry.id, 'read')} className="flex items-center gap-1 text-sm bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"><MailOpen className="h-4 w-4" /> Mark Read</button>
                    )}
                    {selectedInquiry.status !== 'closed' && (
                        <button onClick={() => updateStatus(selectedInquiry.id, 'closed')} className="flex items-center gap-1 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 px-3 py-1.5 rounded-md transition-colors"><CheckCircle className="h-4 w-4" /> Close Inquiry</button>
                    )}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
                  {/* Left sidebar - details */}
                  <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-slate-200 overflow-y-auto p-5">
                      <div className="mb-6 pb-6 border-b border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                              <h2 className="text-lg font-bold text-slate-900">{selectedInquiry.subject}</h2>
                              {getStatusBadge(selectedInquiry.status)}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(selectedInquiry.created_at).toLocaleString()}</p>
                      </div>

                      <div className="space-y-6">
                          <div>
                              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Buyer Information</h3>
                              <div className="text-sm text-slate-600 space-y-1">
                                  <p className="font-medium text-slate-900">{selectedInquiry.buyers?.full_name || 'N/A'}</p>
                                  <p>{selectedInquiry.buyers?.email || 'N/A'}</p>
                                  <p>{selectedInquiry.buyers?.phone_number || 'No phone'}</p>
                              </div>
                          </div>
                          
                          <div>
                              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Seller Information</h3>
                              <div className="text-sm text-slate-600 space-y-1">
                                  <p className="font-medium text-slate-900">{selectedInquiry.sellers?.business_name || 'N/A'}</p>
                                  <p>{selectedInquiry.sellers?.users?.full_name} ({selectedInquiry.sellers?.users?.email})</p>
                                  <p>Phone: {selectedInquiry.sellers?.phone_number || 'N/A'}</p>
                                  <p>WhatsApp: {selectedInquiry.sellers?.whatsapp_number || 'N/A'}</p>
                              </div>
                          </div>
                          
                          {selectedInquiry.products && (
                          <div>
                              <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Product Information</h3>
                              <div className="flex items-center gap-3">
                                  <div className="h-12 w-12 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                                      {selectedInquiry.products.product_images?.[0]?.url && (
                                          <img src={selectedInquiry.products.product_images[0].url} alt="" className="h-full w-full object-cover" />
                                      )}
                                  </div>
                                  <div>
                                      <p className="font-medium text-sm text-slate-900">{selectedInquiry.products.title}</p>
                                      <p className="text-xs text-slate-500">${selectedInquiry.products.price} • SKU: {selectedInquiry.products.sku || 'N/A'}</p>
                                      <p className="text-xs text-slate-500">Category: {selectedInquiry.products.categories?.name || 'N/A'}</p>
                                  </div>
                              </div>
                          </div>
                          )}
                      </div>
                  </div>

                  {/* Right side - thread */}
                  <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col h-full min-h-0">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                          <h3 className="font-bold text-slate-900">Conversation Thread</h3>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          {selectedInquiry.messages?.length === 0 ? (
                              <div className="text-center text-slate-500 py-8">No messages in this thread yet.</div>
                          ) : (
                              selectedInquiry.messages?.map((msg: any) => {
                                  const isAdmin = msg.sender?.role === 'admin';
                                  const isBuyer = msg.sender_id === selectedInquiry.buyer_id;
                                  
                                  return (
                                  <div key={msg.id} className={`flex flex-col ${isAdmin ? 'items-center' : (isBuyer ? 'items-start' : 'items-end')}`}>
                                      {isAdmin ? (
                                          <div className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm max-w-[80%] my-2 text-center border border-slate-200">
                                              <span className="font-semibold block mb-1">Admin Note</span>
                                              {msg.content}
                                              <span className="block text-[10px] text-slate-500 mt-1">{new Date(msg.created_at).toLocaleString()}</span>
                                          </div>
                                      ) : (
                                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isBuyer ? 'bg-emerald-50 text-emerald-900 border border-emerald-100 rounded-tl-sm' : 'bg-blue-50 text-blue-900 border border-blue-100 rounded-tr-sm'}`}>
                                              <div className="flex items-center gap-2 mb-1">
                                                  <span className="font-semibold text-xs">{msg.sender?.full_name || 'Unknown'}</span>
                                                  <span className="text-[10px] uppercase opacity-75">{isBuyer ? 'Buyer' : 'Seller'}</span>
                                              </div>
                                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                              <span className="block text-[10px] opacity-75 mt-1 text-right">{new Date(msg.created_at).toLocaleString()}</span>
                                          </div>
                                      )}
                                  </div>
                              )})
                          )}
                          <div ref={messagesEndRef} />
                      </div>
                      
                      {selectedInquiry.status !== 'closed' && (
                          <div className="p-4 border-t border-slate-200 bg-white">
                              <form onSubmit={handleReply} className="flex gap-2">
                                  <input 
                                      type="text" 
                                      value={replyContent}
                                      onChange={(e) => setReplyContent(e.target.value)}
                                      placeholder="Send a message as Admin..." 
                                      className="flex-1 px-4 py-2 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50"
                                      required
                                  />
                                  <button 
                                      type="submit" 
                                      disabled={isSubmitting || !replyContent.trim()}
                                      className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                                  >
                                      <Send className="h-4 w-4" />
                                  </button>
                              </form>
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
        <h1 className="text-2xl font-bold text-slate-900">Manage Inquiries & Messages</h1>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Buyer, Seller, Product or Subject..."
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
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
                <option value="closed">Closed</option>
            </select>
            </div>
        </div>
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No messages found</h3>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject & Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Participants</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date / Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900">{inquiry.subject}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{inquiry.products?.title || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {inquiry.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                          <span className="font-semibold text-slate-700">B:</span> {inquiry.buyers?.full_name || 'N/A'}
                      </div>
                      <div className="text-sm mt-1">
                          <span className="font-semibold text-slate-700">S:</span> {inquiry.sellers?.business_name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="mb-2">{getStatusBadge(inquiry.status)}</div>
                      <div className="text-xs text-slate-500">
                          {new Date(inquiry.updated_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                       <button onClick={() => handleOpenInquiry(inquiry.id)} className="text-emerald-600 hover:text-emerald-900 transition-colors flex items-center justify-end gap-1 ml-auto">
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
