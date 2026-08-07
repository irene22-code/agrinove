import re
with open('server/controllers/productController.ts', 'r') as f:
    c = f.read()
c = c.replace("res.status(404).json({ success: false, error: 'Product not found' });", "res.status(404).json({ success: false, error: 'Product not found', detail: error.message });")
with open('server/controllers/productController.ts', 'w') as f:
    f.write(c)
