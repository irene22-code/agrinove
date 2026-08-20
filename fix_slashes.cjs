const fs = require('fs');
const files = fs.readdirSync('src/components/admin/crop-calendar').filter(f => f.endsWith('.tsx'));
for(const file of files) {
   let content = fs.readFileSync('src/components/admin/crop-calendar/' + file, 'utf8');
   content = content.replace(/\\`/g, '`');
   content = content.replace(/\\\$/g, '$');
   fs.writeFileSync('src/components/admin/crop-calendar/' + file, content);
}
console.log("Fixed");
