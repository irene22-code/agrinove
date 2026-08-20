import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

content = content.replace(
    /effective_date: effective_date \|\| null,\s*expiry_date: expiry_date \|\| null,/g,
    `effective_date, expiry_date,`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
