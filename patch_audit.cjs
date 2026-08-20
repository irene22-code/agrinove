const fs = require('fs');
let content = fs.readFileSync('server/controllers/adminCropCalendarController.ts', 'utf8');

content = content.replace(/action:\ 'CREATE',/g, "action: 'CREATE', user_id: (req as any).user?.id,");
content = content.replace(/action:\ 'UPDATE',/g, "action: 'UPDATE', user_id: (req as any).user?.id,");
content = content.replace(/action:\ 'DELETE',/g, "action: 'DELETE', user_id: (req as any).user?.id,");

fs.writeFileSync('server/controllers/adminCropCalendarController.ts', content);
console.log("Patched user_id");
