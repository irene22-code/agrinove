const fs = require('fs');
let content = fs.readFileSync('server/controllers/plantHealthController.ts', 'utf8');
content = content.replace(/tableMapping\[type\]/g, 'tableMapping[type as string]');
fs.writeFileSync('server/controllers/plantHealthController.ts', content);

let settings = fs.readFileSync('src/pages/admin/AdminPlantHealthSettings.tsx', 'utf8');
settings = settings.replace(`setData(res);`, `setData(res as any);`);
settings = settings.replace(`if (res.message)`, `if ((res as any).message)`);
settings = settings.replace(`alert(res.message);`, `alert((res as any).message);`);
fs.writeFileSync('src/pages/admin/AdminPlantHealthSettings.tsx', settings);
