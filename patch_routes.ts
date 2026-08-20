import fs from 'fs';
const file = 'server/routes/adminPlantHealthRoutes.ts';
let content = fs.readFileSync(file, 'utf8');

const logMiddleware = `
router.use((req, res, next) => {
    console.log("=> ADMIN PLANT HEALTH ROUTE:", req.method, req.url);
    next();
});
`;

content = content.replace("router.use(requireAuth, requireRole(['admin']));", "router.use(requireAuth, requireRole(['admin']));\n" + logMiddleware);
fs.writeFileSync(file, content);
