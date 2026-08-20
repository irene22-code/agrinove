import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// The select blocks have `effective_date,` and `expiry_date,` but maybe they got messed up. Let's make sure the select is correct.
content = content.replace(
    /effective_date,\s*expiry_date, status/g,
    'effective_date, expiry_date, status'
);

// The insert in createMarketPrice needs `effective_date: effective_date || null`
content = content.replace(
    /price_change,\s*effective_date,\s*expiry_date: expiry_date \|\| null,/g,
    `price_change,
            effective_date: effective_date || null,
            expiry_date: expiry_date || null,`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
