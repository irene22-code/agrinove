
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function PeriodsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    crop_id: '', district_id: '', season_id: '',
    preparation_start: '', preparation_end: '',
    planting_start: '', planting_end: '',
    growing_start: '', growing_end: '',
    harvest_start: '', harvest_end: '', status: 'published'
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
      const data = await api.get<any[]>('/admin/crop-calendar/periods');
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        crop_id: item.crop_id || '', district_id: item.district_id || '', season_id: item.season_id || '',
        preparation_start: item.preparation_start || '', preparation_end: item.preparation_end || '',
        planting_start: item.planting_start || '', planting_end: item.planting_end || '',
        growing_start: item.growing_start || '', growing_end: item.growing_end || '',
        harvest_start: item.harvest_start || '', harvest_end: item.harvest_end || '', status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        crop_id: crops[0]?.id || '', district_id: districts[0]?.id || '', season_id: seasons[0]?.id || '',
        preparation_start: '', preparation_end: '', planting_start: '', planting_end: '',
        growing_start: '', growing_end: '', harvest_start: '', harvest_end: '', status: 'published'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setEditingItem(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      ['preparation_start', 'preparation_end', 'planting_start', 'planting_end', 'growing_start', 'growing_end', 'harvest_start', 'harvest_end'].forEach(f => {
         if (payload[f] === '') payload[f] = null;
      });

      if (editingItem) {
        await api.put(`/admin/crop-calendar/periods/${editingItem.id}`, payload);
      } else {
        await api.post('/admin/crop-calendar/periods', payload);
      }
      fetchItems();
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(`/admin/crop-calendar/periods/${id}`);
      fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Annual Calendar Periods</h2>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus size={18} className="mr-2" /> Add Period
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Crop</th>
              <th className="px-4 py-3 text-left">District</th>
              <th className="px-4 py-3 text-left">Season</th>
              <th className="px-4 py-3 text-left">Prep</th>
              <th className="px-4 py-3 text-left">Plant</th>
              <th className="px-4 py-3 text-left">Grow</th>
              <th className="px-4 py-3 text-left">Harvest</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={8} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.crop_calendar_crops?.name}</td>
                <td className="px-4 py-3">{item.crop_calendar_districts?.name}</td>
                <td className="px-4 py-3">{item.crop_calendar_seasons?.name}</td>
                <td className="px-4 py-3">{item.preparation_start}-{item.preparation_end}</td>
                <td className="px-4 py-3">{item.planting_start}-{item.planting_end}</td>
                <td className="px-4 py-3">{item.growing_start}-{item.growing_end}</td>
                <td className="px-4 py-3">{item.harvest_start}-{item.harvest_end}</td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="font-bold">{editingItem ? 'Edit Period' : 'Add Period'}</h3>
              <button onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={e => handleSubmit(e)} className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
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
              </div>

              <div className="grid grid-cols-2 gap-4 border p-4 rounded bg-gray-50">
                 <div><label className="block text-sm font-medium mb-1">Prep Start Month (1-12)</label><input type="number" min="1" max="12" value={formData.preparation_start} onChange={e => setFormData({...formData, preparation_start: e.target.value})} className="w-full border rounded p-2" /></div>
                 <div><label className="block text-sm font-medium mb-1">Prep End Month</label><input type="number" min="1" max="12" value={formData.preparation_end} onChange={e => setFormData({...formData, preparation_end: e.target.value})} className="w-full border rounded p-2" /></div>
                 
                 <div><label className="block text-sm font-medium mb-1">Plant Start Month</label><input type="number" min="1" max="12" value={formData.planting_start} onChange={e => setFormData({...formData, planting_start: e.target.value})} className="w-full border rounded p-2" /></div>
                 <div><label className="block text-sm font-medium mb-1">Plant End Month</label><input type="number" min="1" max="12" value={formData.planting_end} onChange={e => setFormData({...formData, planting_end: e.target.value})} className="w-full border rounded p-2" /></div>
                 
                 <div><label className="block text-sm font-medium mb-1">Grow Start Month</label><input type="number" min="1" max="12" value={formData.growing_start} onChange={e => setFormData({...formData, growing_start: e.target.value})} className="w-full border rounded p-2" /></div>
                 <div><label className="block text-sm font-medium mb-1">Grow End Month</label><input type="number" min="1" max="12" value={formData.growing_end} onChange={e => setFormData({...formData, growing_end: e.target.value})} className="w-full border rounded p-2" /></div>
                 
                 <div><label className="block text-sm font-medium mb-1">Harvest Start Month</label><input type="number" min="1" max="12" value={formData.harvest_start} onChange={e => setFormData({...formData, harvest_start: e.target.value})} className="w-full border rounded p-2" /></div>
                 <div><label className="block text-sm font-medium mb-1">Harvest End Month</label><input type="number" min="1" max="12" value={formData.harvest_end} onChange={e => setFormData({...formData, harvest_end: e.target.value})} className="w-full border rounded p-2" /></div>
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
