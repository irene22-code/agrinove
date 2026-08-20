import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { Leaf } from 'lucide-react';

export function SellerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await api.post<{ success: boolean; data: any }>('/auth/login', { email, password });
      
      if (res.success && res.data.session) {
        const token = res.data.session.access_token;
        localStorage.setItem('agromart_token', token);
        
        try {
          const profileRes = await api.get<{ success: boolean; data: any }>('/auth/profile');
          if (profileRes.success) {
            if (profileRes.data.role !== 'seller') {
                setError('This account is not a seller account. Please use the buyer login.');
                localStorage.removeItem('agromart_token');
                setIsLoading(false);
                return;
            }

            login(token, {
              id: profileRes.data.id,
              email: profileRes.data.email,
              full_name: profileRes.data.full_name,
              role: profileRes.data.role
            });
            navigate('/seller');
          }
        } catch (profileErr) {
          setError('Failed to fetch user profile after login.');
          localStorage.removeItem('agromart_token');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col items-center">
          <Leaf className="h-12 w-12 text-green-600 mb-2" />
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Seller Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign in to manage your farm and products.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                placeholder="you@example.com" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" 
                placeholder="••••••••" 
              />
            </div>
          </div>
          
          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in to Seller Portal'}
            </button>
          </div>
          <div className="text-sm text-center mt-4 flex flex-col space-y-2">
            <Link to="/seller/register" className="font-medium text-green-600 hover:text-green-500">
              Don't have a seller account? Register
            </Link>
            <Link to="/buyer/login" className="font-medium text-slate-500 hover:text-slate-700">
              Not a seller? Log in as a buyer
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
