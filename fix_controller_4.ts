import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// Fix destructuring
content = content.replace(
    /const \{ product_id, unit, current_price, previous_price, market_id, source_id, notes, effective_date: effective_date \|\| null,[\s\S]*?expiry_date: expiry_date \|\| null, status = 'published', official_document_url, official_document_name, official_document_date, official_document_ref \} = req.body;/g,
    `const { product_id, unit, current_price, previous_price, market_id, source_id, notes, effective_date, expiry_date, status = 'published', official_document_url, official_document_name, official_document_date, official_document_ref } = req.body;`
);

content = content.replace(
    /const \{ unit, current_price, previous_price, market_id, source_id, notes, effective_date: effective_date \|\| null,[\s\S]*?expiry_date: expiry_date \|\| null, status, official_document_url, official_document_name, official_document_date, official_document_ref \} = req.body;/g,
    `const { unit, current_price, previous_price, market_id, source_id, notes, effective_date, expiry_date, status, official_document_url, official_document_name, official_document_date, official_document_ref } = req.body;`
);

// Fix select statements
content = content.replace(
    /effective_date: effective_date \|\| null,\s*expiry_date: expiry_date \|\| null,/g,
    'effective_date, expiry_date,'
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
