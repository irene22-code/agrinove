with open('src/App.tsx', 'r') as f:
    content = f.read()

import re

# Add imports
imports = """
import { AdminBuyers } from './pages/admin/AdminBuyers';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminNotifications } from './pages/admin/AdminNotifications';
"""
content = content.replace("import { AdminLogs } from './pages/admin/AdminLogs';", "import { AdminLogs } from './pages/admin/AdminLogs';" + imports)

# Add routes
routes = """
          <Route path="/admin/buyers" element={<AdminBuyers />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
"""
content = content.replace("<Route path=\"/admin/sellers\" element={<AdminSellers />} />", "<Route path=\"/admin/sellers\" element={<AdminSellers />} />" + routes)

with open('src/App.tsx', 'w') as f:
    f.write(content)
