import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Leaf, Upload } from 'lucide-react';

export function SellerRegister() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    phone_number: '',
    whatsapp_number: '',
    address: '',
    location: '',
    about: '',
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formPayload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formPayload.append(key, value);
      });
      if (profilePicture) {
        formPayload.append('profile_picture', profilePicture);
      }

      const res = await api.post<{ success: boolean; data: any }>('/auth/register/seller', formPayload);
      
      if (res.success && res.data.session) {
        const token = res.data.session.access_token;
        localStorage.setItem('agromart_token', token);
        
        try {
          const profileRes = await api.get<{ success: boolean; data: any }>('/auth/profile');
          if (profileRes.success) {
            login(token, {
              id: profileRes.data.id,
              email: profileRes.data.email,
              full_name: profileRes.data.full_name,
              role: profileRes.data.role
            });
            navigate('/seller');
          }
        } catch (profileErr) {
          setError('Failed to fetch user profile after registration.');
          localStorage.removeItem('agromart_token');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProfilePicture(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center">
          <Leaf className="h-12 w-12 text-emerald-600 mb-2" />
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Seller Registration
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Join as a farmer or vendor to start selling.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 flex flex-col items-center justify-center">
                <div 
                    className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center border-2 border-dashed border-emerald-300 overflow-hidden cursor-pointer hover:bg-slate-50"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {profilePicture ? (
                        <img src={URL.createObjectURL(profilePicture)} alt="Profile Preview" className="h-full w-full object-cover" />
                    ) : (
                        <div className="text-center flex flex-col items-center text-emerald-600">
                            <Upload className="h-6 w-6" />
                            <span className="text-xs mt-1 font-medium">Upload</span>
                        </div>
                    )}
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                />
                <p className="mt-2 text-xs text-slate-500">Profile Picture (Optional)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name *</label>
              <input 
                name="full_name" 
                type="text" 
                required 
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Farm / Business Name *</label>
              <input 
                name="business_name" 
                type="text" 
                required 
                value={formData.business_name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone Number *</label>
              <input 
                name="phone_number" 
                type="tel" 
                required 
                value={formData.phone_number}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">WhatsApp Number</label>
              <input 
                name="whatsapp_number" 
                type="tel" 
                value={formData.whatsapp_number}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Farm Address *</label>
              <input 
                name="address" 
                type="text" 
                required 
                value={formData.address}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Location (City / District) *</label>
              <input 
                name="location" 
                type="text" 
                required 
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address *</label>
              <input 
                name="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password *</label>
              <input 
                name="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">About the Farmer</label>
              <textarea 
                name="about" 
                rows={3}
                value={formData.about}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
                placeholder="Tell buyers about yourself and your farming practices..."
              />
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Creating account...' : 'Create Seller Account'}
            </button>
          </div>
          <div className="text-sm text-center mt-4 flex flex-col space-y-2">
            <Link to="/seller/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Already have a seller account? Log in
            </Link>
            <Link to="/buyer/register" className="font-medium text-slate-500 hover:text-slate-700">
              Not a seller? Register as a buyer
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
