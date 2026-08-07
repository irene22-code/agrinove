import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../lib/api";

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    unit_of_measure: "kg",
    stock_quantity: "",
    category_id: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get<{ success: boolean; data: any[] }>("/categories"),
          api.get<{ success: boolean; data: any }>(`/products/${id}`),
        ]);
        if (catRes.success) setCategories(catRes.data);
        if (prodRes.success && prodRes.data) {
          setFormData({
            title: prodRes.data.title,
            description: prodRes.data.description,
            price: prodRes.data.price,
            unit_of_measure: prodRes.data.unit_of_measure,
            stock_quantity: prodRes.data.stock_quantity,
            category_id: prodRes.data.category_id,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/products/${id}`, {
         ...formData,
         price: parseFloat(formData.price),
         stock_quantity: parseInt(formData.stock_quantity, 10)
      });
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        imageFormData.append('is_primary', 'true');
        await api.post(`/products/${id}/images`, imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/seller/products');
    } catch (e) {
      console.error('Failed to update product', e);
      alert('Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      navigate("/seller/products");
    } catch (e) {
      console.error("Failed to delete", e);
      alert("Failed to delete product");
    }
  };

  if (isLoading) return <div className="animate-pulse">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Edit Product</h1>
        <button
          type="button"
          onClick={handleDelete}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Delete Product
        </button>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            required
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Price ($)
            </label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Unit of Measure
            </label>
            <select
              value={formData.unit_of_measure}
              onChange={(e) =>
                setFormData({ ...formData, unit_of_measure: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            >
              <option value="kg">kg</option>
              <option value="lb">lb</option>
              <option value="piece">piece</option>
              <option value="box">box</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Stock Quantity
            </label>
            <input
              required
              type="number"
              value={formData.stock_quantity}
              onChange={(e) =>
                setFormData({ ...formData, stock_quantity: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            >
              <option value="">Select a category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">
            Note: Image uploading is currently not supported in edit mode.
            Please contact support.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/seller/products")}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
