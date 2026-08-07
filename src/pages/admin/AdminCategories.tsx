import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Tags, Edit, Trash2, Plus, X } from 'lucide-react';

export function AdminCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get<{ success: boolean; data: any[] }>('/admin/categories');
      if (res.success) {
        setCategories(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        image_url: category.image_url || '',
        parent_id: category.parent_id || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', image_url: '', parent_id: '' });
    }
    setSelectedImage(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const payload = { ...formData, parent_id: formData.parent_id || null };
      let categoryId = editingCategory?.id;
      
      if (editingCategory) {
        await api.put(`/admin/categories/${categoryId}`, payload);
      } else {
        const res = await api.post<{success: boolean, data: any}>('/admin/categories', payload);
        categoryId = res.data?.id || res.data?.[0]?.id;
      }
      
      if (selectedImage && categoryId) {
         const imageFormData = new FormData();
         imageFormData.append('image', selectedImage);
         await api.post(`/admin/categories/${categoryId}/image`, imageFormData);
      }
      
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('Failed to save category');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText !== 'DELETE') return;
    try {
      const res = await api.delete<{success: boolean, error?: string}>(`/admin/categories/${id}`);
      if (res.success) {
        fetchCategories();
        setCategoryToDelete(null);
        setDeleteConfirmText('');
      } else {
        alert(res.error || 'Failed to delete category');
      }
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Manage Categories</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" /> Add Category
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div></div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg shadow-sm border border-slate-200">
          <Tags className="mx-auto h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No categories found</h3>
        </div>
      ) : (
        <div className="bg-white shadow-sm rounded-lg border border-slate-200 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Parent</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Created</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {categories.map((category) => {
                const parent = categories.find(c => c.id === category.parent_id);
                return (
                <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded flex items-center justify-center overflow-hidden">
                        {category.image_url ? (
                          <img src={category.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <Tags className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900">{category.name}</div>
                        <div className="text-xs text-slate-500">/{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">{parent?.name || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                       <button onClick={() => handleOpenModal(category)} className="text-slate-400 hover:text-emerald-600 transition-colors" title="Edit">
                           <Edit className="h-5 w-5" />
                       </button>
                       <button onClick={() => { setCategoryToDelete(category.id); setDeleteConfirmText(''); }} className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                           <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      )}

      {categoryToDelete && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-red-600">Delete Category</h2>
            <p className="text-slate-600 mb-4">
              Are you sure you want to delete this category? This is a destructive action.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full border-slate-300 rounded-md focus:ring-red-500 focus:border-red-500"
                placeholder="DELETE"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setCategoryToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                Cancel
              </button>
              <button 
                onClick={() => handleDelete(categoryToDelete)} 
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleCloseModal}>
              <div className="absolute inset-0 bg-slate-900/75"></div>
            </div>
            <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-slate-900">{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
                <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-500"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                  <input type="text" required value={formData.name} onChange={e => {
                      setFormData({...formData, name: e.target.value, slug: !editingCategory ? e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : formData.slug})
                  }} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug *</label>
                  <input type="text" required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Category</label>
                  <select value={formData.parent_id} onChange={e => setFormData({...formData, parent_id: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value="">None (Top Level)</option>
                    {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={3}></textarea>
                </div>
                                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Image</label>
                  {formData.image_url && !selectedImage && (
                    <div className="mb-2 h-20 w-20 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                       <img src={formData.image_url} alt="Current" className="h-full w-full object-cover" />
                    </div>
                  )}
                  {selectedImage && (
                    <div className="mb-2 text-sm text-emerald-600 font-medium">Selected: {selectedImage.name}</div>
                  )}
                  <input 
                    type="file" 
                    accept="image/jpeg, image/png, image/webp" 
                    onChange={e => setSelectedImage(e.target.files?.[0] || null)} 
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                  />
                  {isUploading && <p className="text-sm text-slate-500 mt-2">Uploading image...</p>}
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Cancel</button>
                  <button type="submit" disabled={isUploading} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md hover:bg-emerald-700 disabled:opacity-50">{isUploading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
