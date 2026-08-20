import { useState, useEffect } from 'react';
import { Leaf, Plus, Search, Filter, Edit, Trash2, Eye, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { getAdminPlantHealth, deletePlantHealth, updatePlantHealthStatus } from '../../services/api/plantHealth';
import { Link } from 'react-router-dom';

export default function AdminPlantHealth() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [problemToDelete, setProblemToDelete] = useState<string | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    useEffect(() => {
        loadProblems();
    }, []);

    const loadProblems = async () => {
        try {
            setLoading(true);
            const data = await getAdminPlantHealth();
            setProblems(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setProblemToDelete(id);
        setDeleteConfirmText('');
    };

    const confirmDelete = async () => {
        if (!problemToDelete) return;
        if (deleteConfirmText !== 'DELETE') return;
        
        try {
            console.log("Deleting ID:", problemToDelete);
            const res = await deletePlantHealth(problemToDelete);
            console.log("Delete response:", res);
            setProblemToDelete(null);
            setDeleteConfirmText('');
            await loadProblems();
            console.log("Loaded problems after delete.");
        } catch (error) {
            console.error('Failed to delete', error);
            alert("Failed to delete: " + (error as any).message);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updatePlantHealthStatus(id, status);
            loadProblems();
        } catch (error) {
            console.error('Failed to update status', error);
        }
    };

    const filtered = problems.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const stats = {
        total: problems.length,
        published: problems.filter(p => p.status === 'Published').length,
        drafts: problems.filter(p => p.status === 'Draft').length,
        highRisk: problems.filter(p => p.risk_level === 'High' || p.risk_level === 'Critical').length
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Plant Health Management</h1>
                    <p className="text-slate-600 mt-1">Manage crop diseases, pests, and other problems.</p>
                </div>
                <div className="flex gap-4">
                    <Link to="/admin/plant-health/settings" className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors flex items-center gap-2">
                        Settings
                    </Link>
                    <Link to="/admin/plant-health/new" className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        <Plus className="h-5 w-5" /> Add Problem
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Leaf className="h-5 w-5" /></div>
                        <h3 className="font-medium text-slate-700">Total Problems</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><CheckCircle className="h-5 w-5" /></div>
                        <h3 className="font-medium text-slate-700">Published</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><Clock className="h-5 w-5" /></div>
                        <h3 className="font-medium text-slate-700">Drafts</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.drafts}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg text-red-600"><AlertTriangle className="h-5 w-5" /></div>
                        <h3 className="font-medium text-slate-700">High Risk</h3>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{stats.highRisk}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input type="text" placeholder="Search problems..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-4 font-medium text-slate-600">Problem</th>
                                <th className="p-4 font-medium text-slate-600">Type</th>
                                <th className="p-4 font-medium text-slate-600">Risk Level</th>
                                <th className="p-4 font-medium text-slate-600">Status</th>
                                <th className="p-4 font-medium text-slate-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filtered.map(problem => (
                                <tr key={problem.id} className="hover:bg-slate-50">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-slate-200 overflow-hidden">
                                                {problem.plant_health_images?.[0]?.image_url ? (
                                                    <img src={problem.plant_health_images[0].image_url} alt="" className="h-full w-full object-cover" />
                                                ) : <div className="h-full w-full bg-slate-100 flex items-center justify-center"><Leaf className="h-5 w-5 text-slate-400" /></div>}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{problem.name}</div>
                                                <div className="text-sm text-slate-500">{problem.plant_health_problem_crops?.map((c: any) => c.plant_health_crops.name).join(', ')}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-600">{problem.plant_health_problem_types?.name}</td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${problem.risk_level === 'High' || problem.risk_level === 'Critical' ? 'bg-red-100 text-red-800' : problem.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                            {problem.risk_level}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${problem.status === 'Published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                                            {problem.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <Link to={`/plant-health/${problem.slug}`} target="_blank" className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors" title="View Public"><Eye className="h-4 w-4" /></Link>
                                            <Link to={`/admin/plant-health/${problem.id}/edit`} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"><Edit className="h-4 w-4" /></Link>
                                            {problem.status === 'Published' ? (
                                                <button onClick={() => handleStatusUpdate(problem.id, 'Unpublished')} className="p-2 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors" title="Unpublish">Unpublish</button>
                                            ) : (
                                                <button onClick={() => handleStatusUpdate(problem.id, 'Published')} className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors" title="Publish">Publish</button>
                                            )}
                                            <button onClick={() => handleDelete(problem.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="h-4 w-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-500">
                                        No plant health problems found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Delete Modal */}
            {problemToDelete && (
                <div className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Plant Health Problem</h2>
                        <p className="text-slate-600 mb-4">
                            Are you sure you want to delete this problem? This will also remove associated symptoms, crops, and images. This is a destructive action.
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Type DELETE to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmText}
                                onChange={(e) => setDeleteConfirmText(e.target.value)}
                                placeholder="DELETE"
                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={() => setProblemToDelete(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md">
                                Cancel
                            </button>
                            <button 
                                onClick={confirmDelete}
                                disabled={deleteConfirmText !== 'DELETE'}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Delete Problem
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

