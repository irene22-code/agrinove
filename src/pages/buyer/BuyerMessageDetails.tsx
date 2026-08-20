import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function BuyerMessageDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const inqRes = await api.get<{ success: boolean; data: any }>(`/inquiries/${id}`);
        if (inqRes.success) setInquiry(inqRes.data);
        
        const msgRes = await api.get<{ success: boolean; data: any[] }>(`/messages/inquiry/${id}`);
        if (msgRes.success) {
           setMessages(msgRes.data);
           
           // Mark all as read
           const unread = msgRes.data.some(m => !m.read_at && m.sender_id !== user?.id);
           if (unread) {
             await api.patch(`/messages/inquiry/${id}/read`, {});
           }
        }
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchData();
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      const res = await api.post<{ success: boolean; data: any }>(`/messages/inquiry/${id}`, { content: newMessage });
      if (res.success) {
        setMessages([...messages, res.data]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message');
    }
  };

  if (isLoading) return <div className="animate-pulse space-y-4">
    <div className="h-8 bg-slate-200 rounded w-1/4"></div>
    <div className="h-64 bg-slate-200 rounded w-full"></div>
  </div>;
  if (!inquiry) return <div>Inquiry not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl">
      <div className="flex items-center mb-6">
        <Link to="/buyer/messages" className="mr-4 text-slate-500 hover:text-green-600 bg-white p-2 rounded-full shadow-sm">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Conversation: {inquiry.products?.title || 'General'}</h1>
          <p className="text-sm text-slate-500">Seller: {inquiry.sellers?.business_name}</p>
        </div>
      </div>
      
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl p-4 ${isMe ? 'bg-green-600 text-white rounded-br-none shadow-md' : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-2 text-right ${isMe ? 'text-green-200' : 'text-slate-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 px-6 py-3 border"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="inline-flex items-center justify-center p-3 h-12 w-12 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
