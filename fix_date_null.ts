import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// In createMarketPrice object payload
content = content.replace(
    /effective_date, expiry_date,/g,
    `effective_date: effective_date || null,
            expiry_date: expiry_date || null,`
);

content = content.replace(
    /updateData\.government_document_date = official_document_date;/g,
    `updateData.government_document_date = official_document_date || null;`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
