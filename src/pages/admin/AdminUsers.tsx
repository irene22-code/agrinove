import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, Search, Filter, Edit, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deletingUser, setDeletingUser] = useState<any>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/users');
      if (res.success) {
        setUsers(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status: newStatus });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      alert('Failed to update status');
    }
  };
  
  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role: newRole });
      fetchUsers();
      setEditingUser(null);
    } catch (error) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (id: string) => { console.log("Delete clicked in AdminUsers"); console.log("User id:", id);
    if (deleteConfirmText !== 'DELETE') return;
    try {
      console.log("Sending delete request to API for user", id); await api.delete(`/admin/users/${id}`); console.log("API request successful");
      fetchUsers();
      setDeletingUser(null);
      setDeleteConfirmText('');
    } catch (error) {
      alert(error?.message || 'Failed to delete user');
    }
  };
  
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { email: newAdminEmail, full_name: newAdminName, password: newAdminPassword });
      setShowAddAdmin(false);
      setNewAdminEmail('');
      setNewAdminName('');
      setNewAdminPassword('');
      fetchUsers();
    } catch (error) {
      alert('Failed to create admin');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
        <button onClick={() => setShowAddAdmin(true)} className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700">
          <Shield className="w-4 h-4 mr-2" /> Create Admin
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="buyer">Buyer</option>
            <option value="seller">Seller</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User Info</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
                          {user.full_name?.charAt(0) || user.email?.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.full_name || 'N/A'}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'seller' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'deleted' ? 'bg-red-100 text-red-800' : 
                        user.status === 'suspended' ? 'bg-amber-100 text-amber-800' : 
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setEditingUser(user)} className="text-emerald-600 hover:text-emerald-900 mr-3">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => { setDeletingUser(user); setDeleteConfirmText(''); }} className="text-red-600 hover:text-red-900" disabled={user.id === currentUser?.id}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Role</label>
                <select 
                  value={editingUser.role} 
                  onChange={(e) => handleUpdateRole(editingUser.id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Status</label>
                <select 
                  value={editingUser.status || 'active'} 
                  onChange={(e) => handleUpdateStatus(editingUser.id, e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deleted">Deleted (Soft)</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingUser && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertTriangle className="h-6 w-6" />
              <h2 className="text-xl font-bold">Delete User</h2>
            </div>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete {deletingUser.email}? This action will soft-delete the user to preserve historical order records.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full border-slate-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="DELETE"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setDeletingUser(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteUser(deletingUser.id)} 
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Admin Modal */}
      {showAddAdmin && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create Admin</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input required type="text" value={newAdminName} onChange={e => setNewAdminName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input required type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <input required type="password" value={newAdminPassword} onChange={e => setNewAdminPassword(e.target.value)} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setShowAddAdmin(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
