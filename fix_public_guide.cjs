const fs = require('fs');

const content = `import { useState, useEffect } from 'react';
import { Leaf, Search, AlertTriangle, ChevronRight } from 'lucide-react';
import { getPublicPlantHealth, getLookups } from '../../services/api/plantHealth';
import { Link } from 'react-router-dom';

export default function PlantHealthGuide() {
    const [problems, setProblems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lookups, setLookups] = useState<any>({ types: [], crops: [] });
    
    const [filters, setFilters] = useState({ search: '', crop_id: '', type_id: '', risk_level: '' });

    useEffect(() => {
        getLookups().then(data => setLookups(data));
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await getPublicPlantHealth(filters);
            setProblems(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e: any) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };
    const clearFilters = () => {
        setFilters({ search: '', crop_id: '', type_id: '', risk_level: '' });
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Hero */}
            <div className="bg-emerald-800 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold mb-4">Protect Your Crops. Identify Problems Early.</h1>
                    <p className="text-emerald-100 max-w-2xl mx-auto text-lg">
                        Learn about crop diseases, harmful pests, insects, animal damage, nutrient deficiencies, and other problems that can affect your farm.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
                <div className="bg-white rounded-xl shadow-lg p-4 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative md:col-span-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input type="text" name="search" value={filters.search} onChange={handleFilterChange} placeholder="Search problems..." className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50" />
                    </div>
                    <select name="crop_id" value={filters.crop_id} onChange={handleFilterChange} className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-emerald-500">
                        <option value="">All Crops</option>
                        {lookups.crops.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select name="type_id" value={filters.type_id} onChange={handleFilterChange} className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-emerald-500">
                        <option value="">All Types</option>
                        {lookups.types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    <select name="risk_level" value={filters.risk_level} onChange={handleFilterChange} className="border border-slate-200 rounded-lg px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-emerald-500">
                        <option value="">Any Risk Level</option>
                        <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
                    </select>
                </div>

                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-slate-700">Showing {problems.length} results</h2>
                    {(filters.search || filters.crop_id || filters.type_id || filters.risk_level) && (
                        <button onClick={clearFilters} className="text-sm font-medium text-emerald-600 hover:text-emerald-700">Clear Filters</button>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>
                ) : problems.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {problems.map(problem => {
                            const mainImg = problem.plant_health_images?.find((i:any) => i.image_type === 'Main Image') || problem.plant_health_images?.[0];
                            return (
                            <Link key={problem.id} to={\`/plant-health/\${problem.slug}\`} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1 group flex flex-col h-full">
                                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                    {mainImg?.image_url ? (
                                        <img src={mainImg.image_url} alt={problem.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Leaf className="h-10 w-10 text-slate-300" /></div>
                                    )}
                                    <div className="absolute top-3 right-3">
                                        <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm \${problem.risk_level === 'High' || problem.risk_level === 'Critical' ? 'bg-red-500 text-white' : problem.risk_level === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}\`}>
                                            {problem.risk_level} Risk
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1 line-clamp-1">{problem.plant_health_problem_types?.name} {problem.cause_type && \`• \${problem.cause_type}\`}</div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">{problem.name}</h3>
                                    
                                    <div className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">{problem.short_description || "No description provided."}</div>
                                    
                                    <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto">
                                        <div className="flex items-start text-sm">
                                            <span className="text-slate-500 w-16 shrink-0 font-medium">Crops:</span>
                                            <span className="text-slate-900 font-medium flex-1 line-clamp-1">{problem.plant_health_problem_crops?.map((c:any) => c.plant_health_crops?.name).join(', ') || 'N/A'}</span>
                                        </div>
                                        {problem.plant_health_symptoms?.length > 0 && (
                                            <div className="flex items-start text-sm">
                                                <span className="text-slate-500 w-16 shrink-0 font-medium">Symptoms:</span>
                                                <span className="text-slate-900 flex-1 line-clamp-1">{problem.plant_health_symptoms.map((s:any) => s.name).join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-4 flex items-center text-sm font-bold text-emerald-600 group-hover:text-emerald-700 transition-colors">
                                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                                    </div>
                                </div>
                            </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-200">
                        <div className="h-16 w-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">No crop problems found.</h3>
                        <p className="text-slate-500 mb-6">Try changing your search or filters to find what you're looking for.</p>
                        <button onClick={clearFilters} className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-lg font-medium hover:bg-emerald-200 transition-colors">Clear All Filters</button>
                    </div>
                )}
            </div>
        </div>
    );
}
`;
fs.writeFileSync('src/pages/public/PlantHealthGuide.tsx', content);
