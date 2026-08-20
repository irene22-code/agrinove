import fs from 'fs';

const file = 'src/components/ai/AgroMartAI.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add deletingId state
const statePattern = `const [conversationId, setConversationId] = useState<string | null>(null);`;
if (!content.includes('const [deletingId')) {
    content = content.replace(statePattern, `const [conversationId, setConversationId] = useState<string | null>(null);\n  const [deletingId, setDeletingId] = useState<string | null>(null);`);
}

// 2. Rewrite handleDeleteConversation
const oldHandlerPattern = `  const handleDeleteConversation = async () => {
     if (!conversationId) return;
     if (!confirm('Are you sure you want to delete this conversation? This will permanently delete the history and attached files.')) return;
     
     setLoading(true);
     try {
         const response = await fetch(\`/api/ai/conversations/\${conversationId}\`, {
             headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
             method: 'DELETE'
         });
         if (response.ok) {
             startNewChat();
             loadConversations();
         } else {
             const data = await response.json();
             alert(data.error || 'Failed to delete conversation');
         }
     } catch (err) {
         console.error(err);
         alert('Failed to delete conversation');
     } finally {
         setLoading(false);
     }
  };`;

const newHandlerPattern = `  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
     if (e) {
         e.stopPropagation();
     }
     if (!id) return;
     if (!confirm('Usiba iyi conversation ya AgroMart AI?')) return;
     
     setDeletingId(id);
     try {
         const response = await fetch(\`/api/ai/conversations/\${id}\`, {
             headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
             method: 'DELETE'
         });
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
  };`;

content = content.replace(oldHandlerPattern, newHandlerPattern);

// 3. Update the Header Delete Button
const oldHeaderDelete = `              {conversationId && !isHistoryOpen && (
              <button onClick={handleDeleteConversation} className="text-white hover:bg-red-700 hover:text-white p-1.5 rounded-md text-xs font-medium transition-colors bg-red-600/50" title="Delete Chat">
                 Delete
              </button>
              )}`;

const newHeaderDelete = `              {conversationId && !isHistoryOpen && (
              <button 
                  onClick={() => handleDeleteConversation(conversationId)} 
                  disabled={deletingId === conversationId}
                  className="text-white hover:bg-red-700 hover:text-white p-1.5 rounded-md text-xs font-medium transition-colors bg-red-600/50 disabled:opacity-50" 
                  title="Delete Chat"
              >
                 {deletingId === conversationId ? 'Deleting...' : 'Delete'}
              </button>
              )}`;
content = content.replace(oldHeaderDelete, newHeaderDelete);


// 4. Update the history rendering logic
const oldHistoryList = `{conversations.map(conv => (
                              <button 
                                  key={conv.id} 
                                  onClick={() => loadConversationMessages(conv.id)}
                                  className={\`w-full text-left p-3 rounded-xl border transition-colors \${conversationId === conv.id ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-sm'}\`}
                              >
                                  <div className="font-medium text-slate-800 truncate">{conv.title || 'Conversation'}</div>
                                  <div className="text-xs text-slate-500 mt-1">{new Date(conv.updated_at || conv.created_at).toLocaleDateString()} {new Date(conv.updated_at || conv.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              </button>
                          ))}`;

const newHistoryList = `{conversations.map(conv => (
                              <div key={conv.id} className={\`w-full flex items-center p-2 rounded-xl border transition-colors \${conversationId === conv.id ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-200 hover:border-green-300 hover:shadow-sm'}\`}>
                                  <button 
                                      onClick={() => loadConversationMessages(conv.id)}
                                      className="flex-1 text-left overflow-hidden p-1"
                                  >
                                      <div className="font-medium text-slate-800 truncate">{conv.title || 'Conversation'}</div>
                                      <div className="text-xs text-slate-500 mt-1">{new Date(conv.updated_at || conv.created_at).toLocaleDateString()} {new Date(conv.updated_at || conv.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                  </button>
                                  <button 
                                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                                      className="ml-2 text-slate-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors shrink-0 disabled:opacity-50"
                                      title="Delete this conversation"
                                      disabled={deletingId === conv.id}
                                  >
                                      {deletingId === conv.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                  </button>
                              </div>
                          ))}`;

content = content.replace(oldHistoryList, newHistoryList);

fs.writeFileSync(file, content);
console.log('Frontend patched!');
