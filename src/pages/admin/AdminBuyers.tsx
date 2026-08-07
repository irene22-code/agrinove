import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import { User } from "lucide-react";

export function AdminBuyers() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyerToDelete, setBuyerToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleDelete = async (id: string) => { console.log("Delete clicked in AdminBuyers"); console.log("Buyer id:", id);
    if (deleteConfirmText !== 'DELETE') return;
    try {
      console.log("Sending delete request to API for buyer", id); const res = await api.delete<{success: boolean, error?: string}>(`/admin/users/${id}`);
      if (res.success) {
        setBuyers(buyers.filter(b => b.id !== id));
        setBuyerToDelete(null);
        setDeleteConfirmText('');
      } else {
        alert(res.error || 'Failed to delete buyer');
      }
    } catch (error: any) {
      console.error('Failed to delete buyer:', error);
      alert(error.message || 'Failed to delete buyer');
    }
  };
  
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      const res = await api.get<{ success: boolean; data: any[] }>("/admin/users?role=buyer");
      if (res.success) setBuyers(res.data);
    } catch (error) {
      alert('Failed to update status');
    }
  };

  useEffect(() => {
    async function fetchBuyers() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>(
          "/admin/users?role=buyer",
        );
        if (res.success) setBuyers(res.data);
      } catch (error) {
        console.error("Failed to fetch buyers:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBuyers();
  }, []);

  if (isLoading) return <div className="animate-pulse">Loading buyers...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Buyers</h1>

      {buyers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <User className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">
            No buyers found
          </h3>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {buyers.map((buyer) => (
                <tr key={buyer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">
                      {buyer.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-500">{buyer.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        buyer.status === "suspended"
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {buyer.status === "suspended" ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(buyer.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {buyer.status === 'suspended' ? (
                       <button onClick={() => handleUpdateStatus(buyer.id, 'active')} className="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-2 py-1 rounded">Activate</button>
                    ) : (
                       <button onClick={() => handleUpdateStatus(buyer.id, 'suspended')} className="text-amber-600 hover:text-amber-900 bg-amber-50 px-2 py-1 rounded">Suspend</button>
                    )}
                    <button onClick={() => { setBuyerToDelete(buyer.id); setDeleteConfirmText(''); }} className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {buyerToDelete && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Buyer</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this buyer? This is a destructive action.
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
              <button onClick={() => setBuyerToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(buyerToDelete)} 
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Buyer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
