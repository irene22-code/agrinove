const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/admin/AdminCropCalendar.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the component to include Add/Edit form and proper delete modal
content = `
import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export default function AdminCropCalendar() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    status: 'draft',
    description: ''
  });

  // Delete confirm state
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const data = await api.get<any[]>('/admin/crop-calendar/crops');
      setCrops(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (crop: any = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        name: crop.name || '',
        category: crop.category || '',
        status: crop.status || 'draft',
        description: crop.description || ''
      });
    } else {
      setEditingCrop(null);
      setFormData({
        name: '',
        category: '',
        status: 'draft',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCrop(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await api.put(\`/admin/crop-calendar/crops/\${editingCrop.id}\`, formData);
      } else {
        await api.post('/admin/crop-calendar/crops', formData);
      }
      fetchCrops();
      handleCloseModal();
    } catch (err) {
      console.error("Failed to save crop", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(\`/admin/crop-calendar/crops/\${id}\`);
      fetchCrops();
      setProductToDelete(null);
      setDeleteConfirmText('');
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crop Calendar Management</h1>
          <p className="text-gray-500">Manage planting seasons, crop recommendations, farming activities, and agricultural guidance.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
          <Plus size={18} className="mr-2" />
          Add New Crop
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : crops.length > 0 ? (
                crops.map(crop => (
                  <tr key={crop.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{crop.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={\`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full \${crop.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                        {crop.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleOpenModal(crop)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 size={16} /></button>
                      <button onClick={() => { setProductToDelete(crop.id); setDeleteConfirmText(''); }} className="text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No crops found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Delete</h3>
            <p className="text-slate-600 mb-4">Are you sure you want to delete this crop? This action cannot be undone.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Type DELETE to confirm</label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { setProductToDelete(null); setDeleteConfirmText(''); }}
                className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(productToDelete)}
                disabled={deleteConfirmText.trim() !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {editingCrop ? 'Edit Crop' : 'Add New Crop'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                  Save Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(file, content);
console.log("Updated AdminCropCalendar.tsx");
