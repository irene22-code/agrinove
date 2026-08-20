const fs = require('fs');

let file = 'src/components/layout/AdminLayout.tsx';
let content = fs.readFileSync(file, 'utf8');

// I did a bad sed replace
content = content.replace(/import { Leaf, /g, 'import { ');
content = content.replace("import { Users,", "import { Leaf, Users,");

fs.writeFileSync(file, content);
