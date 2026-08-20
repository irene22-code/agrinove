import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

// handleDeleteMarket
content = content.replace(
    /const handleDeleteMarket = async \(m: any\) => \{/g,
    `const handleDeleteMarket = async (m: any) => {
    console.log("DELETE MARKET CLICKED:", m);`
);

// handleDeleteSource
content = content.replace(
    /const handleDeleteSource = async \(s: any\) => \{/g,
    `const handleDeleteSource = async (s: any) => {
    console.log("DELETE SOURCE CLICKED:", s);`
);

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
