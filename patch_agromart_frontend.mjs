import fs from 'fs';

const file = 'src/components/ai/AgroMartAI.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Trash2 icon
if (!content.includes('Trash2')) {
    content = content.replace('MessageSquare }', 'MessageSquare, Trash2 }');
}

// Add handleDeleteAllHistory function
const handleDeleteCode = `  const handleDeleteConversation = async () => {`;
const newHandleDeleteAllHistory = `  const handleDeleteAllHistory = async () => {
     if (!confirm('Delete all AI history?\\n\\nIbi bizasiba conversations zawe zose za AgroMart AI, harimo ubutumwa n\\'amafoto/documents bifitanye isano na zo. Iki gikorwa ntigishobora gusubizwa inyuma.')) return;
     
     setLoadingHistory(true);
     try {
         const response = await fetch(\`/api/ai/conversations\`, {
             headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
             method: 'DELETE'
         });
         if (response.ok) {
             setConversations([]);
             startNewChat();
         } else {
             const data = await response.json();
             alert(data.error || 'Failed to delete history');
         }
     } catch (err) {
         console.error(err);
         alert('Failed to delete history');
     } finally {
         setLoadingHistory(false);
     }
  };

  const handleDeleteConversation = async () => {`;

content = content.replace(handleDeleteCode, newHandleDeleteAllHistory);

// Add the Delete All History button to the History view header
const oldHistoryHeader = `<h4 className="font-bold text-slate-700 mb-4 flex items-center"><History size={18} className="mr-2"/> Your Conversations</h4>`;
const newHistoryHeader = `<div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-slate-700 flex items-center"><History size={18} className="mr-2"/> Your Conversations</h4>
                      {conversations.length > 0 && (
                          <button 
                              onClick={handleDeleteAllHistory}
                              className="text-red-600 hover:bg-red-50 p-1.5 rounded-md text-xs font-medium transition-colors flex items-center border border-red-200"
                              title="Delete all AI history"
                          >
                              <Trash2 size={14} className="mr-1" /> Delete All
                          </button>
                      )}
                  </div>`;

content = content.replace(oldHistoryHeader, newHistoryHeader);

fs.writeFileSync(file, content);
console.log('Frontend patched!');
