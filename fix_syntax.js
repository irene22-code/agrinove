const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCropCalendar.tsx', 'utf8');

content = content.replace("import { Users } from 'lucide-react'; from '../../components/admin/crop-calendar/AuditLogsManager';", "import { Users } from 'lucide-react';");

fs.writeFileSync('src/pages/admin/AdminCropCalendar.tsx', content);
