import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

// Replace the select input
const selectRegex = /<label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name<\/label>\s*<select[\s\S]*?<\/select>/;
const inputHtml = `<label className="block text-xs font-bold text-slate-700 uppercase mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    placeholder="Enter product name..."
                    value={formData.product_name}
                    onChange={e => setFormData({...formData, product_name: e.target.value})}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                  />`;
                  
content = content.replace(selectRegex, inputHtml);

// Replace handleSubmit
const handleSubmitOld = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploadingDoc(true);`;

const handleSubmitNew = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productNameInput = formData.product_name.trim();
      const matchedProduct = products.find(p => p.title.toLowerCase() === productNameInput.toLowerCase());
      
      if (!matchedProduct) {
        alert('Product not found. Please create this product in Products first.');
        return;
      }

      setUploadingDoc(true);`;

content = content.replace(handleSubmitOld, handleSubmitNew);

// Replace payload
const payloadOld = `      const payload = {
        ...formData,
        official_document_url: formData.has_government_document === 'yes' ? documentUrl : '',`;

const payloadNew = `      const payload = {
        ...formData,
        product_id: matchedProduct.id,
        category_id: matchedProduct.category_id || formData.category_id,
        official_document_url: formData.has_government_document === 'yes' ? documentUrl : '',`;

content = content.replace(payloadOld, payloadNew);

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
