import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// In createMarketPrice object payload
content = content.replace(
    /effective_date,\s*expiry_date,\s*status,/g,
    `effective_date: effective_date || null,
            expiry_date: expiry_date || null,
            status,`
);

content = content.replace(
    /government_document_date: official_document_date,/g,
    `government_document_date: official_document_date || null,`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
