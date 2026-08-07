import re

with open('server/controllers/adminController.ts', 'r') as f:
    content = f.read()

content = content.replace("users!orders_buyer_id_fkey(full_name)", "buyers(users(full_name))")

with open('server/controllers/adminController.ts', 'w') as f:
    f.write(content)
