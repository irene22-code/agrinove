import re

for filepath in ['src/pages/public/ProductListing.tsx', 'src/pages/public/ProductDetails.tsx']:
    with open(filepath, 'r') as f:
        content = f.read()
    
    if filepath == 'src/pages/public/ProductListing.tsx':
        content = re.sub(r'interface Product \{', 'interface Product {\n  seller_id: string;', content)
    else:
        content = re.sub(r'interface ProductDetails \{', 'interface ProductDetails {\n  seller_id: string;', content)
        
    with open(filepath, 'w') as f:
        f.write(content)
