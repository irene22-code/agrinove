import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Star, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SellerReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/seller/reviews');
        if (res.success) {
          setReviews(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (isLoading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
      
      {reviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No reviews yet</h3>
          <p className="mt-1 text-sm text-slate-500">Reviews from your customers will appear here.</p>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {reviews.map((review) => (
              <li key={review.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-bold text-slate-900">{review.users?.full_name}</h4>
                      <p className="text-xs text-slate-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 italic">"{review.comment}"</p>
                    <div className="mt-3">
                      <span className="text-xs text-slate-500">Product: </span>
                      <Link to={`/products/${review.products?.id}`} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                        {review.products?.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
