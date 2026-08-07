import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

imports = """
import { SellerRegister } from './pages/auth/SellerRegister';
import { SellerLogin } from './pages/auth/SellerLogin';
"""

content = content.replace("import { Unauthorized } from './pages/auth/Unauthorized';", "import { Unauthorized } from './pages/auth/Unauthorized';\n" + imports)

routes = """
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
        <Route path="/seller/login" element={user ? <Navigate to="/" replace /> : <SellerLogin />} />
        <Route path="/seller/register" element={user ? <Navigate to="/" replace /> : <SellerRegister />} />
"""

content = re.sub(r'<Route path="/login"[^>]+>\s*<Route path="/register"[^>]+>', routes.strip(), content)

with open('src/App.tsx', 'w') as f:
    f.write(content)
