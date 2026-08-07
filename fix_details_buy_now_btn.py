import re
with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

content = content.replace("product?.sellers?.id", "product?.seller_id")

with open('src/pages/public/ProductDetails.tsx', 'w') as f:
    f.write(content)
