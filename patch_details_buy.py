import re

with open('src/pages/public/ProductDetails.tsx', 'r') as f:
    content = f.read()

buy_now_logic = """  const [isBuying, setIsBuying] = useState<boolean>(false);

  const handleBuyNow = async () => {
    if (!user || user.role !== 'buyer') {
      navigate('/login?redirect=/products/' + product.id);
      return;
    }
    
    setIsBuying(true);
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
      setIsBuying(false);
    }
  };"""

content = re.sub(r'  const handleSendInquiry = async', buy_now_logic + '\n\n  const handleSendInquiry = async', content, count=1)

add_to_cart_btn = """<button 
                      onClick={handleBuyNow}
                      disabled={product.stock_quantity <= 0 || isBuying}
                      className="flex-1 flex justify-center items-center px-6 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" /> {isBuying ? 'Processing...' : 'Buy Now'}
                    </button>"""

content = re.sub(r'<button\s+disabled=\{product\.stock_quantity <= 0\}\s+className="flex-1 flex justify-center items-center px-6 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"\s*>\s*<ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart\s*</button>', add_to_cart_btn, content, flags=re.DOTALL)


save_product_logic = """  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (user && user.role === 'buyer' && product) {
      api.get<{success: boolean, data: any[]}>('/buyer/favorites').then(res => {
        if (res.success && res.data) {
          setIsSaved(res.data.some((f: any) => f.product_id === product.id));
        }
      }).catch(console.error);
    }
  }, [user, product]);

  const handleToggleFavorite = async () => {
    if (!user || user.role !== 'buyer') return navigate('/login');
    try {
      if (isSaved) {
        await api.delete(`/buyer/favorites/${product.id}`);
        setIsSaved(false);
      } else {
        await api.post('/buyer/favorites', { product_id: product.id });
        setIsSaved(true);
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };"""

content = re.sub(r'  const \[activeImage, setActiveImage\] = useState<string>\(\'\'\);', r'  const [activeImage, setActiveImage] = useState<string>(\'\');' + '\n' + save_product_logic, content)

favorite_btn = """<button
                      onClick={handleToggleFavorite}
                      className={`flex justify-center items-center px-4 py-3.5 border rounded-xl shadow-sm text-base font-medium transition-colors ${isSaved ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
                    </button>"""

content = re.sub(r'<button\s+onClick=\{async \(\) => \{.*?</button>', favorite_btn, content, flags=re.DOTALL, count=1)

with open('src/pages/public/ProductDetails.tsx', 'w') as f:
    f.write(content)
