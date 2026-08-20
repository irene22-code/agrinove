import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

content = content.replace(/alert\("Failed to save market price"\);/,
`alert(\`Failed to save market price: \${error.response?.data?.error || error.message}\`);`);

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
