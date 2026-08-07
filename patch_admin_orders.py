import re

with open('src/pages/admin/AdminOrders.tsx', 'r') as f:
    content = f.read()

content = content.replace("order.users?.full_name", "order.buyers?.users?.full_name")

with open('src/pages/admin/AdminOrders.tsx', 'w') as f:
    f.write(content)
