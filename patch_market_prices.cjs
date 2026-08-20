const fs = require('fs');
let content = fs.readFileSync('src/pages/public/MarketPrices.tsx', 'utf8');

const skeleton = `
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    {['Product', 'Market', 'Unit', 'Current Price', 'Prev Price', 'Change', 'Date', 'Source'].map((h, i) => (
                       <th key={i} className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-3/4"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/4"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-1/2"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-lg w-16"></div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
`;

content = content.replace(
  /<div className="flex justify-center items-center py-20">\s*<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"><\/div>\s*<\/div>/g,
  skeleton
);

content = content.replace(
  "className=\"bg-green-600 hover:bg-green-700 text-white rounded-r-md px-4 py-2 flex items-center transition-colors\"",
  "className=\"bg-gradient-to-r from-green-600 to-sky-600 hover:from-green-700 hover:to-sky-700 text-white rounded-r-md px-4 py-2 flex items-center transition-all shadow-sm\""
);

// We'll also use LanguageContext for the title
content = content.replace(
  "import { Search, MapPin, Calendar, Info, TrendingUp, TrendingDown, Minus, Filter, Store } from 'lucide-react';",
  "import { Search, MapPin, Calendar, Info, TrendingUp, TrendingDown, Minus, Filter, Store } from 'lucide-react';\nimport { useLanguage } from '../../contexts/LanguageContext';"
);

content = content.replace(
  "export default function MarketPrices() {",
  "export default function MarketPrices() {\n  const { t } = useLanguage();"
);

content = content.replace(
  ">Official Market Prices<",
  ">{t('nav.market_prices')}<"
);

fs.writeFileSync('src/pages/public/MarketPrices.tsx', content);
