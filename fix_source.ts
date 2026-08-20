import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

content = content.replace(
    /value=\{s\.name \|\| s\}>\{s\.name \|\| s\}<\/option>/g,
    `value={s.id || s.name}>{s.name || s}</option>`
);

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
