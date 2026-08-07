import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('agromart_token');
      if (storedToken) {
        try {
          const res = await api.get<{ success: boolean; data: any }>('/auth/profile', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.success) {
            setToken(storedToken);
            setUser({
              id: res.data.id,
              email: res.data.email,
              full_name: res.data.full_name,
              role: res.data.role
            });
          } else {
            localStorage.removeItem('agromart_token');
          }
        } catch (error) {
          console.error('Failed to authenticate session:', error);
          localStorage.removeItem('agromart_token');
        }
      }
      setIsLoading(false);
    }
    
    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('agromart_token', newToken);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error('Logout error', e);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('agromart_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
