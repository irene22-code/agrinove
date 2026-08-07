import re

with open('src/pages/buyer/Checkout.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'\s*seller_id:\s*product\.seller_id\s*\|\|\s*product\.sellers\?\.id,', '', content)

with open('src/pages/buyer/Checkout.tsx', 'w') as f:
    f.write(content)
