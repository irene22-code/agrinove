import re

with open('src/pages/seller/SellerOrderDetails.tsx', 'r') as f:
    content = f.read()

content = content.replace("item.products?.category && <p className=\"text-xs text-slate-500 mt-1\">Category: {item.products?.category}</p>", "item.products?.categories?.name && <p className=\"text-xs text-slate-500 mt-1\">Category: {item.products?.categories?.name}</p>")

with open('src/pages/seller/SellerOrderDetails.tsx', 'w') as f:
    f.write(content)
