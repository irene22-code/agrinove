import re

with open('src/pages/buyer/Checkout.tsx', 'r') as f:
    content = f.read()

content = content.replace("api.post<{ success: boolean; data: any }>", "api.post<{ success: boolean; data?: any; error?: string }>")

with open('src/pages/buyer/Checkout.tsx', 'w') as f:
    f.write(content)
