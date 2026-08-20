const fs = require('fs');

let content = fs.readFileSync('src/components/ai/AgroMartAI.tsx', 'utf8');

const emptyStateMsg = `
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
`;

content = content.replace(
  /<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 flex flex-col">[\s\S]*?<\/div>\s*<\/div>\s*\)\}\s*/,
  emptyStateMsg
);

fs.writeFileSync('src/components/ai/AgroMartAI.tsx', content);
