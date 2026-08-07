import re

with open('src/pages/public/ProductListing.tsx', 'r') as f:
    content = f.read()

fav_state = """  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user && user.role === 'buyer') {
      api.get<{success: boolean, data: any[]}>('/buyer/favorites').then(res => {
        if (res.success && res.data) {
          setFavorites(new Set(res.data.map((f: any) => f.product_id)));
        }
      }).catch(console.error);
    }
  }, [user]);

  const fetchFavs = () => {
    if (user && user.role === 'buyer') {
      api.get<{success: boolean, data: any[]}>('/buyer/favorites').then(res => {
        if (res.success && res.data) {
          setFavorites(new Set(res.data.map((f: any) => f.product_id)));
        }
      }).catch(console.error);
    }
  };

  useEffect(() => {
    window.addEventListener('favoritesUpdated', fetchFavs);
    return () => window.removeEventListener('favoritesUpdated', fetchFavs);
  }, [user]);"""

content = re.sub(r'  const \[isBuying, setIsBuying\] = useState<string \| null>\(null\);', fav_state, content)

fav_logic = """  const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      navigate('/login?redirect=/products');
      return;
    }
    try {
      if (favorites.has(product.id)) {
        await api.delete(`/buyer/favorites/${product.id}`);
        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      } else {
        await api.post('/buyer/favorites', { product_id: product.id });
        setFavorites(prev => {
          const next = new Set(prev);
          next.add(product.id);
          return next;
        });
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error('Failed to modify wishlist', error);
    }
  };"""

content = re.sub(r'  const handleAddToWishlist = async.*?\}\s*catch\s*\(error\)\s*\{\s*console\.error\(\'Failed to save product\',\s*error\);\s*\}\s*\};', fav_logic, content, flags=re.DOTALL)

fav_btn = """                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => handleAddToWishlist(e, product)}
                        className={`absolute top-3 right-3 z-10 p-2 backdrop-blur rounded-full shadow-sm transition-all duration-200 ${favorites.has(product.id) ? 'bg-rose-50 text-rose-500 opacity-100' : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'}`}
                      >
                        <Heart className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                      </button>"""

content = re.sub(r'\s*\{\/\* Wishlist Button \*\/\}\s*<button.*?<Heart className="h-4 w-4" />\s*</button>', fav_btn, content, flags=re.DOTALL)

with open('src/pages/public/ProductListing.tsx', 'w') as f:
    f.write(content)
