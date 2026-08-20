import fs from 'fs';
const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

// Patch Market Prices query
content = content.replace(
  ".select('price_min, price_max, price_avg, unit, markets(name), products(name)')",
  ".select('current_price, previous_price, unit, markets(name), products(title)')"
);
content = content.replace(
  "const prodName = (r.products as any)?.name || \"\";",
  "const prodName = (r.products as any)?.title || \"\";"
);

// Patch Products query
content = content.replace(
  ".select('id, name, description, price, stock_quantity, unit, users(full_name)')",
  ".select('id, title, description, price, stock_quantity, unit_of_measure, users(full_name)')"
);
content = content.replace(
  ".ilike('name', `%${query}%`)",
  ".ilike('title', `%${query}%`)"
);

fs.writeFileSync(file, content);
