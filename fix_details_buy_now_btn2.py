import re
with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

# I want to update navigate('/login') to pass redirect
content = content.replace("navigate('/login')", "navigate('/login?redirect=/products/' + product?.id)")

with open('src/pages/public/ProductDetails.tsx', 'w') as f:
    f.write(content)
