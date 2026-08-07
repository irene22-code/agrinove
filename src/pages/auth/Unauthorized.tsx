import { Link } from 'react-router-dom';

export function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8">
        <h2 className="mt-6 text-3xl font-extrabold text-slate-900">
          Unauthorized Access
        </h2>
        <p className="text-slate-600">
          You do not have permission to view this page.
        </p>
        <Link to="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
