import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ShieldCheck, Bug, Activity, FileText, Video, Info, Thermometer, Droplets, CloudRain, Sun, Wind, CheckCircle2, Bookmark, ExternalLink } from 'lucide-react';
import { getPublicPlantHealthBySlug } from '../../services/api/plantHealth';

export default function PlantHealthDetails() {
    const { slug } = useParams();
    const [problem, setProblem] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (slug) {
            getPublicPlantHealthBySlug(slug).then(data => {
                setProblem(data);
                setLoading(false);
            }).catch(() => {
                setError(true);
                setLoading(false);
            });
        }
    }, [slug]);

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;
    if (error || !problem) return <div className="text-center py-20 font-medium text-slate-600">Problem not found.</div>;

    const mainImage = problem.plant_health_images?.find((i:any) => i.image_type === 'Main Image') || problem.plant_health_images?.[0];
    const additionalImages = problem.plant_health_images?.filter((i:any) => i.id !== mainImage?.id) || [];

    let riskConditions = null;
    if (typeof problem.risk_conditions === 'string') {
        try { riskConditions = JSON.parse(problem.risk_conditions); } catch (e) {}
    } else {
        riskConditions = problem.risk_conditions;
    }

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <Link to="/plant-health" className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700 mb-6">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Plant Health Guide
                    </Link>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3 aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0">
                            {mainImage?.image_url && (
                                <img src={mainImage.image_url} alt={problem.name} className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{problem.plant_health_problem_types?.name}</span>
                                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{problem.plant_health_categories?.name}</span>
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${problem.risk_level === 'High' || problem.risk_level === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>{problem.risk_level} Risk</span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">{problem.name}</h1>
                            <div className="text-lg text-slate-500 italic mb-4">{problem.scientific_name}</div>
                            
                            <p className="text-slate-700 text-lg">{problem.short_description}</p>
                            
                            <div className="mt-6 flex flex-wrap gap-4">
                                <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 font-medium uppercase">Affected Crops</div>
                                    <div className="font-medium text-slate-900">{problem.plant_health_problem_crops?.map((c:any) => c.plant_health_crops?.name).join(', ') || 'N/A'}</div>
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 font-medium uppercase">Affected Parts</div>
                                    <div className="font-medium text-slate-900">{problem.plant_health_problem_parts?.map((c:any) => c.plant_health_affected_parts?.name).join(', ') || 'N/A'}</div>
                                </div>
                                <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
                                    <div className="text-xs text-slate-500 font-medium uppercase">Season</div>
                                    <div className="font-medium text-slate-900">{problem.season || 'All Seasons'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {problem.warning && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex gap-4 items-start shadow-sm">
                        <AlertTriangle className="h-6 w-6 text-red-600 shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-900 mb-1">Important Warning</h3>
                            <p className="text-red-800">{problem.warning}</p>
                        </div>
                    </div>
                )}

                {/* Additional Images */}
                {additionalImages.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">Images</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {additionalImages.map((img:any, i:number) => (
                                <div key={i} className="group relative">
                                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                                        <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-xs font-bold text-green-600 uppercase">{img.image_type}</span>
                                        {img.caption && <p className="text-sm text-slate-600 line-clamp-2">{img.caption}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                    <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-green-600" /> About This Problem</h2>
                    <div className="prose prose-emerald max-w-none text-slate-700">
                        {problem.full_description?.split('\n').map((p:string, i:number) => <p key={i}>{p}</p>)}
                    </div>
                    
                    {problem.cause_description && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Cause {problem.cause_type && <span className="text-sm font-normal text-slate-500 ml-2">({problem.cause_type})</span>}</h3>
                            <p className="text-slate-700">{problem.cause_description}</p>
                        </div>
                    )}
                </section>

                {problem.plant_health_symptoms?.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Activity className="h-5 w-5 text-green-600" /> Symptoms</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            {problem.plant_health_symptoms.map((s:any) => (
                                <div key={s.id} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {s.image_url && <div className="h-32 bg-slate-200 rounded-lg mb-3 overflow-hidden border border-slate-200"><img src={s.image_url} alt={s.name} className="w-full h-full object-cover" /></div>}
                                    <h4 className="font-bold text-slate-900 mb-1">{s.name}</h4>
                                    <p className="text-sm text-slate-600">{s.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Spread & Risk Conditions */}
                {(problem.plant_health_problem_spread?.length > 0 || riskConditions) && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Wind className="h-5 w-5 text-green-600" /> Spread & Risk Conditions</h2>
                        
                        {problem.plant_health_problem_spread?.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">How it Spreads</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {problem.plant_health_problem_spread.map((s:any, idx:number) => (
                                        <span key={s.plant_health_spread_methods?.id || idx} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-sm">{s.plant_health_spread_methods?.name}</span>
                                    ))}
                                </div>
                                {riskConditions?.spread_description && <p className="text-slate-700">{riskConditions.spread_description}</p>}
                            </div>
                        )}

                        {riskConditions && (
                            <div className="grid gap-4 sm:grid-cols-3">
                                {riskConditions.temperature && (
                                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                                        <div className="flex items-center gap-2 text-orange-800 font-bold mb-1"><Thermometer className="h-4 w-4" /> Temperature</div>
                                        <div className="text-sm text-slate-700">{riskConditions.temperature}</div>
                                    </div>
                                )}
                                {riskConditions.humidity && (
                                    <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-100">
                                        <div className="flex items-center gap-2 text-cyan-800 font-bold mb-1"><Droplets className="h-4 w-4" /> Humidity</div>
                                        <div className="text-sm text-slate-700">{riskConditions.humidity}</div>
                                    </div>
                                )}
                                {riskConditions.rainfall && (
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-800 font-bold mb-1"><CloudRain className="h-4 w-4" /> Rainfall</div>
                                        <div className="text-sm text-slate-700">{riskConditions.rainfall}</div>
                                    </div>
                                )}
                                {riskConditions.soil_conditions && (
                                    <div className="sm:col-span-3 bg-amber-50 p-3 rounded-lg border border-amber-100 mt-2">
                                        <div className="font-bold text-amber-900 mb-1">Soil Conditions</div>
                                        <div className="text-sm text-slate-700">{riskConditions.soil_conditions}</div>
                                    </div>
                                )}
                                {riskConditions.other_conditions && (
                                    <div className="sm:col-span-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
                                        <div className="font-bold text-slate-900 mb-1">Other Conditions</div>
                                        <div className="text-sm text-slate-700">{riskConditions.other_conditions}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {(problem.plant_health_prevention?.length > 0 || problem.plant_health_control_methods?.length > 0) && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-green-600" /> Management & Control</h2>
                        
                        {problem.plant_health_prevention?.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Prevention</h3>
                                <ul className="space-y-3">
                                    {problem.plant_health_prevention.map((p:any) => (
                                        <li key={p.id} className="flex gap-3 text-slate-700">
                                            <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold text-xs"><CheckCircle2 className="h-4 w-4" /></div>
                                            <div>
                                                <span className="font-bold text-slate-900">{p.title}: </span>
                                                {p.description}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {problem.plant_health_control_methods?.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-3">Control Methods</h3>
                                <div className="space-y-4">
                                    {problem.plant_health_control_methods.map((c:any) => (
                                        <div key={c.id} className="bg-slate-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                            <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">{c.control_type}</div>
                                            <h4 className="font-bold text-slate-900 mb-2">{c.title}</h4>
                                            <p className="text-sm text-slate-700 mb-2">{c.description}</p>
                                            {c.safety_notes && (
                                                <div className="text-sm bg-yellow-50 text-yellow-800 p-3 rounded border border-yellow-200 mt-3 flex items-start gap-2">
                                                    <AlertTriangle className="h-5 w-5 shrink-0" />
                                                    <div><strong>Safety Note:</strong> {c.safety_notes}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}

                {problem.plant_health_videos?.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Video className="h-5 w-5 text-green-600" /> Educational Videos</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            {problem.plant_health_videos.map((v:any, idx:number) => (
                                <a key={idx} href={v.video_url} target="_blank" rel="noopener noreferrer" className="block group border rounded-xl overflow-hidden hover:shadow-md transition-all">
                                    <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
                                        {v.thumbnail_url ? <img src={v.thumbnail_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100" /> : <Video className="h-12 w-12 text-slate-600" />}
                                        <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center"><div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-green-600 border-b-8 border-b-transparent ml-1"></div></div></div>
                                    </div>
                                    <div className="p-4 bg-white">
                                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-green-600">{v.title}</h4>
                                        {v.description && <p className="text-sm text-slate-600 line-clamp-2">{v.description}</p>}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {problem.plant_health_resources?.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><FileText className="h-5 w-5 text-green-600" /> Farmer Guide & Resources</h2>
                        <div className="space-y-3">
                            {problem.plant_health_resources.map((r:any, idx:number) => (
                                <a key={idx} href={r.file_url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-colors group">
                                    <div className="h-10 w-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-200"><FileText className="h-5 w-5" /></div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 mb-1 group-hover:text-green-700">{r.title}</h4>
                                        <p className="text-sm text-slate-600">{r.description}</p>
                                        <div className="mt-2 text-xs font-bold text-green-600 uppercase flex items-center gap-1"><ExternalLink className="h-3 w-3" /> {r.resource_type}</div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {problem.plant_health_expert_advice?.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Bookmark className="h-5 w-5 text-green-600" /> Expert Advice</h2>
                        <div className="space-y-4">
                            {problem.plant_health_expert_advice.map((e:any, idx:number) => (
                                <div key={idx} className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                                    <p className="text-slate-700 italic mb-3">"{e.advice}"</p>
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">{e.expert_name?.charAt(0)}</div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{e.expert_name}</div>
                                            <div className="text-xs text-slate-500">{e.organization}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {problem.plant_health_sources?.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 md:p-8">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-4">Sources & Verification</h2>
                        <ul className="space-y-3">
                            {problem.plant_health_sources.map((s:any, idx:number) => (
                                <li key={idx} className="text-sm text-slate-600">
                                    <strong className="text-slate-800">{s.source_name}</strong>
                                    {s.reference_document && <span> - {s.reference_document}</span>}
                                    {s.source_url && <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="ml-2 text-green-600 hover:underline">Link</a>}
                                    {s.verified_by && <div className="text-xs text-slate-400 mt-1">Verified by {s.verified_by}</div>}
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

            </div>
        </div>
    );
}
