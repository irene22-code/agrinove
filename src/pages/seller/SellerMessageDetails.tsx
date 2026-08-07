import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function SellerMessageDetails() {
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
        if (msgRes.success) setMessages(msgRes.data.reverse()); // Assume API returns latest first or oldest first. Sort by created_at.
      } catch (error) {
        console.error('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]);

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

  if (isLoading) return <div className="animate-pulse">Loading messages...</div>;
  if (!inquiry) return <div>Inquiry not found</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex items-center mb-4">
        <Link to="/seller/messages" className="mr-4 text-slate-500 hover:text-emerald-600">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Conversation about {inquiry.products?.title}</h1>
          <p className="text-sm text-slate-500">Buyer: {inquiry.users?.full_name}</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? 'text-emerald-200' : 'text-slate-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-4 py-2 border"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
