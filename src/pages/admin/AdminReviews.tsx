import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Star } from 'lucide-react';

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      const res = await api.delete<{success: boolean}>(`/admin/reviews/${id}`);
      if (res.success) {
        setReviews(reviews.filter(r => r.id !== id));
        setReviewToDelete(null);
        setDeleteConfirmText('');
      } else {
        alert('Failed to delete review');
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      alert('Failed to delete review');
    }
  };
  
  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/admin/reviews');
        if (res.success) setReviews(res.data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReviews();
  }, []);

  if (isLoading) return <div className="animate-pulse">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Reviews</h1>
      
      {reviews.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Star className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No reviews found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <ul className="divide-y divide-slate-200">
            {reviews.map((review) => (
              <li key={review.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-2">
                     <span className="font-medium text-slate-900">{review.users?.full_name}</span>
                     <span className="text-sm text-slate-500">on {review.products?.title}</span>
                   </div>
                   <div className="flex items-center">
                     <Star className="h-4 w-4 text-yellow-400 fill-current" />
                     <span className="ml-1 text-sm font-medium text-slate-700">{review.rating}/5</span>
                   </div>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
                <div className="mt-2 text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Delete Review Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Review</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this review? This is a destructive action.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setReviewToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(reviewToDelete)} 
                disabled={deleteConfirmText.trim() !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
