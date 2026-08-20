const fs = require('fs');

let content = fs.readFileSync('src/pages/public/ProductDetails.tsx', 'utf8');

// Update Buy Now button to gradient
content = content.replace(
  /className="flex-1 flex items-center justify-center px-6 py-3 bg-green-600 text-white hover:bg-green-700 rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50"/g,
  `className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-sky-600 text-white hover:from-green-700 hover:to-sky-700 rounded-xl font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50"`
);

// Update Add to Wishlist icon color (it's using rose-500 usually, but let's make sure it's nice)
// We already replaced emerald with green in ProductDetails via patch_colors.cjs

fs.writeFileSync('src/pages/public/ProductDetails.tsx', content);
