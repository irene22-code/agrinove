import fs from 'fs';
const file = 'server/controllers/plantHealthController.ts';
let content = fs.readFileSync(file, 'utf8');

const newDelete = `
export const deletePlantHealth = async (req: Request, res: Response) => {
    console.log("DELETE PLANT HEALTH CONTROLLER REACHED");
    console.log("ID RECEIVED:", req.params.id);
    try {
        const { id } = req.params;
`;

content = content.replace(/export const deletePlantHealth = async \(req: Request, res: Response\) => \{\n    try \{\n        const \{ id \} = req.params;/, newDelete.trim());
fs.writeFileSync(file, content);
