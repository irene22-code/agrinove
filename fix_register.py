with open('src/pages/auth/Register.tsx', 'r') as f:
    content = f.read()

# Replace the state and role references
content = content.replace("const [role, setRole] = useState<'buyer' | 'seller'>('buyer');", "")
content = content.replace("const endpoint = role === 'buyer' ? '/auth/register/buyer' : '/auth/register/seller';", "const endpoint = '/auth/register/buyer';")

# Remove the role toggle buttons
buttons_block = """
        <div className="flex justify-center space-x-4 mb-4">
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm ${role === 'buyer' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            onClick={() => setRole('buyer')}
          >
            I am a Buyer
          </button>
          <button 
            className={`px-4 py-2 rounded-md font-medium text-sm ${role === 'seller' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
            onClick={() => setRole('seller')}
          >
            I am a Farmer/Seller
          </button>
        </div>
"""
content = content.replace(buttons_block, "")

# Remove the conditional business_name field
business_block = """
            {role === 'seller' && (
              <div>
                <input 
                  name="business_name" 
                  type="text" 
                  required 
                  value={formData.business_name}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-300 placeholder-slate-500 text-slate-900 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm" 
                  placeholder="Farm / Business Name" 
                />
              </div>
            )}
"""
content = content.replace(business_block, "")

with open('src/pages/auth/Register.tsx', 'w') as f:
    f.write(content)
