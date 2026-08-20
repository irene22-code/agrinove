const fs = require('fs');

const templates = {
  PeriodsManager: `
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
        await api.put(\`/admin/crop-calendar/periods/\${editingItem.id}\`, payload);
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
      await api.delete(\`/admin/crop-calendar/periods/\${id}\`);
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
`,

RecommendationsManager: `
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
        await api.put(\`/admin/crop-calendar/recommendations/\${editingItem.id}\`, payload);
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
      await api.delete(\`/admin/crop-calendar/recommendations/\${id}\`);
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
`,

ActivitiesManager: `
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
        await api.put(\`/admin/crop-calendar/activities/\${editingItem.id}\`, payload);
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
      await api.delete(\`/admin/crop-calendar/activities/\${id}\`);
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
`,

BeforePlantingManager: `
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function BeforePlantingManager() {
  const [items, setItems] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    message: '', recommendation: '', crop_id: '', district_id: '', active_period: '', status: 'published'
  });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => { 
    fetchItems(); 
    api.get('/admin/crop-calendar/crops').then((res: any) => setCrops(res));
    api.get('/crop-calendar/districts').then((res: any) => setDistricts(res));
  }, []);

  const fetchItems = async () => {
    try {
      const data = await api.get<any[]>('/admin/crop-calendar/before-planting');
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        message: item.message || '', recommendation: item.recommendation || '',
        crop_id: item.crop_id || '', district_id: item.district_id || '', 
        active_period: item.active_period || '', status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setFormData({ message: '', recommendation: '', crop_id: '', district_id: '', active_period: '', status: 'published' });
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
      if (payload.active_period === '') payload.active_period = null;

      if (editingItem) {
        await api.put(\`/admin/crop-calendar/before-planting/\${editingItem.id}\`, payload);
      } else {
        await api.post('/admin/crop-calendar/before-planting', payload);
      }
      fetchItems();
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(\`/admin/crop-calendar/before-planting/\${id}\`);
      fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Before You Plant Advices</h2>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus size={18} className="mr-2" /> Add Advice
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left">Context</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={3} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.message}</td>
                <td className="px-4 py-3">
                  Crop: {item.crop_calendar_crops?.name || 'All'} | Dist: {item.crop_calendar_districts?.name || 'All'}
                </td>
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
              <h3 className="font-bold">{editingItem ? 'Edit Advice' : 'Add Advice'}</h3>
              <button onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={e => handleSubmit(e)} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Message</label><textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Recommendation / Action</label><textarea value={formData.recommendation} onChange={e => setFormData({...formData, recommendation: e.target.value})} className="w-full border rounded p-2" /></div>
              
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
`,

AlertsManager: `
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export function AlertsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    title: '', message: '', type: 'General', severity: 'Information', 
    crop_id: '', district_id: '', start_date: '', end_date: '', status: 'published'
  });

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => { 
    fetchItems(); 
    api.get('/admin/crop-calendar/crops').then((res: any) => setCrops(res));
    api.get('/crop-calendar/districts').then((res: any) => setDistricts(res));
  }, []);

  const fetchItems = async () => {
    try {
      const data = await api.get<any[]>('/admin/crop-calendar/alerts');
      setItems(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '', message: item.message || '', type: item.type || 'General', severity: item.severity || 'Information',
        crop_id: item.crop_id || '', district_id: item.district_id || '', 
        start_date: item.start_date ? item.start_date.split('T')[0] : '', 
        end_date: item.end_date ? item.end_date.split('T')[0] : '', 
        status: item.status || 'published'
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', message: '', type: 'General', severity: 'Information', crop_id: '', district_id: '', start_date: '', end_date: '', status: 'published' });
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
      if (payload.start_date === '') payload.start_date = null; else payload.start_date = new Date(payload.start_date).toISOString();
      if (payload.end_date === '') payload.end_date = null; else payload.end_date = new Date(payload.end_date).toISOString();

      if (editingItem) {
        await api.put(\`/admin/crop-calendar/alerts/\${editingItem.id}\`, payload);
      } else {
        await api.post('/admin/crop-calendar/alerts', payload);
      }
      fetchItems();
      handleCloseModal();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(\`/admin/crop-calendar/alerts/\${id}\`);
      fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Agriculture Alerts</h2>
        <button onClick={() => handleOpenModal()} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
          <Plus size={18} className="mr-2" /> Add Alert
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Severity</th>
              <th className="px-4 py-3 text-left">Dates</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded-full">{item.severity}</span></td>
                <td className="px-4 py-3">
                  {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'N/A'} - {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'N/A'}
                </td>
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
              <h3 className="font-bold">{editingItem ? 'Edit Alert' : 'Add Alert'}</h3>
              <button onClick={handleCloseModal}><X size={24} /></button>
            </div>
            <form onSubmit={e => handleSubmit(e)} className="p-4 space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Message</label><textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full border rounded p-2" /></div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium mb-1">Severity</label>
                    <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full border rounded p-2">
                      <option value="Information">Information</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <input type="text" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded p-2" placeholder="e.g. Weather, Pest" />
                 </div>
              </div>

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

              <div className="grid grid-cols-2 gap-4">
                 <div><label className="block text-sm font-medium mb-1">Start Date</label><input type="date" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full border rounded p-2" /></div>
                 <div><label className="block text-sm font-medium mb-1">End Date</label><input type="date" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full border rounded p-2" /></div>
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
`,

AuditLogsManager: `
import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';

export function AuditLogsManager() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => { 
    const fetchItems = async () => {
      try {
        const data = await api.get<any[]>('/admin/crop-calendar/audit-logs');
        setItems(data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchItems();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Audit Logs</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Action</th>
              <th className="px-4 py-3 text-left">Record Type</th>
              <th className="px-4 py-3 text-left">Record ID</th>
              <th className="px-4 py-3 text-left">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> : 
             items.map(item => (
              <tr key={item.id}>
                <td className="px-4 py-3 font-medium">
                   <span className={\`px-2 py-1 rounded text-xs font-medium \${item.action === 'DELETE' ? 'bg-red-100 text-red-800' : item.action === 'CREATE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}\`}>
                     {item.action}
                   </span>
                </td>
                <td className="px-4 py-3">{item.record_type}</td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono truncate max-w-[200px]">{item.record_id}</td>
                <td className="px-4 py-3">{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
`
};

for (const [name, content] of Object.entries(templates)) {
  fs.writeFileSync(`src/components/admin/crop-calendar/${name}.tsx`, content);
}
console.log("All managers created.");
