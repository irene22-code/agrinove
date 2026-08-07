import re
with open('src/App.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
seen_imports = set()
for line in lines:
    if "import { BuyerOrderDetails } from './pages/buyer/BuyerOrderDetails';" in line:
        if "BuyerOrderDetails" not in seen_imports:
            new_lines.append(line)
            seen_imports.add("BuyerOrderDetails")
    elif '<Route path="/buyer/orders/:id" element={<BuyerOrderDetails />} />' in line:
        if "RouteBuyerOrderDetails" not in seen_imports:
            new_lines.append(line)
            seen_imports.add("RouteBuyerOrderDetails")
    else:
        new_lines.append(line)

with open('src/App.tsx', 'w') as f:
    f.writelines(new_lines)
