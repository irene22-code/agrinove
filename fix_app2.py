import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '<Route path="/unauthorized" element={<Unauthorized />} />',
    '<Route path="/seller/login" element={user ? <Navigate to="/" replace /> : <SellerLogin />} />\n        <Route path="/seller/register" element={user ? <Navigate to="/" replace /> : <SellerRegister />} />\n        <Route path="/unauthorized" element={<Unauthorized />} />'
)

with open('src/App.tsx', 'w') as f:
    f.write(content)
