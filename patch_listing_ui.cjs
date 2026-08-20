const fs = require('fs');

let content = fs.readFileSync('src/pages/public/ProductListing.tsx', 'utf8');

// Replace spinner with skeleton loaders
const skeleton = `
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
                    <div className="aspect-w-4 aspect-h-3 bg-slate-200 w-full h-52"></div>
                    <div className="p-5 flex-1 flex flex-col space-y-3">
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2 mb-4"></div>
                      <div className="h-10 bg-slate-200 rounded w-full mt-auto"></div>
                    </div>
                  </div>
                ))}
              </div>
`;

content = content.replace(
  /<div className="flex justify-center items-center h-64">\s*<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"><\/div>\s*<\/div>/g,
  skeleton
);

// Style the Buy Now button to match gradient theme
content = content.replace(
  /className="flex items-center justify-center px-3 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"/g,
  `className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-green-600 to-sky-600 text-white hover:from-green-700 hover:to-sky-700 rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"`
);

fs.writeFileSync('src/pages/public/ProductListing.tsx', content);
