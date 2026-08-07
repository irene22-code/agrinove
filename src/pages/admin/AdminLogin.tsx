import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await api.post<{ success: boolean; data: any }>(
        "/auth/login",
        { email, password },
      );

      if (res.success && res.data.session) {
        const token = res.data.session.access_token;
        localStorage.setItem("agromart_token", token);

        try {
          const profileRes = await api.get<{ success: boolean; data: any }>(
            "/auth/profile",
          );
          if (profileRes.success && profileRes.data.role === "admin") {
            login(token, {
              id: profileRes.data.id,
              email: profileRes.data.email,
              full_name: profileRes.data.full_name,
              role: profileRes.data.role,
            });
            navigate("/admin");
          } else {
            setError("Access Denied: You must be an administrator.");
            localStorage.removeItem("agromart_token");
          }
        } catch (profileErr) {
          setError("Failed to fetch user profile.");
          localStorage.removeItem("agromart_token");
        }
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Sign in to manage AgroMart
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 placeholder-slate-400 text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Admin Email Address"
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
                className="appearance-none relative block w-full px-3 py-3 border border-slate-600 bg-slate-700 placeholder-slate-400 text-white rounded-md focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-slate-900 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Authenticating..." : "Sign In as Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
