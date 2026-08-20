const fs = require('fs');

let content = fs.readFileSync('src/pages/public/CropCalendar.tsx', 'utf8');

// Replace spinner with skeleton loaders
const skeleton = `
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-5 animate-pulse">
                     <div className="h-4 bg-slate-200 rounded w-1/3 mb-3"></div>
                     <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                     <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                     <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
                     <div className="h-3 bg-slate-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
`;

content = content.replace(
  /<div className="flex justify-center items-center py-20">\s*<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"><\/div>\s*<\/div>/g,
  skeleton
);

content = content.replace(
  "import { Search, Calendar, MapPin, ChevronDown, CheckCircle, Info, Leaf, Clock, Map, ThermometerSun, AlertCircle, Sun } from 'lucide-react';",
  "import { Search, Calendar, MapPin, ChevronDown, CheckCircle, Info, Leaf, Clock, Map, ThermometerSun, AlertCircle, Sun } from 'lucide-react';\nimport { useLanguage } from '../../contexts/LanguageContext';"
);

content = content.replace(
  "export default function CropCalendar() {",
  "export default function CropCalendar() {\n  const { t } = useLanguage();"
);

content = content.replace(
  ">National Crop Calendar<",
  ">{t('nav.crop_calendar')}<"
);

fs.writeFileSync('src/pages/public/CropCalendar.tsx', content);
