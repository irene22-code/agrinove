import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Shield, CheckCircle, XCircle, UserCheck } from 'lucide-react';

export function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sellerToDelete, setSellerToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/sellers');
      if (res.success) {
        setSellers(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch sellers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => { console.log("Delete clicked in AdminSellers"); console.log("Seller id:", id);
    if (deleteConfirmText !== 'DELETE') return;
    try {
      console.log("Sending delete request to API for seller", id); const res = await api.delete<{success: boolean, error?: string}>(`/admin/users/${id}`);
      if (res.success) {
        setSellers(sellers.filter(s => s.id !== id));
        setSellerToDelete(null);
        setDeleteConfirmText('');
      } else {
        alert(res.error || 'Failed to delete seller');
      }
    } catch (error: any) {
      console.error('Failed to delete seller:', error);
      alert(error.message || 'Failed to delete seller');
    }
  };
  
  const updateSellerStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch<{success: boolean}>(`/admin/sellers/${id}/verify`, { status });
      if (res.success) {
        fetchSellers();
      }
    } catch (error) {
      console.error('Failed to update seller status', error);
    }
  };

  if (isLoading) return <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Seller Verification</h1>
      </div>
      
      {sellers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <UserCheck className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No sellers found</h3>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Business Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {sellers.map((seller) => (
                  <tr key={seller.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Shield className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{seller.business_name}</div>
                          <div className="text-xs text-slate-500">Created: {new Date(seller.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{seller.users?.full_name}</div>
                      <div className="text-xs text-slate-500">{seller.users?.email}</div>
                      {seller.phone_number && <div className="text-xs text-slate-500">{seller.phone_number}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{seller.location || seller.address || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        seller.status === 'verified' ? 'bg-emerald-100 text-emerald-800' : 
                        seller.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                        seller.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {seller.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {seller.status !== 'verified' && (
                          <button 
                            onClick={() => updateSellerStatus(seller.id, 'verified')}
                            className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="h-4 w-4" /> Approve
                          </button>
                        )}
                        {seller.status !== 'rejected' && (
                          <button 
                            onClick={() => updateSellerStatus(seller.id, 'rejected')}
                            className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                          >
                            <XCircle className="h-4 w-4" /> Reject
                          </button>
                        )}
                        {seller.status === 'verified' && (
                          <button 
                            onClick={() => updateSellerStatus(seller.id, 'suspended')}
                            className="text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1"
                          >
                            Suspend
                          </button>
                        )}
                      <button onClick={() => { setSellerToDelete(seller.id); setDeleteConfirmText(''); }} className="text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1 rounded-md transition-colors flex items-center gap-1 mt-2 w-full justify-center">Delete Seller</button></div></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sellerToDelete && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Seller</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this seller? This is a destructive action.
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
              <button onClick={() => setSellerToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(sellerToDelete)} 
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Seller
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
