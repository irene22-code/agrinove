import re

with open('src/pages/public/Home.tsx', 'r') as f:
    content = f.read()

content = content.replace('to="/register"', 'to="/seller/register"')

with open('src/pages/public/Home.tsx', 'w') as f:
    f.write(content)
