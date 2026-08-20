import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { ShoppingCart, MessageSquare, Star, ArrowLeft, X, Heart, Phone, Mail, CheckCircle, Package, Truck, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProductDetails {
  seller_id: string;
  id: string;
  title: string;
  description: string;
  price: number;
  discount: number;
  unit: string;
  stock_quantity: number;
  brand: string;
  weight: string;
  dimensions: string;
  color: string;
  size: string;
  material: string;
  warranty: string;
  manufacturer: string;
  country_of_origin: string;
  delivery_info: string;
  return_policy: string;
  product_images: { url: string; is_primary: boolean }[];
  categories: { name: string; slug: string };
  sellers: { 
    id: string; 
    business_name: string; 
    business_description: string;
    rating: number; 
    total_reviews: number;
    phone_number: string;
    email: string;
    whatsapp_number?: string;
    address: string;
    users: { full_name: string; avatar_url: string; };
  };
  reviews: { id: string; rating: number; comment: string; created_at: string;  users: { full_name: string; avatar_url: string; } }[];
}

export function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

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
    if (!user || user.role !== 'buyer') return navigate('/buyer/login?redirect=/products/' + product?.id);
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
  };
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  // Basic mobile check
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const [inquiryMessage, setInquiryMessage] = useState('');
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      window.scrollTo(0, 0);
      try {
        const res = await api.get<{ success: boolean; data: ProductDetails }>(`/products/${id}`);
        if (res.success) {
          setProduct(res.data);
          const primary = res.data.product_images?.find(img => img.is_primary)?.url || res.data.product_images?.[0]?.url;
          if (primary) setActiveImage(primary);
          
          // Add to recent
          const stored = localStorage.getItem("agromart_recent");
          let recent = [];
          if (stored) {
            try {
              recent = JSON.parse(stored);
            } catch (e) {}
          }
          recent = recent.filter((p: any) => p.id !== res.data.id);
          recent.unshift(res.data);
          if (recent.length > 10) recent.pop();
          localStorage.setItem("agromart_recent", JSON.stringify(recent));

          // Fetch recommendations (same category)
          const recsRes = await api.get<{ success: boolean; data: any[] }>(`/products?category=${res.data.categories?.slug}`);
          if (recsRes.success) {
             setRecommendations(recsRes.data.filter(p => p.id !== res.data.id).slice(0, 4));
          }
        }
      } catch (error) {
        console.error('Failed to fetch product', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    if (!user || user.role !== 'buyer') {
      navigate('/buyer/login?redirect=/buyer/checkout/' + product.id);
      return;
    }
    navigate('/buyer/checkout/' + product.id);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryMessage.trim()) return;
    setIsSendingInquiry(true);
    try {
      const res = await api.post<{success: boolean, data: any}>('/inquiries', {
        seller_id: product?.seller_id,
        product_id: product?.id,
        subject: `Inquiry about ${product?.title}`,
        message: inquiryMessage
      });
      if (res.success) {
        navigate(`/buyer/inquiries/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSendingInquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Package className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Product not found</h2>
        <p className="text-slate-500 mb-6">The product you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/products" className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
        </Link>
      </div>
    );
  }

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, rev) => acc + rev.rating, 0) / product.reviews.length
    : 0;

  const hasDiscount = product.discount > 0;
  const currentPrice = hasDiscount ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div className="bg-slate-50 min-h-screen pb-12 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex text-sm text-slate-500 mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link to="/products" className="hover:text-green-600 transition-colors">Products</Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <Link to={`/products?category=${product.categories?.slug}`} className="hover:text-green-600 transition-colors">{product.categories?.name}</Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2">/</span>
                <span className="text-slate-800 font-medium line-clamp-1">{product.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Product Info */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="aspect-w-4 aspect-h-3 bg-slate-100 rounded-xl overflow-hidden h-80 relative group">
                    {hasDiscount && (
                      <span className="absolute top-3 left-3 px-3 py-1 bg-rose-500 text-white text-sm font-bold rounded-lg shadow-sm z-10">
                        -{product.discount}% OFF
                      </span>
                    )}
                    {activeImage ? (
                      <img src={activeImage} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                    )}
                  </div>
                  {product.product_images && product.product_images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {product.product_images.map((img, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveImage(img.url)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img.url ? 'border-green-600 opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
                        >
                          <img src={img.url} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col">
                  <p className="text-sm font-bold text-green-600 tracking-wider uppercase mb-2">{product.brand || product.categories?.name}</p>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 leading-tight">{product.title}</h1>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1.5 text-sm font-bold text-yellow-700">
                        {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                      </span>
                    </div>
                    <span className="text-sm text-slate-500 underline decoration-slate-300 underline-offset-4 cursor-pointer hover:text-slate-800">
                      {product.reviews?.length || 0} Reviews
                    </span>
                  </div>
                  
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-end gap-3">
                      <p className="text-4xl font-black text-slate-900">${currentPrice.toFixed(2)}</p>
                      {hasDiscount && (
                        <p className="text-lg font-semibold text-slate-400 line-through mb-1">${product.price}</p>
                      )}
                      <p className="text-lg text-slate-500 mb-1">/ {product.unit}</p>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">Prices include VAT where applicable.</p>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-sm">
                      <div className={`w-3 h-3 rounded-full mr-2 ${product.stock_quantity > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="font-medium text-slate-700">{product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}</span>
                      <span className="text-slate-500 ml-2">({product.stock_quantity} available)</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white">
                        <button 
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 text-slate-600 hover:text-green-600 transition-colors"
                        >-</button>
                        <span className="px-4 py-2 font-semibold text-slate-900 border-x border-slate-300">{quantity}</span>
                        <button 
                          onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                          className="px-3 py-2 text-slate-600 hover:text-green-600 transition-colors"
                        >+</button>
                      </div>
                      <p className="text-sm text-slate-500">Quantity</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                    <button 
                      onClick={handleBuyNow}
                      disabled={product.stock_quantity <= 0}
                      className="flex-1 flex justify-center items-center px-6 py-3.5 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" /> Buy Now
                    </button>
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex justify-center items-center px-4 py-3.5 border rounded-xl shadow-sm text-base font-medium transition-colors ${isSaved ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'}`}
                      title="Save to Wishlist"
                    >
                      <Heart className={`h-5 w-5 ${isSaved ? 'fill-current text-rose-500' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Details Tabs / Sections */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Product Overview</h2>
                <div className="prose prose-slate max-w-none mb-8 text-slate-600 leading-relaxed">
                  <p>{product.description}</p>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-4 border-t border-slate-100 pt-6">Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {product.brand && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Brand</span><span className="font-medium text-slate-900">{product.brand}</span></div>}
                  {product.weight && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Weight</span><span className="font-medium text-slate-900">{product.weight}</span></div>}
                  {product.dimensions && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Dimensions</span><span className="font-medium text-slate-900">{product.dimensions}</span></div>}
                  {product.color && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Color</span><span className="font-medium text-slate-900">{product.color}</span></div>}
                  {product.size && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Size</span><span className="font-medium text-slate-900">{product.size}</span></div>}
                  {product.material && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Material</span><span className="font-medium text-slate-900">{product.material}</span></div>}
                  {product.country_of_origin && <div className="flex justify-between py-2 border-b border-slate-100"><span className="text-slate-500">Origin</span><span className="font-medium text-slate-900">{product.country_of_origin}</span></div>}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h2>
                
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map(review => (
                      <div key={review.id} className="border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                              {review.users?.avatar_url ? (
                                <img src={review.users.avatar_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <User className="h-full w-full p-2 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900">{review.users?.full_name || 'Anonymous'}</p>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</span>
                        </div>
                        {false && (
                          <p className="text-xs font-semibold text-green-600 mb-2 flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" /> Verified Purchase
                          </p>
                        )}
                        <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No reviews yet for this product.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar / Seller Info */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Delivery & Returns</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Truck className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Delivery Information</p>
                    <p className="text-xs text-slate-600 mt-1">{product.delivery_info || 'Standard delivery applies. Shipping costs calculated at checkout.'}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Return Policy</p>
                    <p className="text-xs text-slate-600 mt-1">{product.return_policy || '30-day return policy for unused items in original packaging.'}</p>
                  </div>
                </div>
                {product.warranty && (
                   <div className="flex gap-3">
                   <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0" />
                   <div>
                     <p className="text-sm font-semibold text-slate-900">Warranty</p>
                     <p className="text-xs text-slate-600 mt-1">{product.warranty}</p>
                   </div>
                 </div>
                )}
              </div>
            </div>

            {/* Seller Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Seller Information</h3>
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-green-200">
                  {product.sellers?.users?.avatar_url ? (
                    <img src={product.sellers.users.avatar_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-green-700 font-bold text-xl">{product.sellers?.business_name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-lg leading-tight mb-1">{product.sellers?.business_name}</p>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                    <span className="font-medium text-slate-700 mr-1">{product.sellers?.rating ? product.sellers.rating.toFixed(1) : 'New'}</span>
                    <span className="text-slate-500">({product.sellers?.total_reviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-6">
                 {product.sellers?.address && (
                    <p className="text-sm text-slate-600 flex items-start gap-2">
                      <span className="font-medium text-slate-900">Address:</span> {product.sellers.address}
                    </p>
                 )}
                 <p className="text-sm text-slate-600 line-clamp-3">
                   {product.sellers?.business_description || 'No business description provided.'}
                 </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    if (user?.role !== 'buyer') return navigate('/buyer/login?redirect=/products/' + product?.id);
                    setShowInquiryModal(true);
                  }}
                  className="w-full flex justify-center items-center px-4 py-2.5 border border-green-600 rounded-lg shadow-sm text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-2" /> Send Inquiry
                </button>
                {/* Call Seller */}
                <div className="w-full">
                  {product.sellers?.phone_number ? (
                    isMobile ? (
                      <a href={`tel:${product.sellers.phone_number}`} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        📞 Phone Number: {product.sellers.phone_number}
                      </a>
                    ) : (
                      <button onClick={() => setShowPhoneModal(true)} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                        📞 Phone Number: {product.sellers.phone_number}
                      </button>
                    )
                  ) : null}
                </div>

                {/* WhatsApp */}
                <div className="w-full">
                  {product.sellers?.whatsapp_number || product.sellers?.phone_number ? (
                    <a href={`https://wa.me/${(product.sellers.whatsapp_number || product.sellers.phone_number).replace(/\+/g, '')}`} target="_blank" rel="noreferrer" className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors border-green-200">
                      💬 WhatsApp: {product.sellers.whatsapp_number || product.sellers.phone_number}
                    </a>
                  ) : (
                    <div className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50">
                      WhatsApp number not available.
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="w-full">
                  {product.sellers?.email ? (
                    <a href={`mailto:${product.sellers.email}`} className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors">
                      📧 Email: {product.sellers.email}
                    </a>
                  ) : (
                    <div className="w-full flex justify-center items-center px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-500 bg-slate-50">
                      Email not available.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map(rec => {
                const recImage = rec.product_images?.find((img: any) => img.is_primary)?.url || rec.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600';
                return (
                  <Link key={rec.id} to={`/products/${rec.id}`} className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-w-4 aspect-h-3 bg-slate-100 w-full overflow-hidden h-48 relative">
                      {rec.discount > 0 && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded shadow-sm z-10">
                          -{rec.discount}%
                        </span>
                      )}
                      <img src={recImage} alt={rec.title} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">{rec.categories?.name}</p>
                      <h3 className="text-md font-bold text-slate-900 mb-1 line-clamp-1">{rec.title}</h3>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-lg font-extrabold text-slate-900">${(rec.price * (1 - (rec.discount || 0)/100)).toFixed(2)}</p>
                        {rec.discount > 0 && <p className="text-xs text-slate-400 line-through">${rec.price}</p>}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {showInquiryModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Contact Seller</h3>
              <button onClick={() => setShowInquiryModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full p-1.5 transition-colors"><X className="h-5 w-5"/></button>
            </div>
            <form onSubmit={handleSendInquiry} className="p-6">
              <div className="mb-4 bg-slate-50 p-3 rounded-lg flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-200 rounded-md overflow-hidden flex-shrink-0">
                  {activeImage && <img src={activeImage} className="h-full w-full object-cover" alt=""/>}
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Inquiring about</p>
                  <p className="text-sm font-bold text-slate-900 line-clamp-1">{product.title}</p>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                <textarea 
                  required 
                  rows={4} 
                  value={inquiryMessage} 
                  onChange={e => setInquiryMessage(e.target.value)} 
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm resize-none shadow-sm" 
                  placeholder="Hello, I would like to know more about this product..."
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowInquiryModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={isSendingInquiry || !inquiryMessage.trim()} className="px-5 py-2.5 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center">
                  {isSendingInquiry ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Sending...</>
                  ) : 'Send Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPhoneModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden transform transition-all p-6 text-center">
             <h3 className="text-xl font-bold text-slate-900 mb-2">Seller Phone Number</h3>
             <p className="text-3xl font-extrabold text-green-600 mb-6 py-4 bg-slate-50 rounded-xl tracking-wider">{product?.sellers?.phone_number}</p>
             <button onClick={() => setShowPhoneModal(false)} className="w-full px-5 py-3 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
