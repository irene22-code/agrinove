const fs = require('fs');
let file = 'src/services/api/plantHealth.ts';
let content = fs.readFileSync(file, 'utf8');

content += "\nexport const getAdminPlantHealthById = (id: string) => api.get<any>(`/admin/plant-health/${id}`);\n";

fs.writeFileSync(file, content);
