import re

with open('server/controllers/orderController.ts', 'r') as f:
    content = f.read()

content = content.replace("total_price: item.quantity * item.unit_price", "subtotal: item.quantity * item.unit_price")

with open('server/controllers/orderController.ts', 'w') as f:
    f.write(content)
