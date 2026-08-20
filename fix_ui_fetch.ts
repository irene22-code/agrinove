import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

content = content.replace('const [categories, setCategories] = useState<any[]>([]);', 
`const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);`);

content = content.replace(`    product_name: '',`, `    product_id: '',\n    product_name: '',`);

content = content.replace(`        api.get<{ success: boolean; data: { markets: any[]; sources: any[] } }>('/admin/market-settings')
      ]);`, `        api.get<{ success: boolean; data: { markets: any[]; sources: any[] } }>('/admin/market-settings'),
        api.get<{ success: boolean; data: any[] }>('/admin/products')
      ]);`);

content = content.replace(`      if (catRes.success) setCategories(catRes.data || []);`, `      if (catRes.success) setCategories(catRes.data || []);\n      if (prodRes.success) setProducts(prodRes.data || []);`);

content = content.replace(`const [pricesRes, catRes, settingsRes] =`, `const [pricesRes, catRes, settingsRes, prodRes] =`);

// The product form element needs to change from input to select
content = content.replace(`                  <input
                    required
                    type="text"
                    placeholder="e.g. Tomatoes"
                    value={formData.product_name}
                    onChange={e => setFormData({...formData, product_name: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border"
                  />`, `                  <select
                    required
                    value={formData.product_id}
                    onChange={e => {
                        const selectedProduct = products.find(p => p.id === e.target.value);
                        setFormData({...formData, product_id: e.target.value, product_name: selectedProduct?.title || '', category_id: selectedProduct?.category_id || formData.category_id});
                    }}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                  >
                    <option value="">Select Existing Product</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>`);

// Also change market and source to select if they aren't already
// Let's check them.
fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
