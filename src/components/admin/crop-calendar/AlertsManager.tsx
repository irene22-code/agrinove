import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Plus, Edit2, Trash2, X, ShieldAlert, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  type?: string | null;
  severity: 'Information' | 'Low' | 'Medium' | 'High' | 'Critical';
  district_id?: string | null;
  crop_id?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: 'draft' | 'published' | 'archived';
  created_at?: string;
  updated_at?: string;
  crop_calendar_crops?: { name: string } | null;
  crop_calendar_districts?: { name: string } | null;
}

export function AlertsManager() {
  const [items, setItems] = useState<AlertItem[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AlertItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'General',
    severity: 'Information' as 'Information' | 'Low' | 'Medium' | 'High' | 'Critical',
    crop_id: '',
    district_id: '',
    start_date: '',
    end_date: '',
    status: 'published' as 'draft' | 'published' | 'archived',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const alertTypes = ['General', 'Weather & Storm', 'Pest Outbreak', 'Crop Disease', 'Market Volatility', 'Flood Warning', 'Drought Alert'];

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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const data = await api.get<AlertItem[]>('/admin/crop-calendar/alerts');
      setItems(data || []);
    } catch (err: any) {
      console.error('Failed to fetch Alerts:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Failed to load Agriculture Alerts.',
      });
    }
  };

  const handleOpenModal = (item: AlertItem | null = null) => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        message: item.message || '',
        type: item.type || 'General',
        severity: item.severity || 'Information',
        crop_id: item.crop_id || '',
        district_id: item.district_id || '',
        start_date: item.start_date ? item.start_date.substring(0, 10) : '',
        end_date: item.end_date ? item.end_date.substring(0, 10) : '',
        status: item.status || 'published',
      });
    } else {
      setEditingItem(null);
      // Default dates to today and 7 days ahead
      const today = new Date().toISOString().substring(0, 10);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
      setFormData({
        title: '',
        message: '',
        type: 'General',
        severity: 'Information',
        crop_id: '',
        district_id: '',
        start_date: today,
        end_date: nextWeek,
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

    if (!formData.title.trim()) {
      setFormError('Alert title is required.');
      return;
    }

    if (!formData.message.trim()) {
      setFormError('Alert message is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Record<string, any> = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type.trim() || 'General',
        severity: formData.severity,
        crop_id: formData.crop_id || null,
        district_id: formData.district_id || null,
        start_date: formData.start_date ? new Date(formData.start_date + 'T00:00:00.000Z').toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date + 'T23:59:59.999Z').toISOString() : null,
        status: targetStatus,
      };

      if (editingItem) {
        await api.put(`/admin/crop-calendar/alerts/${editingItem.id}`, payload);
        setFeedbackMessage({
          type: 'success',
          text: `Successfully updated alert "${formData.title}" (${targetStatus})`,
        });
      } else {
        await api.post('/admin/crop-calendar/alerts', payload);
        setFeedbackMessage({
          type: 'success',
          text: `Successfully created and ${targetStatus === 'published' ? 'published' : 'saved draft'} alert.`,
        });
      }

      await fetchItems();
      handleCloseModal();
    } catch (err: any) {
      console.error('Error saving Alert:', err);
      setFormError(err?.message || 'Failed to save alert. Check network or server logs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: AlertItem) => {
    const nextStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await api.put(`/admin/crop-calendar/alerts/${item.id}`, {
        status: nextStatus,
      });
      setFeedbackMessage({
        type: 'success',
        text: `Alert status updated to ${nextStatus}.`,
      });
      await fetchItems();
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Failed to toggle alert status.',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirmText.trim() !== 'DELETE') return;
    try {
      await api.delete(`/admin/crop-calendar/alerts/${id}`);
      setFeedbackMessage({
        type: 'success',
        text: 'Alert deleted successfully.',
      });
      await fetchItems();
      setItemToDelete(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      console.error('Error deleting Alert:', err);
      setFeedbackMessage({
        type: 'error',
        text: err?.message || 'Failed to delete alert.',
      });
    }
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ShieldAlert className="text-red-500 mr-2" size={22} />
            Agriculture Alerts Management
          </h2>
          <p className="text-sm text-gray-500">Broadcast weather warnings, pest attacks, and critical agricultural notices to farmers.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={18} className="mr-2" /> Add Alert
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
                <th className="px-4 py-3">Alert Title & Type</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Scope & Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    Loading alerts...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No agriculture alerts found. Click <strong>Add Alert</strong> to broadcast a warning.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 align-top">
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      {item.type && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {item.type}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top max-w-xs">
                      <p className="text-gray-800 line-clamp-2 text-xs leading-relaxed">{item.message}</p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top text-xs text-gray-600 space-y-1">
                      <div>
                        <span className="text-gray-400">Target:</span>{' '}
                        <strong className="text-gray-800">
                          {item.crop_calendar_districts?.name || 'All Districts'}, {item.crop_calendar_crops?.name || 'All Crops'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-gray-400">Active:</span>{' '}
                        <span className="text-gray-700">
                          {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Immediate'} → {item.end_date ? new Date(item.end_date).toLocaleDateString() : 'Indefinite'}
                        </span>
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
                {editingItem ? 'Edit Agriculture Alert' : 'Broadcast Agriculture Alert'}
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

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Alert Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Heavy Rains Warning in Northern Province"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              {/* Severity & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Severity Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white font-medium"
                  >
                    <option value="Information">Information (Blue)</option>
                    <option value="Low">Low (Green / Light Blue)</option>
                    <option value="Medium">Medium (Yellow / Amber)</option>
                    <option value="High">High (Orange)</option>
                    <option value="Critical">Critical (Red Emergency)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Alert Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  >
                    {alertTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Alert Message & Guidelines <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Explain the hazard, potential impact, and preventive guidance for farmers..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                />
              </div>

              {/* Context Scope */}
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Scope & Applicability (Leave empty to apply to all)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">District (Optional)</label>
                    <select
                      value={formData.district_id}
                      onChange={(e) => setFormData({ ...formData, district_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">All Districts (Countrywide)</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Crop (Optional)</label>
                    <select
                      value={formData.crop_id}
                      onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">All Crops (General)</option>
                      {crops.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Status
                </label>
                <div className="flex space-x-4">
                  {(['published', 'draft', 'archived'] as const).map((st) => (
                    <label key={st} className="flex items-center text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="alert_status"
                        value={st}
                        checked={formData.status === st}
                        onChange={() => setFormData({ ...formData, status: st })}
                        className="mr-1.5 text-red-600 focus:ring-red-500"
                      />
                      <span className="capitalize">{st}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions: Cancel, Save Draft, Save & Publish */}
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
                className="px-5 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium text-sm shadow-sm transition-colors"
              >
                {isSubmitting ? 'Publishing...' : 'Save & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in duration-150">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Delete Alert</h3>
            <p className="text-gray-600 text-sm mb-4">
              This will remove this alert immediately. Please type <span className="font-mono font-bold text-red-600">DELETE</span> to confirm.
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
