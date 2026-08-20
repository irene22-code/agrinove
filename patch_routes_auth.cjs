const fs = require('fs');
let content = fs.readFileSync('server/routes/adminCropCalendarRoutes.ts', 'utf8');

if (!content.includes('requireAuth')) {
    content = content.replace("import { Router } from 'express';", "import { Router } from 'express';\nimport { requireAuth, requireRole } from '../middlewares/authMiddleware';");
    content = content.replace("const router = Router();", "const router = Router();\n\n// Protect all admin crop calendar routes\nrouter.use(requireAuth, requireRole(['admin']));");
    fs.writeFileSync('server/routes/adminCropCalendarRoutes.ts', content);
    console.log("Patched auth middleware into routes");
}
