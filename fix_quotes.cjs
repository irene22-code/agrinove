const fs = require('fs');
function fixFile(file) {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    // replace \` with `
    content = content.replace(/\\`/g, '`');
    // replace \$ with $
    content = content.replace(/\\\$/g, '$');
    fs.writeFileSync(file, content);
}

fixFile('src/services/api/plantHealth.ts');
fixFile('server/controllers/plantHealthController.ts');
fixFile('fix_controller_4.ts');
fixFile('fix_date_update.ts');
