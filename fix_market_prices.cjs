const fs = require('fs');

let file = 'src/pages/admin/AdminMarketPrices.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("product_id: editData?.product_id || '',", "product_id: String(editData?.product_id || ''),");
content = content.replace(/setFormData\(\{/g, 'setFormData({ product_id: "", ');

fs.writeFileSync(file, content);
