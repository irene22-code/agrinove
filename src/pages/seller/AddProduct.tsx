import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, Upload, X } from 'lucide-react';

export function AddProduct() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    price: '',
    sku: '',
    stock_quantity: '',
    brand: '',
    weight: '',
    dimensions: '',
    color: '',
    size: '',
    material: '',
    warranty: '',
    status: 'active',
    discount: '',
    tax_vat: '',
    manufacturer: '',
    country_of_origin: '',
    barcode: '',
    delivery_info: '',
    return_policy: '',
    tags: '',
    unit_of_measure: ''
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get<{ success: boolean; data: any[] }>('/categories');
        if (res.success) {
          setCategories(res.data);
          if (res.data.length > 0) {
            setFormData((prev) => ({ ...prev, category_id: res.data[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch categories");
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Create product
      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : 0,
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity, 10) : 0,
        discount: formData.discount ? parseFloat(formData.discount) : 0,
        tax_vat: formData.tax_vat ? parseFloat(formData.tax_vat) : 0,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      };

      const res = await api.post<{ success: boolean; data: any }>('/products', payload);
      
      if (res.success) {
        const productId = res.data.id;
        
        // 2. Upload images
        if (imageFiles.length > 0) {
          const imageFormData = new FormData();
          imageFiles.forEach(file => {
             imageFormData.append('images', file);
          });
          
          await api.post(`/products/${productId}/images`, imageFormData);
        }
        
        navigate('/seller/products');
      }
    } catch (err: any) {
      setError(err.message || "Failed to add product.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).slice(0, 5); // limit to 5
      setImageFiles(prev => [...prev, ...filesArray].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
        <Link to="/seller/products" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-green-600">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">1. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Product Name *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Category *</label>
              <select name="category_id" required value={formData.category_id} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm">
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Tags / Keywords (comma separated)</label>
              <input type="text" name="tags" value={formData.tags} onChange={handleChange} placeholder="organic, fresh, local" className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Product Description *</label>
              <textarea name="description" required rows={4} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">2. Pricing & Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Price ($) *</label>
              <input type="number" step="0.01" min="0" name="price" required value={formData.price} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Discount (%)</label>
              <input type="number" step="0.1" min="0" max="100" name="discount" value={formData.discount} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Tax / VAT (%)</label>
              <input type="number" step="0.1" min="0" name="tax_vat" value={formData.tax_vat} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Stock Quantity *</label>
              <input type="number" min="0" name="stock_quantity" required value={formData.stock_quantity} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Unit of Measure *</label>
              <input type="text" name="unit_of_measure" required placeholder="e.g. lb, kg, bunch" value={formData.unit_of_measure} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Product Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm">
                <option value="active">Active (Visible)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">3. Product Identifiers & Specs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="block text-sm font-medium text-slate-700">Product SKU</label><input type="text" name="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Barcode / QR Code</label><input type="text" name="barcode" value={formData.barcode} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Brand</label><input type="text" name="brand" value={formData.brand} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Weight</label><input type="text" name="weight" value={formData.weight} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Dimensions</label><input type="text" name="dimensions" value={formData.dimensions} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Color</label><input type="text" name="color" value={formData.color} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Size</label><input type="text" name="size" value={formData.size} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Material</label><input type="text" name="material" value={formData.material} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Manufacturer</label><input type="text" name="manufacturer" value={formData.manufacturer} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div><label className="block text-sm font-medium text-slate-700">Country of Origin</label><input type="text" name="country_of_origin" value={formData.country_of_origin} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
            <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700">Warranty Information</label><input type="text" name="warranty" value={formData.warranty} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" /></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">4. Logistics & Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Delivery Information</label>
              <textarea name="delivery_info" rows={3} value={formData.delivery_info} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Return Policy</label>
              <textarea name="return_policy" rows={3} value={formData.return_policy} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-md p-2 focus:ring-green-500 focus:border-green-500 sm:text-sm" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">5. Product Images</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="relative cursor-pointer bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500">
                <span>Upload Images (Max 5)</span>
                <input type="file" multiple accept="image/*" className="sr-only" onChange={handleImageChange} />
              </label>
              <span className="text-sm text-slate-500">{imageFiles.length}/5 images selected</span>
            </div>
            
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                {imageFiles.map((file, index) => (
                  <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-w-1 aspect-h-1">
                    <img src={URL.createObjectURL(file)} alt="Preview" className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {index === 0 && <span className="absolute bottom-0 left-0 right-0 bg-green-600 text-white text-[10px] text-center py-1">PRIMARY</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <Link to="/seller/products" className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 mr-3">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
            {isLoading ? "Saving..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
