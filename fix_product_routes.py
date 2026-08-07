import re
with open('server/routes/productRoutes.ts', 'r') as f:
    content = f.read()

content = content.replace("upload.single('image')", "upload.array('images', 5)")

with open('server/routes/productRoutes.ts', 'w') as f:
    f.write(content)
