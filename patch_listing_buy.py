import re

with open('src/pages/public/ProductListing.tsx', 'r') as f:
    content = f.read()

buy_now_logic = """  const [isBuying, setIsBuying] = useState<string | null>(null);

  const handleBuyNow = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      navigate('/login?redirect=/products');
      return;
    }
    
    setIsBuying(product.id);
    try {
      const hasDiscount = product.discount > 0;
      const currentPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

      const orderData = {
        seller_id: product.seller_id,
        total_amount: currentPrice,
        shipping_address: 'Default Shipping Address',
        items: [{
          product_id: product.id,
          quantity: 1,
          unit_price: currentPrice
        }]
      };

      const res = await api.post<{ success: boolean; data: any }>('/orders', orderData);
      
      if (res.success) {
        alert('Order placed successfully!');
        navigate('/buyer/orders');
      }
    } catch (error: any) {
      alert('Failed to place order: ' + (error.message || 'Unknown error'));
    } finally {
      setIsBuying(null);
    }
  };"""

content = re.sub(r'  const handleAddToWishlist = async', buy_now_logic + '\n\n  const handleAddToWishlist = async', content, count=1)

buy_button = """                            <button
                              onClick={(e) => handleBuyNow(e, product)}
                              disabled={product.stock_quantity <= 0 || isBuying === product.id}
                              className="flex items-center justify-center px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isBuying === product.id ? 'Processing...' : 'Buy Now'}
                            </button>"""

content = re.sub(r'                            <button\s*onClick=\{.*?navigate\(\'/buyer/orders\'\); // Simple mockup for buy now.*?</button>', buy_button, content, flags=re.DOTALL)

with open('src/pages/public/ProductListing.tsx', 'w') as f:
    f.write(content)
