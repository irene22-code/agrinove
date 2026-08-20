import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

// Replace handleDeleteMarket
const oldMarketDelete = `const res = await api.delete<{success: boolean, action: string}>(\`/admin/market-settings/market/\${m.id}\`);
      if (res.success) {
         if (res.action === 'deactivated') {
             alert('Market is in use. It has been deactivated but historical records are preserved.');
         }
         fetchData();
      }`;

const newMarketDelete = `const res = await api.delete<{success: boolean, action: string}>(\`/admin/market-settings/market/\${m.id}\`);
      if (res.success) {
         if (res.action === 'deactivated') {
             alert('Market is in use. It has been deactivated but historical records are preserved.');
             setMarkets(markets.map(x => x.id === m.id ? { ...x, active: false } : x));
         } else {
             setMarkets(markets.filter(x => x.id !== m.id));
         }
      }`;

// Replace handleDeleteSource
const oldSourceDelete = `const res = await api.delete<{success: boolean, action: string}>(\`/admin/market-settings/source/\${s.id}\`);
      if (res.success) {
         if (res.action === 'deactivated') {
             alert('Source is in use. It has been deactivated but historical records are preserved.');
         }
         fetchData();
      }`;

const newSourceDelete = `const res = await api.delete<{success: boolean, action: string}>(\`/admin/market-settings/source/\${s.id}\`);
      if (res.success) {
         if (res.action === 'deactivated') {
             alert('Source is in use. It has been deactivated but historical records are preserved.');
             setSources(sources.map(x => x.id === s.id ? { ...x, active: false } : x));
         } else {
             setSources(sources.filter(x => x.id !== s.id));
         }
      }`;

content = content.replace(oldMarketDelete, newMarketDelete);
content = content.replace(oldSourceDelete, newSourceDelete);

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
