import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

import_statement = "import { Checkout } from './pages/buyer/Checkout';\n"
content = content.replace("import { BuyerSettings } from './pages/buyer/BuyerSettings';", "import { BuyerSettings } from './pages/buyer/BuyerSettings';\n" + import_statement)

route_statement = '            <Route path="/buyer/checkout/:id" element={<Checkout />} />\n'
content = content.replace('            <Route path="/buyer/orders" element={<BuyerOrders />} />', '            <Route path="/buyer/orders" element={<BuyerOrders />} />\n' + route_statement)

with open('src/App.tsx', 'w') as f:
    f.write(content)
