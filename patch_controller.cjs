const fs = require('fs');

let ctrl = fs.readFileSync('server/controllers/adminCropCalendarController.ts', 'utf8');
if(!ctrl.includes('womenFarmer')) {
    ctrl = ctrl.replace("export const auditLogs", "export const womenFarmer = createCrud('crop_calendar_women_farmer');\nexport const auditLogs");
    fs.writeFileSync('server/controllers/adminCropCalendarController.ts', ctrl);
}

let routes = fs.readFileSync('server/routes/adminCropCalendarRoutes.ts', 'utf8');
if(!routes.includes('women-farmer')) {
    routes = routes.replace("setupCrud('audit-logs'", "setupCrud('women-farmer', ctrl.womenFarmer);\nsetupCrud('audit-logs'");
    fs.writeFileSync('server/routes/adminCropCalendarRoutes.ts', routes);
}
console.log("Patched API for women-farmer");
