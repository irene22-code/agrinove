const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'admin') {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const newContent = content
        .replaceAll('emerald-50', 'green-50')
        .replaceAll('emerald-100', 'green-100')
        .replaceAll('emerald-200', 'green-200')
        .replaceAll('emerald-300', 'green-300')
        .replaceAll('emerald-400', 'green-400')
        .replaceAll('emerald-500', 'green-500')
        .replaceAll('emerald-600', 'green-600')
        .replaceAll('emerald-700', 'green-700')
        .replaceAll('emerald-800', 'green-800')
        .replaceAll('emerald-900', 'green-900');
        
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}

processDir('src/pages');
processDir('src/components/layout');
processDir('src/components/routes');
