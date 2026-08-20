import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface BeforePlantingItem {
  id: string;
  title?: string | null;
  category?: string | null;
  message: string;
  recommendation?: string | null;
  crop_id?: string | null;
  district_id?: string | null;
  season_id?: string | null;
  active_period?: number | null;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  crop_calendar_crops?: { name: string } | null;
  crop_calendar_districts?: { name: string } | null;
  crop_calendar_seasons?: { name: string } | null;
}

export function BeforePlantingManager() {
  const [items, setItems] = useState<BeforePlantingItem[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BeforePlantingItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    message: '',
    recommendation: '',
    crop_id: '',
    district_id: '',
    season_id: '',
    active_period: '',
    status: 'published' as 'draft' | 'published' | 'archived',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const months = [
    { value: '', label: 'All Months' },
    { value: '1', label: 'January (1)' },
    { value: '2', label: 'February (2)' },
    { value: '3', label: 'March (3)' },
    { value: '4', label: 'April (4)' },
    { value: '5', label: 'May (5)' },
    { value: '6', label: 'June (6)' },
    { value: '7', label: 'July (7)' },
    { value: '8', label: 'August (8)' },
    { value: '9', label: 'September (9)' },
    { value: '10', label: 'October (10)' },
    { value: '11', label: 'November (11)' },
    { value: '12', label: 'December (12)' },
  ];

  const categories = [
    'General Preparation',
    'Soil & Land Preparation',
    'Seeds & Seedlings',
    'Water & Irrigation',
    'Fertilizers & Inputs',
    'Pest & Disease Prevention',
    'Weather & Timing',
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchItems(),
        api.get<any[]>('/admin/crop-calendar/crops').then((res) => setCrops(res || [])).catch(() => setCrops([])),
        api.get<any[]>('/crop-calendar/districts').then((res) => setDistricts(res || [])).catch(() => setDistricts([])),
        api.get<any[]>('/crop-calendar/seasons').then((res) => setSeasons(res || [])).catch(() => setSeasons([])),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await api.get<BeforePlantingItem[]>('/admin/crop-calendar/before-planting');
      setItems(data || []);
    } catch (err: any) {
      console.error('Failed to fetch Before You Plant items:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Failed to load Before You Plant records.',
      });
    }
  };

  const handleOpenModal = (item: BeforePlantingItem | null = null) => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        category: item.category || '',
        message: item.message || '',
        recommendation: item.recommendation || '',
        crop_id: item.crop_id || '',
        district_id: item.district_id || '',
        season_id: item.season_id || '',
        active_period: item.active_period ? String(item.active_period) : '',
        status: item.status || 'published',
      });
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        category: '',
        message: '',
        recommendation: '',
        crop_id: '',
        district_id: '',
        season_id: '',
        active_period: '',
        status: 'published',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormError(null);
  };

  const handleSave = async (targetStatus: 'draft' | 'published') => {
    setFormError(null);

    if (!formData.message.trim() && !formData.title.trim()) {
      setFormError('Please enter either a Message or a Title.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title: formData.title.trim() || null,
        category: formData.category.trim() || null,
        message: formData.message.trim(),
        recommendation: formData.recommendation.trim() || null,
        crop_id: formData.crop_id || null,
        district_id: formData.district_id || null,
        season_id: formData.season_id || null,
        active_period: formData.active_period ? parseInt(formData.active_period, 10) : null,
        status: targetStatus,
      };

      if (editingItem) {
        await api.put(`/admin/crop-calendar/before-planting/${editingItem.id}`, payload);
        setFeedbackMessage({
          type: 'success',
          text: `Successfully updated advice "${formData.title || formData.message.substring(0, 30)}..." (${targetStatus})`,
        });
      } else {
        await api.post('/admin/crop-calendar/before-planting', payload);
        setFeedbackMessage({
          type: 'success',
          text: `Successfully created and ${targetStatus === 'published' ? 'published' : 'saved draft'} advice.`,
        });
      }

      await fetchItems();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving Before You Plant advice:', err);
      setFormError(err?.message || 'Failed to save record. Check network or server logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: BeforePlantingItem) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/admin/crop-calendar/before-planting/${item.id}`, {
        status: nextStatus,
      });
      setFeedbackMessage({
        type: 'success',
        text: `Status changed to ${nextStatus}.`,
      });
      await fetchItems();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Failed to toggle status.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(`/admin/crop-calendar/before-planting/${id}`);
      setFeedbackMessage({
        type: 'success',
        text: 'Record deleted successfully.',
      });
      await fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      console.error('Error deleting Before You Plant record:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Failed to delete record.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Before You Plant Management</h2>
          <p className="text-sm text-gray-500">Manage pre-planting recommendations, soil preparation, and advisories.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" /> Add Advice
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-lg flex items-start justify-between ${
            feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <div className="flex items-center">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle size={20} className="mr-2 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={20} className="mr-2 text-red-600 shrink-0" />
            )}
            <span className="text-sm font-medium">{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-gray-400 hover:text-gray-600 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Title & Category</th>
                <th className="px-4 py-3">Message & Recommendation</th>
                <th className="px-4 py-3">Context Scope</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    Loading records...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No Before You Plant records found. Click <strong>Add Advice</strong> to create one.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-gray-900">{item.title || 'Untitled Advice'}</div>
                      {item.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.category}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top max-w-xs">
                      <p className="text-gray-900 font-medium line-clamp-2">{item.message}</p>
                      {item.recommendation && (
                        <p className="text-xs text-emerald-700 mt-1 line-clamp-2 bg-emerald-50/60 p-1 rounded border border-emerald-100">
                          <strong>Action:</strong> {item.recommendation}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="text-gray-400">Crop:</span>{' '}
                        <strong className="text-gray-800">{item.crop_calendar_crops?.name || 'All Crops'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">District:</span>{' '}
                        <strong className="text-gray-800">{item.crop_calendar_districts?.name || 'All Districts'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Season:</span>{' '}
                        <strong className="text-gray-800">{item.crop_calendar_seasons?.name || 'All Seasons'}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Month:</span>{' '}
                        <strong className="text-gray-800">
                          {item.active_period ? months.find((m) => m.value === String(item.active_period))?.label || item.active_period : 'All Months'}
                        </strong>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : item.status === 'draft'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(item)}
                        title={item.status === 'published' ? 'Unpublish (Switch to Draft)' : 'Publish'}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 rounded hover:bg-gray-100 transition-colors inline-flex"
                      >
                        {item.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleOpenModal(item)}
                        title="Edit"
                        className="p-1.5 text-indigo-600 hover:text-indigo-800 rounded hover:bg-indigo-50 transition-colors inline-flex"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setItemToDelete(item.id);
                          setDeleteConfirmText('');
                        }}
                        title="Delete"
                        className="p-1.5 text-red-600 hover:text-red-800 rounded hover:bg-red-50 transition-colors inline-flex"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-lg text-gray-900">
                {editingItem ? 'Edit Before You Plant Advice' : 'Add Before You Plant Advice'}
              </h3>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start border border-red-200">
                  <AlertCircle size={18} className="mr-2 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Title / Advisory Name
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Soil Moisture Check"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                  >
                    <option value="">Select Category (Optional)</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message / Info */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Message / Information <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe the condition, checklist or warning before planting..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Recommendation */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Recommended Action (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.recommendation}
                  onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                  placeholder="Actionable steps the farmer should take..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Context Filters */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Scope & Context (Leave empty to apply globally)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Crop (Optional)</label>
                    <select
                      value={formData.crop_id}
                      onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">All Crops (Global)</option>
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District (Optional)</label>
                    <select
                      value={formData.district_id}
                      onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">All Districts (National)</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Season (Optional)</label>
                    <select
                      value={formData.season_id}
                      onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">All Seasons</option>
                      {seasons.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.code || s.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Active Month (Optional)</label>
                    <select
                      value={formData.active_period}
                      onChange={(e) => setFormData({ ...formData, active_period: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      {months.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  {(['published', 'draft', 'archived'] as const).map((st) => (
                    <label key={st} className="flex items-center text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={st}
                        checked={formData.status === st}
                        onChange={() => setFormData({ ...formData, status: st })}
                        className="mr-1.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="capitalize">{st}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons: Cancel, Save Draft, Save & Publish */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('draft')}
                className="px-4 py-2 border border-amber-400 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg font-medium text-sm transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSave('published')}
                className="px-5 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-medium text-sm shadow-sm transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (React modal, no window.confirm) */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in duration-150">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 text-sm mb-4">
              This action cannot be undone. Please type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm removal of this advice.
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 text-sm font-mono focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              placeholder="DELETE"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(itemToDelete)}
                disabled={deleteConfirmText.trim() !== 'DELETE'}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
