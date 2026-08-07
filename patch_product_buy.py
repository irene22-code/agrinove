import re

# Update ProductDetails.tsx
with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

buy_now_logic_details = """  const handleBuyNow = () => {
    if (!user || user.role !== 'buyer') {
      navigate('/login?redirect=/buyer/checkout/' + product.id);
      return;
    }
    navigate('/buyer/checkout/' + product.id);
  };"""

content = re.sub(r'  const \[isBuying, setIsBuying\] = useState<boolean>\(false\);\s*const handleBuyNow = async \(\) => \{.*?\}\s*catch\s*\(error: any\)\s*\{.*?\}\s*finally\s*\{.*?\n  \};', buy_now_logic_details, content, flags=re.DOTALL)
content = re.sub(r'\{isBuying \? \'Processing...\' : \'Buy Now\'\}', 'Buy Now', content)
content = content.replace("disabled={product.stock_quantity <= 0 || isBuying}", "disabled={product.stock_quantity <= 0}")

with open('src/pages/public/ProductDetails.tsx', 'w') as f:
    f.write(content)

# Update ProductListing.tsx
with open('src/pages/public/ProductListing.tsx', 'r') as f:
    content2 = f.read()

buy_now_logic_listing = """  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      navigate('/login?redirect=/buyer/checkout/' + product.id);
      return;
    }
    navigate('/buyer/checkout/' + product.id);
  };"""

content2 = re.sub(r'  const handleBuyNow = async \(e: React.MouseEvent, product: Product\) => \{.*?\}\s*catch\s*\(error: any\)\s*\{.*?\}\s*finally\s*\{.*?\n  \};', buy_now_logic_listing, content2, flags=re.DOTALL)
content2 = re.sub(r'\{isBuying === product\.id \? \'Processing...\' : \'Buy Now\'\}', 'Buy Now', content2)
content2 = content2.replace("disabled={product.stock_quantity <= 0 || isBuying === product.id}", "disabled={product.stock_quantity <= 0}")

with open('src/pages/public/ProductListing.tsx', 'w') as f:
    f.write(content2)
