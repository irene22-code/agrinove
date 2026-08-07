import re

with open('server/controllers/orderController.ts', 'r') as f:
    content = f.read()

new_select = """        *,
        order_items(*, products(id, title, description, category, brand, price, product_images(url, is_primary), sellers(business_name, contact_email))),
        users!orders_buyer_id_fkey(full_name, email),
        sellers(business_name, contact_email)"""

content = re.sub(r'\*,\s*order_items\(\*, products\(title, product_images\(url, is_primary\)\)\),\s*users!orders_buyer_id_fkey\(full_name, email\),\s*sellers\(business_name, contact_email\)', new_select, content)

with open('server/controllers/orderController.ts', 'w') as f:
    f.write(content)
