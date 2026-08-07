import re

with open('src/pages/seller/SellerOrderDetails.tsx', 'r') as f:
    content = f.read()

content = content.replace("order.users?.full_name", "order.buyers?.users?.full_name")
content = content.replace("order.users?.email", "order.buyers?.users?.email")

with open('src/pages/seller/SellerOrderDetails.tsx', 'w') as f:
    f.write(content)
