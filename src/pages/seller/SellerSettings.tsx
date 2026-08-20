import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export function SellerSettings() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone_number: '',
    business_name: '',
    business_description: '',
    address: '',
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get<{ success: boolean; data: any }>('/auth/profile');
        if (res.success && res.data) {
          setProfile(res.data);
          setFormData({
            full_name: res.data.full_name || '',
            phone_number: res.data.seller?.phone_number || '',
            business_name: res.data.seller?.business_name || '',
            business_description: res.data.seller?.business_description || '',
            address: res.data.seller?.address || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    }
    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.put<{success: boolean}>('/seller/profile', formData);
      if (res.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update profile', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Store Settings</h1>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Edit Store Profile
          </button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Business/Farm Name</label>
                <input 
                  type="text" 
                  value={formData.business_name}
                  onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  disabled={!isEditing}
                  required
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone_number}
                  onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                  disabled={!isEditing}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Description</label>
                <textarea 
                  value={formData.business_description}
                  onChange={(e) => setFormData({...formData, business_description: e.target.value})}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Tell buyers about your farm and practices..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-green-500 focus:border-green-500 disabled:bg-slate-50 disabled:text-slate-500"
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
