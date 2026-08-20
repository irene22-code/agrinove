const fs = require('fs');
let file = 'server/routes/adminPlantHealthRoutes.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("getAdminPlantHealth,", "getAdminPlantHealth,\n  getAdminPlantHealthById,");
content = content.replace("router.get('/', getAdminPlantHealth);", "router.get('/', getAdminPlantHealth);\nrouter.get('/:id', getAdminPlantHealthById);");

fs.writeFileSync(file, content);
