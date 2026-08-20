import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Paperclip, Mic, Image as ImageIcon, Plus, Loader2, History, MessageSquare, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';

interface Message {
  role: 'user' | 'model';
  content: string;
  attachments?: { publicUrl?: string; data?: string; mimeType: string; name: string }[];
}

export function AgroMartAI() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: "Muraho! Ndi AgroMart AI, umufasha wawe mu buhinzi. Mbaza ikibazo icyo ari cyo cyose kijyanye n'ubuhinzi, cyangwa unyoherereze ifoto cyangwa document." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const isSendingRef = useRef(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<{ url: string; file: File; base64: string }[]>([]);
  const { user, token } = useAuth();
  const location = useLocation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleOpenWithContext = (e: any) => {
      setIsOpen(true);
      if (e.detail?.context) {
        setInput(e.detail.context);
      }
    };
    window.addEventListener('agromart-ai-open-with-context', handleOpenWithContext);
    return () => window.removeEventListener('agromart-ai-open-with-context', handleOpenWithContext);
  }, []);
  

  const loadConversations = async () => {
      if (!user || !token) return;
      setLoadingHistory(true);
      try {
          const res = await fetch('/api/ai/conversations', { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (Array.isArray(data)) {
              setConversations(data);
          }
      } catch (err) {
          console.error("Error loading conversations", err);
      } finally {
          setLoadingHistory(false);
      }
  };

  useEffect(() => {
     if (user && isOpen) {
         loadConversations();
     }
  }, [isOpen, user]);

  const loadConversationMessages = async (id: string) => {
      if (!token) return;
      setLoading(true);
      try {
          const res = await fetch(`/api/ai/conversations/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await res.json();
          if (data && data.messages) {
              const msgs = data.messages.map((m: any) => ({
                  role: m.role,
                  content: m.content,
                  attachments: m.ai_message_attachments?.map((a: any) => ({
                      publicUrl: a.publicUrl,
                      mimeType: a.mime_type,
                      name: a.file_name
                  }))
              }));
              if (msgs.length > 0) {
                  setMessages(msgs);
                  setConversationId(id);
              }
          }
      } catch (err) {
          console.error("Error loading messages:", err);
          alert("Failed to load conversation messages");
      } finally {
          setLoading(false);
          setIsHistoryOpen(false);
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
         const newFiles = Array.from(e.target.files);
         
         // Validate files
         const validFiles = newFiles.filter(file => {
             const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'text/plain';
             const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
             
             if (!isValidType) alert(`${file.name} is not a supported file type (Only Images, PDF, TXT are supported. DOC/DOCX are not supported).`);
             if (!isValidSize) alert(`${file.name} exceeds the 5MB size limit.`);
             
             return isValidType && isValidSize;
         });
         
         if (attachments.length + validFiles.length > 5) {
             alert('You can only attach a maximum of 5 files per message.');
             return;
         }

         setAttachments(prev => [...prev, ...validFiles]);
         
         // Generate previews and base64
         validFiles.forEach(file => {
             const reader = new FileReader();
             reader.onloadend = () => {
                 setAttachmentPreviews(prev => [...prev, {
                     url: URL.createObjectURL(file),
                     file,
                     base64: (reader.result as string).split(',')[1] // remove data:image/...;base64,
                 }]);
             };
             reader.readAsDataURL(file);
         });
     }
     // Reset input so same file can be selected again
     if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
      setAttachmentPreviews(prev => {
          const newPreviews = [...prev];
          URL.revokeObjectURL(newPreviews[index].url);
          newPreviews.splice(index, 1);
          return newPreviews;
      });
  };

  const handleSend = async () => {
      if ((!input.trim() && attachments.length === 0) || loading || isSendingRef.current) return;
      isSendingRef.current = true;
      
      const userMessage: Message = {
          role: 'user',
          content: input,
          attachments: attachmentPreviews.map(p => ({
              mimeType: p.file.type,
              name: p.file.name,
              data: p.base64 // Just for immediate display if needed, but we rely on publicUrl from server mostly
          }))
      };
      
      setMessages(prev => [...prev, userMessage]);
      const currentInput = input;
      const currentPreviews = [...attachmentPreviews];
      setInput('');
      setAttachments([]);
      setAttachmentPreviews([]);
      setLoading(true);
      
      try {
          const payload = {
              message: currentInput,
              conversationId,
              
              attachments: currentPreviews.map(p => ({
                  data: p.base64,
                  mimeType: p.file.type,
                  name: p.file.name
              })),
              context: { currentPath: location.pathname }
          };
          
          const response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
              body: JSON.stringify(payload)
          });
          
          const data = await response.json();
          if (response.ok) {
              setConversationId(data.conversationId);
              setMessages(prev => [...prev, {
                  role: 'model',
                  content: data.message
              }]);
          } else {
              throw new Error(data.error || 'Failed to communicate with AgroMart AI');
          }
      } catch (error: any) {
          console.error(error);
          setMessages(prev => [...prev, {
              role: 'model',
              content: error.message || "AgroMart AI yagize ikibazo. Ongera ugerageze nyuma."
          }]);
      } finally {
          setLoading(false);
          isSendingRef.current = false;
          if (user) loadConversations(); // refresh list in background
      }
  };

  
  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
     console.log("[AI DELETE] HANDLER CALLED", id);
     if (e) {
         e.stopPropagation();
     }
     if (!id) return;
     
     
     console.log("[AI DELETE] REQUEST", id);
     setDeletingId(id);
     try {
         const response = await fetch(`/api/ai/conversations/${id}`, {
             headers: token ? { 'Authorization': `Bearer ${token}` } : {},
             method: 'DELETE'
         });
         console.log("[AI DELETE] RESPONSE", response.status);
         if (response.ok) {
             setConversations(prev => prev.filter(c => c.id !== id));
             if (conversationId === id) {
                 startNewChat();
             }
         } else {
             const data = await response.json();
             if (response.status === 404) {
                 alert('Conversation no longer exists.');
                 setConversations(prev => prev.filter(c => c.id !== id));
                 if (conversationId === id) startNewChat();
             } else if (response.status === 403) {
                 alert('Unauthorized to delete this conversation.');
             } else {
                 alert(data.error || 'Failed to delete conversation');
             }
         }
     } catch (err) {
         console.error(err);
         alert('Failed to delete conversation');
     } finally {
         setDeletingId(null);
     }
  };
  
  const startNewChat = () => {
      setConversationId(null);
      setMessages([{ role: 'model', content: "Muraho! Ndi AgroMart AI, umufasha wawe mu buhinzi. Mbaza ikibazo icyo ari cyo cyose kijyanye n'ubuhinzi, cyangwa unyoherereze ifoto cyangwa document." }]);
  };

  const [isVoiceSupported] = useState('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const toggleVoice = () => {
      if (!isVoiceSupported) {
          alert("Voice input is not supported in this browser.");
          return;
      }
      
      if (isRecording) {
          recognitionRef.current?.stop();
          setIsRecording(false);
          return;
      }
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'rw-RW'; // or en-US based on app language
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsRecording(true);
      recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setInput(prev => prev ? prev + ' ' + text : text);
          setIsRecording(false);
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      
      recognitionRef.current = recognition;
      recognition.start();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-xl hover:bg-green-700 hover:scale-105 transition-all duration-200 flex items-center space-x-2 group"
      >
        <Bot size={28} />
        <span className="hidden md:inline-block font-medium pr-2">AgroMart AI</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[450px] md:h-[600px] bg-white md:rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-slate-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-sky-600 text-white p-4 flex justify-between items-center shrink-0 rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">AgroMart AI</h3>
                <p className="text-green-100 text-xs">Your intelligent agriculture assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {user && (
                <button onClick={() => setIsHistoryOpen(!isHistoryOpen)} className={`text-white p-1.5 rounded-md text-xs font-medium transition-colors ${isHistoryOpen ? 'bg-green-800' : 'hover:bg-green-700'}`} title="History">
                  <History size={16} className="inline mr-1" /> History
                </button>
              )}
              {conversationId && !isHistoryOpen && (
              <button 
                  onClick={() => handleDeleteConversation(conversationId)} 
                  disabled={deletingId === conversationId}
                  className="text-white hover:bg-red-700 hover:text-white p-1.5 rounded-md text-xs font-medium transition-colors bg-red-600/50 disabled:opacity-50" 
                  title="Delete Chat"
              >
                 {deletingId === conversationId ? 'Deleting...' : 'Delete'}
              </button>
              )}
              {!isHistoryOpen && (
              <button onClick={startNewChat} className="text-white hover:bg-green-700 p-1.5 rounded-md text-xs font-medium transition-colors" title="New Chat">
                  <Plus size={16} className="inline mr-1" /> New
              </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-white hover:bg-green-700 p-1.5 rounded-full transition-colors ml-1">
                <X size={20} />
              </button>
            </div>
          </div>

          
          {isHistoryOpen ? (
              <div className="flex-1 overflow-y-auto bg-slate-50 p-4">
                  <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-700 flex items-center"><History size={18} className="mr-2"/> Your Conversations</h4>
                  </div>
                  {loadingHistory ? (
                      <div className="flex items-center justify-center p-8 text-slate-500">
                          <Loader2 className="animate-spin mr-2" size={20} /> Loading history...
                      </div>
                  ) : conversations.length === 0 ? (
                      <div className="text-center p-8 text-slate-500">
                          <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                          <p>No previous conversations found.</p>
                          <button onClick={() => { setIsHistoryOpen(false); startNewChat(); }} className="mt-4 text-green-600 font-medium hover:underline">Start a new chat</button>
                      </div>
                  ) : (
                      <div className="space-y-2">
                          {conversations.map(conv => (
                              <div key={conv.id} className={`w-full flex items-center p-2 rounded-xl border transition-colors ${conversationId === conv.id ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-sm'}`}>
                                  <button 
                                      onClick={() => loadConversationMessages(conv.id)}
                                      className="flex-1 text-left overflow-hidden p-1"
                                  >
                                      <div className="font-medium text-slate-800 truncate">{conv.title || 'Conversation'}</div>
                                      <div className="text-xs text-slate-500 mt-1">{new Date(conv.updated_at || conv.created_at).toLocaleDateString()} {new Date(conv.updated_at || conv.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  </button>
                                  <button 
                                      onClick={(e) => { console.log("[AI DELETE] BUTTON CLICKED", conv.id); handleDeleteConversation(conv.id, e); }}
                                      className="ml-2 text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                                      title="Delete this conversation"
                                      disabled={deletingId === conv.id}
                                  >
                                      {deletingId === conv.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          ) : (
          
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4 py-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-green-100 to-sky-100 rounded-full flex items-center justify-center mb-2 shadow-inner">
                  <Bot className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Hi, I'm AgroNavo AI!</h3>
                <p className="text-sm text-slate-500">I can help you with agricultural advice, crop planning, or finding products.</p>
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <button onClick={() => {setInput('What is the current market price for Maize?'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 hover:shadow-md p-2 rounded-xl text-slate-600 transition-all flex flex-col items-center gap-1 shadow-sm"><span className="text-lg mb-1">💰</span> {t('ai.suggested.market_prices') || 'Market Prices'}</button>
                  <button onClick={() => {setInput('How do I treat tomato blight?'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 hover:shadow-md p-2 rounded-xl text-slate-600 transition-all flex flex-col items-center gap-1 shadow-sm"><span className="text-lg mb-1">🌱</span> {t('ai.suggested.plant_health') || 'Plant Health'}</button>
                  <button onClick={() => {setInput('What is the weather forecast for farming today?'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 hover:shadow-md p-2 rounded-xl text-slate-600 transition-all flex flex-col items-center gap-1 shadow-sm"><span className="text-lg mb-1">🌦️</span> {t('ai.suggested.weather') || 'Weather'}</button>
                  <button onClick={() => {setInput('Show me the best fertilizers available.'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 hover:shadow-md p-2 rounded-xl text-slate-600 transition-all flex flex-col items-center gap-1 shadow-sm"><span className="text-lg mb-1">🛒</span> {t('ai.suggested.products') || 'Products'}</button>
                </div>
              </div>
            )}
{messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-green-600 to-sky-600 text-white rounded-br-sm shadow-md' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                  {/* Attachments Display */}
                  {msg.attachments && msg.attachments.length > 0 && (
                     <div className="flex flex-wrap gap-2 mb-2">
                         {msg.attachments.map((att, i) => (
                             att.mimeType.startsWith('image/') ? (
                                 <img key={i} src={att.publicUrl || `data:${att.mimeType};base64,${att.data}`} alt="attachment" className="max-w-full h-auto max-h-48 rounded-md border border-slate-200" />
                             ) : (
                                 <div key={i} className="flex items-center space-x-2 bg-slate-100/50 p-2 rounded-md border border-slate-200 text-sm">
                                    <Paperclip size={16} />
                                    <span className="truncate max-w-[150px]">{att.name}</span>
                                 </div>
                             )
                         ))}
                     </div>
                  )}
                  {msg.content && (
                      <div className="prose prose-sm prose-p:my-1 prose-headings:my-2 prose-headings:text-base max-w-none break-words">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-sm shadow-sm p-4 flex items-center space-x-2">
                     <Loader2 className="animate-spin" size={16} />
                     <span className="text-sm">{t('ai.thinking')}</span>
                  </div>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          )}

          {/* Attachment Previews Before Sending */}
          {attachmentPreviews.length > 0 && (
              <div className="p-3 bg-slate-100 border-t border-slate-200 flex gap-2 overflow-x-auto shrink-0">
                  {attachmentPreviews.map((preview, idx) => (
                      <div key={idx} className="relative group shrink-0">
                          {preview.file.type.startsWith('image/') ? (
                             <img src={preview.url} alt="preview" className="h-16 w-16 object-cover rounded-md border border-slate-300" />
                          ) : (
                             <div className="h-16 w-16 bg-white flex flex-col items-center justify-center rounded-md border border-slate-300 p-1">
                                <Paperclip size={20} className="text-slate-500 mb-1" />
                                <span className="text-[10px] text-slate-500 truncate w-full text-center">{preview.file.name}</span>
                             </div>
                          )}
                          <button 
                             onClick={() => removeAttachment(idx)}
                             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                              <X size={14} />
                          </button>
                      </div>
                  ))}
              </div>
          )}

          {/* Input Area */}
          {!isHistoryOpen && (
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-end space-x-2">
              <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all flex items-end p-1">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-slate-500 hover:text-green-600 hover:bg-slate-200 rounded-full transition-colors shrink-0"
                    title="Attach file"
                 >
                    <Plus size={20} />
                 </button>
                 <input 
                    type="file" 
                    multiple 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect}
                    accept="image/*,.pdf,.txt"
                 />
                 
                 <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder={t('ai.ask')}
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 py-2.5 px-2 text-sm min-h-[44px]"
                    rows={1}
                    style={{ height: input.length > 50 ? '80px' : '44px' }}
                 />
                 
                 <button 
                    onClick={toggleVoice}
                    className={`p-2 rounded-full transition-colors shrink-0 ${isRecording ? 'text-red-500 bg-red-100 animate-pulse' : 'text-slate-500 hover:text-green-600 hover:bg-slate-200'}`}
                    title={isVoiceSupported ? "Voice input" : "Voice not supported"}
                 >
                    <Mic size={20} />
                 </button>
              </div>
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          )}
        </div>
      )}
    </>
  );
}
