import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

content = content.replace(
    /updateData\.government_document_date = official_document_date;/g,
    `updateData.government_document_date = official_document_date || null;`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
