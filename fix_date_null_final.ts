import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

content = content.replace(
    /effective_date,[\s\n]*expiry_date,/g,
    `effective_date: effective_date || null,
            expiry_date: expiry_date || null,`
);

content = content.replace(
    /effective_date !== undefined\)\s*updateData\.effective_date\s*=\s*effective_date\s*\|\|\s*null;/g,
    `effective_date !== undefined) updateData.effective_date = effective_date || null;`
);

content = content.replace(
    /expiry_date !== undefined\)\s*updateData\.expiry_date\s*=\s*expiry_date\s*\|\|\s*null;/g,
    `expiry_date !== undefined) updateData.expiry_date = expiry_date || null;`
);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
