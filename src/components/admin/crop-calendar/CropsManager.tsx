import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X, Search, Image as ImageIcon } from 'lucide-react';

export function CropsManager() {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<any>({
    name: '', category: '', status: 'draft', description: '',
    image_url: '', crop_type: '', growing_duration_days: '',
    rainfall_requirement: '', water_requirement: '', soil_type: '',
    temperature_min: '', temperature_max: '', seed_information: '',
    fertilizer_information: '', disease_information: '', pest_information: '',
    harvesting_advice: '', storage_advice: '', market_advice: ''
  });

  // Delete confirm state
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => { fetchCrops(); }, []);

  const fetchCrops = async () => {
    try {
      const data = await api.get<any[]>('/admin/crop-calendar/crops');
      setCrops(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (crop: any = null) => {
    if (crop) {
      setEditingCrop(crop);
      setFormData({
        name: crop.name || '', category: crop.category || '', status: crop.status || 'draft', description: crop.description || '',
        image_url: crop.image_url || '', crop_type: crop.crop_type || '', growing_duration_days: crop.growing_duration_days || '',
        rainfall_requirement: crop.rainfall_requirement || '', water_requirement: crop.water_requirement || '', soil_type: crop.soil_type || '',
        temperature_min: crop.temperature_min || '', temperature_max: crop.temperature_max || '', seed_information: crop.seed_information || '',
        fertilizer_information: crop.fertilizer_information || '', disease_information: crop.disease_information || '', pest_information: crop.pest_information || '',
        harvesting_advice: crop.harvesting_advice || '', storage_advice: crop.storage_advice || '', market_advice: crop.market_advice || ''
      });
    } else {
      setEditingCrop(null);
      setFormData({
        name: '', category: '', status: 'draft', description: '',
        image_url: '', crop_type: '', growing_duration_days: '',
        rainfall_requirement: '', water_requirement: '', soil_type: '',
        temperature_min: '', temperature_max: '', seed_information: '',
        fertilizer_information: '', disease_information: '', pest_information: '',
        harvesting_advice: '', storage_advice: '', market_advice: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingCrop(null); };

  const handleSubmit = async (e: React.FormEvent, forceStatus?: string) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (forceStatus) payload.status = forceStatus;
      if (payload.growing_duration_days === '') payload.growing_duration_days = null;
      if (payload.temperature_min === '') payload.temperature_min = null;
      if (payload.temperature_max === '') payload.temperature_max = null;

      if (editingCrop) {
        await api.put(`/admin/crop-calendar/crops/${editingCrop.id}`, payload);
      } else {
        payload.slug = payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await api.post('/admin/crop-calendar/crops', payload);
      }
      fetchCrops();
      handleCloseModal();
    } catch (err) { console.error("Failed to save crop", err); }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(`/admin/crop-calendar/crops/${id}`);
      fetchCrops();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err) { console.error("Failed to delete", err); }
  };

  const filtered = crops.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search crops..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700">
          <Plus size={18} className="mr-2" /> Add Crop
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crop</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? <tr><td colSpan={4} className="px-6 py-4 text-center">Loading...</td></tr> : 
             filtered.map(crop => (
              <tr key={crop.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {crop.image_url ? (
                      <img src={crop.image_url} alt="" className="h-10 w-10 rounded-full object-cover mr-3" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3"><ImageIcon size={16} className="text-gray-400"/></div>
                    )}
                    <div className="font-medium text-gray-900">{crop.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{crop.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${crop.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {crop.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenModal(crop)} className="text-indigo-600 hover:text-indigo-900 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => { setItemToDelete(crop.id); setDeleteConfirmText(''); }} className="text-red-600 hover:text-red-900"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals remain mostly similar to previous structure but with all fields */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">{editingCrop ? 'Edit Crop' : 'Add New Crop'}</h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form id="cropForm" onSubmit={e => handleSubmit(e)} className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                   <h4 className="font-bold text-gray-900 border-b pb-2">Basic Information</h4>
                   <div><label className="block text-sm font-medium mb-1">Crop Name</label><input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Image URL</label><input type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Category</label><input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Crop Type</label><input type="text" value={formData.crop_type} onChange={e => setFormData({...formData, crop_type: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Description</label><textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Growing Duration (Days)</label><input type="number" value={formData.growing_duration_days} onChange={e => setFormData({...formData, growing_duration_days: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                </div>

                <div className="space-y-4">
                   <h4 className="font-bold text-gray-900 border-b pb-2">Farming Requirements</h4>
                   <div><label className="block text-sm font-medium mb-1">Rainfall Requirement</label><input type="text" value={formData.rainfall_requirement} onChange={e => setFormData({...formData, rainfall_requirement: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Water Requirement</label><input type="text" value={formData.water_requirement} onChange={e => setFormData({...formData, water_requirement: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Soil Type</label><input type="text" value={formData.soil_type} onChange={e => setFormData({...formData, soil_type: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium mb-1">Min Temp (°C)</label><input type="number" step="0.1" value={formData.temperature_min} onChange={e => setFormData({...formData, temperature_min: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                      <div><label className="block text-sm font-medium mb-1">Max Temp (°C)</label><input type="number" step="0.1" value={formData.temperature_max} onChange={e => setFormData({...formData, temperature_max: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   </div>
                   <div><label className="block text-sm font-medium mb-1">Seed Information</label><textarea rows={2} value={formData.seed_information} onChange={e => setFormData({...formData, seed_information: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Fertilizer Information</label><textarea rows={2} value={formData.fertilizer_information} onChange={e => setFormData({...formData, fertilizer_information: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                </div>
                
                <div className="space-y-4">
                   <h4 className="font-bold text-gray-900 border-b pb-2">Risk Information</h4>
                   <div><label className="block text-sm font-medium mb-1">Common Diseases</label><textarea rows={2} value={formData.disease_information} onChange={e => setFormData({...formData, disease_information: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Common Pests</label><textarea rows={2} value={formData.pest_information} onChange={e => setFormData({...formData, pest_information: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                </div>

                <div className="space-y-4">
                   <h4 className="font-bold text-gray-900 border-b pb-2">Market & Harvest</h4>
                   <div><label className="block text-sm font-medium mb-1">Harvesting Advice</label><textarea rows={2} value={formData.harvesting_advice} onChange={e => setFormData({...formData, harvesting_advice: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Storage Advice</label><textarea rows={2} value={formData.storage_advice} onChange={e => setFormData({...formData, storage_advice: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                   <div><label className="block text-sm font-medium mb-1">Market Advice</label><textarea rows={2} value={formData.market_advice} onChange={e => setFormData({...formData, market_advice: e.target.value})} className="w-full px-3 py-2 border rounded-md" /></div>
                </div>
              </div>

            </form>
            <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 sticky bottom-0 bg-white">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="button" onClick={(e) => handleSubmit(e, 'draft')} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Save as Draft</button>
                <button type="button" onClick={(e) => handleSubmit(e, 'published')} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save & Publish</button>
            </div>
          </div>
        </div>
      )}

      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">Type DELETE to confirm.</p>
            <input type="text" value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="w-full px-3 py-2 border rounded-md mb-4" placeholder="DELETE" />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setItemToDelete(null)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">Cancel</button>
              <button onClick={() => handleDelete(itemToDelete)} disabled={deleteConfirmText.trim() !== 'DELETE'} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
