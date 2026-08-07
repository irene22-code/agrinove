import re

with open('src/pages/seller/SellerOrders.tsx', 'r') as f:
    content = f.read()

content = content.replace("Buyer: {order.customer_name || order.users?.full_name}", "Buyer: {order.customer_name || order.buyers?.users?.full_name}")

with open('src/pages/seller/SellerOrders.tsx', 'w') as f:
    f.write(content)
