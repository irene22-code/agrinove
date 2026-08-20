import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// Restore all destructuring correctly
content = content.replace(
    /const \{ product_id, unit, current_price, previous_price, market_id, source_id, notes, effective_date: effective_date \|\| null,\s*expiry_date: expiry_date \|\| null/g,
    `const { product_id, unit, current_price, previous_price, market_id, source_id, notes, effective_date, expiry_date`
);

content = content.replace(
    /const \{ unit, current_price, previous_price, market_id, source_id, notes, effective_date: effective_date \|\| null,\s*expiry_date: expiry_date \|\| null/g,
    `const { unit, current_price, previous_price, market_id, source_id, notes, effective_date, expiry_date`
);

// Restore all selects correctly
content = content.replace(
    /effective_date: effective_date \|\| null,\s*expiry_date: expiry_date \|\| null/g,
    `effective_date, expiry_date`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
