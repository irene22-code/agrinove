const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

const newSwitcher = `
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 mx-2 border border-slate-200">
              <button 
                onClick={() => setLanguage('en')} 
                className={\`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 \${language === 'en' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
                title="English"
              >
                <span>🇬🇧</span>
                <span className="hidden lg:inline">EN</span>
              </button>
              <button 
                onClick={() => setLanguage('rw')} 
                className={\`px-2.5 py-1 text-xs font-bold rounded-full transition-all flex items-center gap-1 \${language === 'rw' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
                title="Kinyarwanda"
              >
                <span>🇷🇼</span>
                <span className="hidden lg:inline">RW</span>
              </button>
            </div>
`;

content = content.replace(
  /\{\/\* Language Switcher \*\/\}[\s\S]*?<\/div>/,
  newSwitcher
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
