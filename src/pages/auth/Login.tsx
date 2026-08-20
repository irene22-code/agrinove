import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

export function Login() {
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
        
        // Fetch profile to get role and full details
        // We set the token in local storage temporarily so api can use it for the next request
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
            
            if (profileRes.data.role !== 'buyer') {
                setError('This account is not a buyer account. Please use the appropriate login.');
                localStorage.removeItem('agromart_token');
                setIsLoading(false);
                return;
            }
            navigate('/buyer');
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
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Sign in to your account
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
                id="email-address" 
                name="email" 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-t-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                placeholder="Email address" 
              />
            </div>
            <div>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 rounded-b-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm" 
                placeholder="Password" 
              />
            </div>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/buyer/register" className="font-medium text-green-600 hover:text-green-500">
              Don't have an account? Sign up
            </Link>
          </div>

          <div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
