
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function RecommendationsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    crop_id: '', district_id: '', season_id: '', month: 1, recommendation: 'GOOD_TO_PLANT', status: 'published'
  });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => { 
    fetchItems(); 
    api.get('/admin/crop-calendar/crops').then((res: any) => setCrops(res));
    api.get('/crop-calendar/districts').then((res: any) => setDistricts(res));
    api.get('/admin/crop-calendar/seasons').then((res: any) => setSeasons(res));
  }, []);

  const fetchItems = async () => {
    try {
      const data = await api.get<any[]>('/admin/crop-calendar/recommendations');
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        crop_id: item.crop_id || '', district_id: item.district_id || '', season_id: item.season_id || '',
        month: item.month || 1, recommendation: item.recommendation || 'GOOD_TO_PLANT', status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        crop_id: crops[0]?.id || '', district_id: districts[0]?.id || '', season_id: seasons[0]?.id || '',
        month: 1, recommendation: 'GOOD_TO_PLANT', status: 'published'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (editingItem) {
        await api.put(`/admin/crop-calendar/recommendations/${editingItem.id}`, payload);
      } else {
        await api.post('/admin/crop-calendar/recommendations', payload);
      }
      fetchItems();
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(`/admin/crop-calendar/recommendations/${id}`);
      fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">What to Plant Now Recommendations</h2>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus size={18} className="mr-2" /> Add Recommendation
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Crop</th>
              <th className="px-4 py-3 text-left">District</th>
              <th className="px-4 py-3 text-left">Season</th>
              <th className="px-4 py-3 text-left">Month</th>
              <th className="px-4 py-3 text-left">Recommendation</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.crop_calendar_crops?.name}</td>
                <td className="px-4 py-3">{item.crop_calendar_districts?.name}</td>
                <td className="px-4 py-3">{item.crop_calendar_seasons?.name}</td>
                <td className="px-4 py-3">{item.month}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded-full">{item.recommendation}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => handleOpenModal(item)} className="text-indigo-600 mr-3"><Edit2 size={16} /></button>
                  <button onClick={() => { setItemToDelete(item.id); setDeleteConfirmText(''); }} className="text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex justify-between p-4 border-b">
              <h3 className="font-bold">{editingItem ? 'Edit Recommendation' : 'Add Recommendation'}</h3>
              <button onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={e => handleSubmit(e)} className="p-4 space-y-4">
              <div>
                 <label className="block text-sm font-medium mb-1">Crop</label>
                 <select required value={formData.crop_id} onChange={e => setFormData({...formData, crop_id: e.target.value})} className="w-full border rounded p-2">
                   <option value="">Select Crop...</option>
                   {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">District</label>
                 <select required value={formData.district_id} onChange={e => setFormData({...formData, district_id: e.target.value})} className="w-full border rounded p-2">
                   <option value="">Select District...</option>
                   {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Season</label>
                 <select required value={formData.season_id} onChange={e => setFormData({...formData, season_id: e.target.value})} className="w-full border rounded p-2">
                   <option value="">Select Season...</option>
                   {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Month (1-12)</label>
                 <input type="number" min="1" max="12" required value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full border rounded p-2" />
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Recommendation Status</label>
                 <select required value={formData.recommendation} onChange={e => setFormData({...formData, recommendation: e.target.value})} className="w-full border rounded p-2">
                   <option value="GOOD_TO_PLANT">Good to Plant</option>
                   <option value="POSSIBLE">Possible</option>
                   <option value="NOT_RECOMMENDED">Not Recommended</option>
                   <option value="COMING_SOON">Coming Soon</option>
                 </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
              </div>
            </form>
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
