import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// The insert in createMarketPrice
content = content.replace(
    /effective_date,\s*expiry_date,/g,
    `effective_date: effective_date || null,
            expiry_date: expiry_date || null,`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
