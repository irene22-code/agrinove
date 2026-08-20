const fs = require('fs');
let content = fs.readFileSync('src/components/ai/AgroMartAI.tsx', 'utf8');

// Replace standard colors with gradient and modern styles
content = content.replace(
  "className=\"bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all transform hover:scale-105\"",
  "className=\"bg-gradient-to-r from-green-600 to-sky-600 hover:from-green-700 hover:to-sky-700 text-white rounded-full p-4 shadow-2xl flex items-center justify-center transition-all transform hover:scale-105 ring-4 ring-green-100\""
);

content = content.replace(
  "className=\"bg-green-600 text-white p-4 flex justify-between items-center shrink-0\"",
  "className=\"bg-gradient-to-r from-green-600 to-sky-600 text-white p-4 flex justify-between items-center shrink-0 rounded-t-2xl\""
);

content = content.replace(
  "className=\"fixed bottom-6 right-6 z-50 flex flex-col items-end\"",
  "className=\"fixed bottom-6 right-6 z-50 flex flex-col items-end drop-shadow-2xl\""
);

content = content.replace(
  "className=\"bg-white rounded-2xl shadow-xl w-80 sm:w-96 flex flex-col overflow-hidden border border-slate-200 mb-4 transition-all\"",
  "className=\"bg-white rounded-2xl shadow-2xl w-80 sm:w-96 flex flex-col overflow-hidden border border-slate-100 mb-4 transition-all ring-1 ring-slate-900/5\""
);

content = content.replace(
  "<span className=\"font-bold\">AgroMart AI</span>",
  "<span className=\"font-bold tracking-wide\">AgroNavo AI</span>"
);

// Add suggested actions
const emptyStateMsg = `
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4 py-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-green-100 to-sky-100 rounded-full flex items-center justify-center mb-2">
                  <Bot className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Hi, I'm AgroNavo AI!</h3>
                <p className="text-sm text-slate-500">I can help you with agricultural advice, crop planning, or finding products.</p>
                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                  <button onClick={() => {setInput('What is the current market price for Maize?'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 p-2 rounded-lg text-slate-600 transition-colors flex flex-col items-center gap-1 shadow-sm"><span className="text-lg">💰</span> Market Prices</button>
                  <button onClick={() => {setInput('How do I treat tomato blight?'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 p-2 rounded-lg text-slate-600 transition-colors flex flex-col items-center gap-1 shadow-sm"><span className="text-lg">🌱</span> Plant Health</button>
                  <button onClick={() => {setInput('What is the weather forecast for farming today?'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 p-2 rounded-lg text-slate-600 transition-colors flex flex-col items-center gap-1 shadow-sm"><span className="text-lg">🌦️</span> Weather</button>
                  <button onClick={() => {setInput('Show me the best fertilizers available.'); handleSend();}} className="text-xs bg-white border border-slate-200 hover:border-green-400 hover:text-green-700 p-2 rounded-lg text-slate-600 transition-colors flex flex-col items-center gap-1 shadow-sm"><span className="text-lg">🛒</span> Products</button>
                </div>
              </div>
            )}
`;

content = content.replace(
  "<div className=\"flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col\">",
  emptyStateMsg
);

// Style user messages
content = content.replace(
  "bg-green-600 text-white rounded-tr-sm",
  "bg-gradient-to-r from-green-600 to-sky-600 text-white rounded-br-sm shadow-md"
);

content = content.replace(
  "placeholder=\"Ask AgroMart AI...\"",
  "placeholder=\"Ask AgroNavo AI...\""
);

fs.writeFileSync('src/components/ai/AgroMartAI.tsx', content);
