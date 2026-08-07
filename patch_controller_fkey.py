import re

with open('server/controllers/orderController.ts', 'r') as f:
    content = f.read()

content = content.replace("users!orders_buyer_id_fkey(full_name)", "buyers(users(full_name))")
content = content.replace("users!orders_buyer_id_fkey(full_name, email)", "buyers(users(full_name, email))")

with open('server/controllers/orderController.ts', 'w') as f:
    f.write(content)
