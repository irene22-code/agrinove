import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export function Register() {
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = '/auth/register/buyer';
      const res = await api.post<{ success: boolean; data: any }>(endpoint, formData);
      
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
            
            if (profileRes.data.role === 'buyer') navigate('/buyer');
            else if (profileRes.data.role === 'seller') navigate('/seller');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Create an account
          </h2>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input 
                name="full_name" 
                type="text" 
                required 
                value={formData.full_name}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" 
                placeholder="Full name" 
              />
            </div>            <div>
              <input 
                name="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" 
                placeholder="Email address" 
              />
            </div>
            <div>
              <input 
                name="password" 
                type="password" 
                required 
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" 
                placeholder="Password" 
              />
            </div>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/buyer/login" className="font-medium text-emerald-600 hover:text-emerald-500">
              Already have an account? Sign in
            </Link>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
