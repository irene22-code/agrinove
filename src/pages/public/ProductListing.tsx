import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Search, Filter, SlidersHorizontal, ShoppingCart, Heart, Star, Store, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  seller_id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  unit: string;
  stock_quantity: number;
  brand: string;
  product_images: { url: string; is_primary: boolean }[];
  categories: { name: string; slug: string };
  sellers: { business_name: string; rating: number };
}

export function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  
  // Sort
  const [sortOption, setSortOption] = useState<string>('featured');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('agromart_recent_searches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {}
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, selectedCategory, sortOption]); // Refetch when backend search/filter changes if needed

  async function fetchCategories() {
    try {
      const res = await api.get<{ success: boolean; data: Category[] }>('/categories');
      if (res.success) setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }

  async function fetchProducts() {
    setIsLoading(true);
    try {
      // Building query params for API if backend supports it, else we fetch all and filter frontend
      let url = '/products?';
      if (debouncedSearch) url += `search=${encodeURIComponent(debouncedSearch)}&`;
      if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
      
      if (sortOption === 'price_low') url += `sort=price_low&`;
      if (sortOption === 'price_high') url += `sort=price_high&`;
      if (sortOption === 'newest') url += `sort=newest&`;
      
      const res = await api.get<{ success: boolean; data: Product[] }>(url);
      if (res.success) setProducts(res.data);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() && !recentSearches.includes(searchTerm.trim())) {
      const newSearches = [searchTerm.trim(), ...recentSearches].slice(0, 5);
      setRecentSearches(newSearches);
      localStorage.setItem('agromart_recent_searches', JSON.stringify(newSearches));
    }
    setShowSuggestions(false);
    setDebouncedSearch(searchTerm);
  };
  
  const handleRecentSearchClick = (term: string) => {
    setSearchTerm(term);
    setDebouncedSearch(term);
    setShowSuggestions(false);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Added ${product.title} to cart`);
  };

  const [isBuying, setIsBuying] = useState<string | null>(null);
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
  }, [user]);

  const handleBuyNow = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      navigate('/login?redirect=/buyer/checkout/' + product.id);
      return;
    }
    navigate('/buyer/checkout/' + product.id);
  };

  const handleAddToWishlist = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || user.role !== 'buyer') {
      navigate('/buyer/login');
      return;
    }
    try {
      await api.post('/buyer/favorites', { product_id: product.id });
      alert('Product saved to wishlist!');
    } catch (error) {
      console.error(error);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    if (minPrice) result = result.filter(p => p.price >= parseFloat(minPrice));
    if (maxPrice) result = result.filter(p => p.price <= parseFloat(maxPrice));
    if (selectedBrand) result = result.filter(p => p.brand?.toLowerCase().includes(selectedBrand.toLowerCase()));
    if (inStockOnly) result = result.filter(p => p.stock_quantity > 0);
    if (minRating > 0) result = result.filter(p => p.sellers?.rating >= minRating);
    
    if (sortOption === 'highest_rated') {
      result.sort((a, b) => (b.sellers?.rating || 0) - (a.sellers?.rating || 0));
    } else if (sortOption === 'best_selling') {
      // Mock best selling
      result.sort((a, b) => a.title.length - b.title.length);
    }
    
    return result;
  }, [products, minPrice, maxPrice, selectedBrand, inStockOnly, minRating, sortOption]);

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      {/* Header Search Area */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900">All Products</h1>
            
            <div className="w-full md:w-1/2 relative z-50">
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-shadow"
                  />
                  <button type="submit" className="absolute inset-y-1 right-1 px-4 bg-emerald-600 text-white rounded-md text-sm font-medium hover:bg-emerald-700 transition-colors">
                    Search
                  </button>
                </div>
              </form>
              
              {showSuggestions && (searchTerm || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-50">
                  {searchTerm && (
                    <div className="p-2 border-b border-slate-100 bg-slate-50">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">Suggestions</p>
                      <button onClick={() => handleRecentSearchClick(searchTerm)} className="w-full text-left px-3 py-2 text-sm text-slate-800 hover:bg-emerald-50 hover:text-emerald-700 rounded-md mt-1 flex items-center">
                        <Search className="h-4 w-4 mr-2 opacity-50" /> {searchTerm}
                      </button>
                    </div>
                  )}
                  {recentSearches.length > 0 && !searchTerm && (
                    <div className="p-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-1">Recent Searches</p>
                      {recentSearches.map((term, i) => (
                        <button key={i} onClick={() => handleRecentSearchClick(term)} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-md flex items-center">
                          <Search className="h-4 w-4 mr-2 text-slate-400" /> {term}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filters Sidebar */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <SlidersHorizontal className="h-5 w-5 text-slate-700" />
                <h2 className="text-lg font-bold text-slate-900">Filters</h2>
              </div>
              
              {/* Category Filter */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Category</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="category" checked={selectedCategory === ''} onChange={() => setSelectedCategory('')} className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300" />
                    <span className="ml-2 text-sm text-slate-600">All Categories</span>
                  </label>
                  {categories.map((c) => (
                    <label key={c.id} className="flex items-center">
                      <input type="radio" name="category" checked={selectedCategory === c.slug} onChange={() => setSelectedCategory(c.slug)} className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300" />
                      <span className="ml-2 text-sm text-slate-600">{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Price Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Price Range ($)</h3>
                <div className="flex items-center gap-2">
                  <input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                  <span className="text-slate-400">-</span>
                  <input type="number" placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full px-2 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              
              {/* Brand Filter */}
              {uniqueBrands.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3">Brand</h3>
                  <select value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} className="w-full text-sm border border-slate-300 rounded-md py-1.5 px-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">All Brands</option>
                    {uniqueBrands.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Rating Filter */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Minimum Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center">
                      <input type="radio" name="rating" checked={minRating === rating} onChange={() => setMinRating(rating)} className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300" />
                      <span className="ml-2 text-sm text-slate-600 flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}`} />
                        ))}
                        <span className="ml-1">& Up</span>
                      </span>
                    </label>
                  ))}
                  <label className="flex items-center">
                    <input type="radio" name="rating" checked={minRating === 0} onChange={() => setMinRating(0)} className="text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300" />
                    <span className="ml-2 text-sm text-slate-600">Any Rating</span>
                  </label>
                </div>
              </div>
              
              {/* Availability Filter */}
              <div className="pt-4 border-t border-slate-100">
                <label className="flex items-center">
                  <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300" />
                  <span className="ml-2 text-sm font-medium text-slate-700">In Stock Only</span>
                </label>
              </div>
              
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Sort & Results Count */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-lg border border-slate-200 mb-6 shadow-sm">
              <p className="text-sm text-slate-600 mb-2 sm:mb-0">
                Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> results
                {debouncedSearch && <span> for "<span className="font-semibold text-slate-900">{debouncedSearch}</span>"</span>}
              </p>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-600">Sort by:</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="text-sm border-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="featured">Featured Products</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="best_selling">Best Selling</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="highest_rated">Highest Rated</option>
                </select>
              </div>
            </div>
            
            {/* Products Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200">
                <Search className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-900">No products found</h3>
                <p className="mt-1 text-slate-500">Try adjusting your filters or search terms.</p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setDebouncedSearch('');
                    setSelectedCategory('');
                    setMinPrice('');
                    setMaxPrice('');
                    setSelectedBrand('');
                    setInStockOnly(false);
                    setMinRating(0);
                  }}
                  className="mt-6 px-4 py-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const primaryImage = product.product_images?.find(img => img.is_primary)?.url || product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
                  const hasDiscount = product.discount > 0;
                  const currentPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;
                  
                  return (
                    <div key={product.id} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative">
                      {/* Badges */}
                      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                        {hasDiscount && (
                          <span className="px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-md shadow-sm">
                            -{product.discount}% OFF
                          </span>
                        )}
                        {product.stock_quantity === 0 && (
                          <span className="px-2 py-1 bg-slate-800 text-white text-xs font-bold rounded-md shadow-sm">
                            OUT OF STOCK
                          </span>
                        )}
                      </div>                      {/* Wishlist Button */}
                      <button 
                        onClick={(e) => handleAddToWishlist(e, product)}
                        className={`absolute top-3 right-3 z-10 p-2 backdrop-blur rounded-full shadow-sm transition-all duration-200 ${favorites.has(product.id) ? 'bg-rose-50 text-rose-500 opacity-100' : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0'}`}
                      >
                        <Heart className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-current' : ''}`} />
                      </button>
                      
                      {/* Image */}
                      <Link to={`/products/${product.id}`} className="aspect-w-4 aspect-h-3 bg-slate-100 w-full overflow-hidden h-52 block relative">
                        <img src={primaryImage} alt={product.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                      
                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider">{product.categories?.name}</p>
                          <div className="flex items-center text-xs font-medium text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded">
                            <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                            {product.sellers?.rating ? product.sellers.rating.toFixed(1) : 'New'}
                          </div>
                        </div>
                        
                        <Link to={`/products/${product.id}`} className="hover:text-emerald-600 transition-colors">
                          <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{product.title}</h3>
                        </Link>
                        
                        <p className="text-xs text-slate-500 mb-2 flex items-center">
                          <Store className="h-3 w-3 mr-1" /> {product.sellers?.business_name}
                        </p>
                        
                        <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed flex-1">
                          {product.description || 'No description available for this product.'}
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100">
                          <div className="flex items-end gap-2 mb-3">
                            <p className="text-xl font-extrabold text-slate-900">
                              ${currentPrice.toFixed(2)}
                            </p>
                            {hasDiscount && (
                              <p className="text-sm font-medium text-slate-400 line-through mb-0.5">
                                ${product.price}
                              </p>
                            )}
                            <p className="text-sm text-slate-500 mb-0.5 ml-auto">/ {product.unit}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={(e) => handleBuyNow(e, product)}
                              disabled={product.stock_quantity <= 0}
                              className="flex items-center justify-center px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Buy Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
