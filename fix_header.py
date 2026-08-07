with open('src/components/layout/Header.tsx', 'r') as f:
    content = f.read()

replacement = """              <div className="flex items-center space-x-3">
                <Link to="/seller/login" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors mr-2">
                  Seller Portal
                </Link>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Log in
                </Link>
              </div>"""

content = content.replace("""              <div className="flex items-center space-x-3">
                <Link to="/seller/login" className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors mr-2">
                  Seller Portal
                </Link>
                <Link to="/login" className="text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors">
                  Sign up
                </Link>
              </div>""", replacement)

with open('src/components/layout/Header.tsx', 'w') as f:
    f.write(content)
