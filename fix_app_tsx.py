import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { BuyerSettings } from './pages/buyer/BuyerSettings';", "import { BuyerSettings } from './pages/buyer/BuyerSettings';\nimport { BuyerOrderDetails } from './pages/buyer/BuyerOrderDetails';")
content = content.replace("<Route path=\"/buyer/orders\" element={<BuyerOrders />} />", "<Route path=\"/buyer/orders\" element={<BuyerOrders />} />\n            <Route path=\"/buyer/orders/:id\" element={<BuyerOrderDetails />} />")

with open('src/App.tsx', 'w') as f:
    f.write(content)
