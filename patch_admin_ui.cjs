const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCropCalendar.tsx', 'utf8');

if(!content.includes('WomenFarmerManager')) {
    content = content.replace("import { AuditLogsManager }", "import { AuditLogsManager } from '../../components/admin/crop-calendar/AuditLogsManager';\nimport { WomenFarmerManager } from '../../components/admin/crop-calendar/WomenFarmerManager';\nimport { Users } from 'lucide-react';");
    
    // Remove the extra import that might have been created above if I did search/replace poorly.
    // Let's just do it cleanly.
    content = content.replace("import { AuditLogsManager } from '../../components/admin/crop-calendar/AuditLogsManager';\nimport { AuditLogsManager }", "import { AuditLogsManager }");
    
    content = content.replace("{ id: 'audit', label: 'Audit Logs', icon: History }", "{ id: 'women-farmer', label: 'Women Farmer', icon: Users },\n    { id: 'audit', label: 'Audit Logs', icon: History }");
    
    content = content.replace("{activeTab === 'audit' && <AuditLogsManager />}", "{activeTab === 'women-farmer' && <WomenFarmerManager />}\n        {activeTab === 'audit' && <AuditLogsManager />}");
    
    fs.writeFileSync('src/pages/admin/AdminCropCalendar.tsx', content);
    console.log("Patched AdminCropCalendar.tsx");
}
