import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

// Fix the catch block in handleDeleteMarket
content = content.replace(
    /catch \(err\) \{\s*alert\('Failed to delete market'\);\s*\}/g,
    `catch (err: any) {
      alert(\`Failed to delete market: \${err.response?.data?.error || err.message}\`);
    }`
);

// Fix the catch block in handleDeleteSource
content = content.replace(
    /catch \(err\) \{\s*alert\('Failed to delete source'\);\s*\}/g,
    `catch (err: any) {
      alert(\`Failed to delete source: \${err.response?.data?.error || err.message}\`);
    }`
);

// Fix the filtering to use active !== false instead of !archived
content = content.replace(/\.filter\(m => !m\.archived\)/g, '.filter(m => m.active !== false)');
content = content.replace(/\.filter\(s => !s\.archived\)/g, '.filter(s => s.active !== false)');

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
