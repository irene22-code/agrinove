const fs = require('fs');

let content = fs.readFileSync('src/components/layout/Header.tsx', 'utf8');

content = content.replace(
  "import { Leaf, LogOut, User as UserIcon, Heart, MessageSquare, Bell, Search, Menu } from 'lucide-react';",
  "import { Leaf, LogOut, User as UserIcon, Heart, MessageSquare, Bell, Search, Menu, Globe } from 'lucide-react';\nimport { useLanguage } from '../../contexts/LanguageContext';"
);

content = content.replace(
  "export function Header() {",
  "export function Header() {\n  const { language, setLanguage, t } = useLanguage();"
);

content = content.replace(
  "AgroMart",
  "AgroNavo"
);

content = content.replace(
  "text-emerald-600",
  "text-green-600"
);

// Replace more emerald with green
content = content.replaceAll("emerald-600", "green-600");
content = content.replaceAll("emerald-500", "green-500");
content = content.replaceAll("emerald-50", "green-50");

// Translate nav items
content = content.replace("Categories", "{t('nav.categories')}");
content = content.replace(">Home<", ">{t('nav.home')}<");
content = content.replace(">Products<", ">{t('nav.products')}<");
content = content.replace(">Market Prices<", ">{t('nav.market_prices')}<");
content = content.replace(">Plant Health<", ">{t('nav.plant_health')}<");
content = content.replace(">Crop Calendar<", ">{t('nav.crop_calendar')}<");
content = content.replace("Buyer Login", "{t('nav.buyer_login')}");
content = content.replace("Seller Login", "{t('nav.seller_login')}");
content = content.replace(">Account<", ">{t('nav.account')}<");

// Add language switcher before the user menu
const langSwitcher = `
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 rounded-full p-1 mx-2">
              <button 
                onClick={() => setLanguage('en')} 
                className={\`px-2 py-1 text-xs font-bold rounded-full transition-colors \${language === 'en' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage('rw')} 
                className={\`px-2 py-1 text-xs font-bold rounded-full transition-colors \${language === 'rw' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}\`}
              >
                RW
              </button>
            </div>
`;

content = content.replace(
  "{user ?",
  langSwitcher + "\n            {user ?"
);

fs.writeFileSync('src/components/layout/Header.tsx', content);
