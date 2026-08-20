import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Check, X, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';

const lookupTabs = [
    { key: 'types', label: 'Problem Types' },
    { key: 'categories', label: 'Categories' },
    { key: 'crops', label: 'Crops' },
    { key: 'parts', label: 'Affected Parts' },
    { key: 'riskLevels', label: 'Risk Levels' },
    { key: 'seasons', label: 'Seasons' },
    { key: 'causeTypes', label: 'Cause Types' },
    { key: 'spreadMethods', label: 'Spread Methods' }
];

const AdminPlantHealthSettings = () => {
    const [activeTab, setActiveTab] = useState('types');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editActive, setEditActive] = useState(true);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab]);

    const fetchData = async (type: string) => {
        setLoading(true);
        try {
            const res = await api.get('/admin/plant-health/lookups/data/' + type);
            setData(res as any);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;
        try {
            await api.post('/admin/plant-health/lookups/data/' + activeTab, { name: newName });
            setNewName('');
            fetchData(activeTab);
        } catch (err) {
            alert('Failed to add');
        }
    };

    const handleSaveEdit = async (id: string) => {
        try {
            await api.put('/admin/plant-health/lookups/data/' + activeTab + '/' + id, { name: editName, is_active: editActive });
            setEditingId(null);
            fetchData(activeTab);
        } catch (err) {
            alert('Failed to update');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this? If it's used, it will be deactivated instead.")) return;
        try {
            const res = await api.delete('/admin/plant-health/lookups/data/' + activeTab + '/' + id);
            if ((res as any).message) alert((res as any).message);
            fetchData(activeTab);
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const toggleStatus = async (item: any) => {
        try {
            await api.put('/admin/plant-health/lookups/data/' + activeTab + '/' + item.id, { name: item.name, is_active: !item.is_active });
            fetchData(activeTab);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Plant Health Settings</h1>
            
            <div className="flex flex-wrap gap-2 mb-6 border-b pb-2">
                {lookupTabs.map(t => (
                    <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${activeTab === t.key ? 'bg-emerald-100 text-emerald-700 border-b-2 border-emerald-500' : 'text-slate-600 hover:bg-slate-100'}`}>
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex gap-4 mb-6">
                    <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Add new..." className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-emerald-500" />
                    <button onClick={handleAdd} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex items-center hover:bg-emerald-700"><Plus className="w-5 h-5 mr-1" /> Add</button>
                </div>

                {loading ? <div className="text-center py-10 text-slate-500">Loading...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b bg-slate-50">
                                    <th className="p-3 font-medium text-slate-600">Name</th>
                                    <th className="p-3 font-medium text-slate-600">Status</th>
                                    <th className="p-3 font-medium text-slate-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-slate-50">
                                        <td className="p-3">
                                            {editingId === item.id ? (
                                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="border rounded p-1 w-full" />
                                            ) : (
                                                <span className={item.is_active ? 'text-slate-900' : 'text-slate-400 line-through'}>{item.name}</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {editingId === item.id ? (
                                                <select value={editActive ? 'true' : 'false'} onChange={e => setEditActive(e.target.value === 'true')} className="border rounded p-1">
                                                    <option value="true">Active</option>
                                                    <option value="false">Inactive</option>
                                                </select>
                                            ) : (
                                                <button onClick={() => toggleStatus(item)} className={`px-2 py-1 rounded text-xs font-bold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            {editingId === item.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSaveEdit(item.id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><Check className="w-5 h-5" /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-slate-500 hover:bg-slate-100 p-1 rounded"><X className="w-5 h-5" /></button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingId(item.id); setEditName(item.name); setEditActive(item.is_active); }} className="text-blue-500 hover:bg-blue-50 p-1 rounded"><Edit2 className="w-5 h-5" /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 className="w-5 h-5" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {data.length === 0 && (
                                    <tr><td colSpan={3} className="p-6 text-center text-slate-500">No items found</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPlantHealthSettings;
