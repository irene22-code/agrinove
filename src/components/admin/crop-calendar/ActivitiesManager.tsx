
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function ActivitiesManager() {
  const [items, setItems] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    activity_name: '', description: '', crop_id: '', district_id: '', season_id: '', month: '', priority: 0, status: 'published'
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
      const data = await api.get<any[]>('/admin/crop-calendar/activities');
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        activity_name: item.activity_name || '', description: item.description || '',
        crop_id: item.crop_id || '', district_id: item.district_id || '', season_id: item.season_id || '',
        month: item.month || '', priority: item.priority || 0, status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        activity_name: '', description: '', crop_id: '', district_id: '', season_id: '', month: '', priority: 0, status: 'published'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.crop_id === '') payload.crop_id = null;
      if (payload.district_id === '') payload.district_id = null;
      if (payload.season_id === '') payload.season_id = null;
      if (payload.month === '') payload.month = null;

      if (editingItem) {
        await api.put(`/admin/crop-calendar/activities/${editingItem.id}`, payload);
      } else {
        await api.post('/admin/crop-calendar/activities', payload);
      }
      fetchItems();
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(`/admin/crop-calendar/activities/${id}`);
      fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Farming Activities</h2>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus size={18} className="mr-2" /> Add Activity
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Activity</th>
              <th className="px-4 py-3 text-left">Crop Context</th>
              <th className="px-4 py-3 text-left">Location/Time</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={5} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.activity_name}</td>
                <td className="px-4 py-3">{item.crop_calendar_crops?.name || 'All'}</td>
                <td className="px-4 py-3">
                  {item.crop_calendar_districts?.name || 'All'} | {item.crop_calendar_seasons?.name || 'All'} | Month: {item.month || 'All'}
                </td>
                <td className="px-4 py-3">{item.priority}</td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between p-4 border-b">
              <h3 className="font-bold">{editingItem ? 'Edit Activity' : 'Add Activity'}</h3>
              <button onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={e => handleSubmit(e)} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Activity Name</label><input type="text" required value={formData.activity_name} onChange={e => setFormData({...formData, activity_name: e.target.value})} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2" /></div>
              
              <div>
                 <label className="block text-sm font-medium mb-1">Crop (Optional)</label>
                 <select value={formData.crop_id} onChange={e => setFormData({...formData, crop_id: e.target.value})} className="w-full border rounded p-2">
                   <option value="">All Crops</option>
                   {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">District (Optional)</label>
                 <select value={formData.district_id} onChange={e => setFormData({...formData, district_id: e.target.value})} className="w-full border rounded p-2">
                   <option value="">All Districts</option>
                   {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium mb-1">Season (Optional)</label>
                 <select value={formData.season_id} onChange={e => setFormData({...formData, season_id: e.target.value})} className="w-full border rounded p-2">
                   <option value="">All Seasons</option>
                   {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
              </div>
              <div><label className="block text-sm font-medium mb-1">Month (Optional 1-12)</label><input type="number" min="1" max="12" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Priority (0-10)</label><input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border rounded p-2" /></div>

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
