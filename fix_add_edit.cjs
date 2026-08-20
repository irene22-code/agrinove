const fs = require('fs');
const content = `import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Image as ImageIcon } from 'lucide-react';
import { getLookups, createPlantHealth, updatePlantHealth, uploadPlantHealthImage, uploadPlantHealthDocument, getAdminPlantHealthById } from '../../services/api/plantHealth';

export default function AddEditPlantHealth() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [lookups, setLookups] = useState<any>({ types: [], categories: [], crops: [], parts: [], spreadMethods: [] });
    
    const [formData, setFormData] = useState<any>({
        name: '', scientific_name: '', problem_type_id: '', category_id: '',
        risk_level: 'Low', short_description: '', full_description: '',
        cause_type: '', cause_description: '', season: 'All Seasons', warning: '', status: 'Draft',
        risk_conditions: { temperature: '', humidity: '', rainfall: '', soil_conditions: '', other_conditions: '' },
        crops: [], parts: [], spread: [],
        images: [], symptoms: [], prevention: [], controls: [], videos: [], resources: [], experts: [], sources: []
    });

    useEffect(() => {
        getLookups().then(data => setLookups(data));
        if (id) {
            setFetching(true);
            getAdminPlantHealthById(id).then(data => {
                const mapped = { ...data };
                // mapping relations
                mapped.crops = data.plant_health_problem_crops?.map((c: any) => c.crop_id) || [];
                mapped.parts = data.plant_health_problem_parts?.map((c: any) => c.part_id) || [];
                mapped.spread = data.plant_health_problem_spread?.map((c: any) => c.spread_method_id) || [];
                mapped.images = data.plant_health_images || [];
                mapped.symptoms = data.plant_health_symptoms || [];
                mapped.prevention = data.plant_health_prevention || [];
                mapped.controls = data.plant_health_control_methods || [];
                mapped.videos = data.plant_health_videos || [];
                mapped.resources = data.plant_health_resources || [];
                mapped.experts = data.plant_health_expert_advice || [];
                mapped.sources = data.plant_health_sources || [];
                if (!mapped.risk_conditions) {
                    mapped.risk_conditions = { temperature: '', humidity: '', rainfall: '', soil_conditions: '', other_conditions: '' };
                }
                setFormData(mapped);
            }).finally(() => setFetching(false));
        }
    }, [id]);
    
    const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleRiskChange = (e: any) => setFormData({ ...formData, risk_conditions: { ...formData.risk_conditions, [e.target.name]: e.target.value } });
    const handleArrayChange = (name: string, values: string[]) => setFormData({ ...formData, [name]: values });

    const handleFileUpload = async (e: any, type: 'image' | 'document', callback: (url: string) => void) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData(); fd.append(type, file);
        try {
            const res = type === 'image' ? await uploadPlantHealthImage(fd) : await uploadPlantHealthDocument(fd);
            callback(res.url);
        } catch (err) {
            alert("Upload failed");
        }
    };

    const addListItem = (field: string, item: any) => setFormData({ ...formData, [field]: [...formData[field], item] });
    const updateListItem = (field: string, index: number, key: string, value: any) => {
        const newArr = [...formData[field]];
        newArr[index][key] = value;
        setFormData({ ...formData, [field]: newArr });
    };
    const removeListItem = (field: string, index: number) => {
        const newArr = [...formData[field]];
        newArr.splice(index, 1);
        setFormData({ ...formData, [field]: newArr });
    };

    const save = async (statusOverride?: string) => {
        const payload = { ...formData };
        if (statusOverride) payload.status = statusOverride;
        
        try {
            setLoading(true);
            if (id) await updatePlantHealth(id, payload);
            else await createPlantHealth(payload);
            navigate('/admin/plant-health');
        } catch (err) {
            alert('Failed to save');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/plant-health')} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft className="h-5 w-5" /></button>
                <h1 className="text-2xl font-bold text-slate-900">{id ? 'Edit Problem' : 'Add New Problem'}</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-10">
                {/* 1. IMAGES */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">1. Images</h2>
                    
                    <div className="mb-6">
                        <label className="block font-medium mb-2">Main Image (Required) *</label>
                        {formData.images.filter((i:any) => i.image_type === 'Main Image').length === 0 ? (
                            <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', (url) => {
                                addListItem('images', { image_url: url, image_type: 'Main Image', caption: 'Main Image' });
                            })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                        ) : (
                            <div className="flex gap-4 flex-wrap">
                                {formData.images.map((img: any, i: number) => img.image_type === 'Main Image' && (
                                    <div key={i} className="relative w-48 h-48 border rounded-lg overflow-hidden group">
                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => removeListItem('images', i)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="font-medium">Additional Images</label>
                            <div className="relative overflow-hidden inline-block">
                                <button className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Image</button>
                                <input type="file" accept="image/*" title=" " onChange={(e) => handleFileUpload(e, 'image', (url) => {
                                    addListItem('images', { image_url: url, image_type: 'Other', caption: '' });
                                    e.target.value = '';
                                })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {formData.images.map((img: any, idx: number) => img.image_type !== 'Main Image' && (
                                <div key={idx} className="flex gap-4 items-center bg-slate-50 p-3 rounded-lg border">
                                    <div className="w-20 h-20 rounded border overflow-hidden shrink-0"><img src={img.image_url} alt="" className="w-full h-full object-cover" /></div>
                                    <select value={img.image_type} onChange={e => updateListItem('images', idx, 'image_type', e.target.value)} className="border rounded p-2">
                                        <option>Symptom</option><option>Pest/Insect</option><option>Crop Damage</option><option>Disease Stage</option><option>Other</option>
                                    </select>
                                    <input type="text" placeholder="Caption" value={img.caption || ''} onChange={e => updateListItem('images', idx, 'caption', e.target.value)} className="flex-1 border rounded p-2" />
                                    <button onClick={() => removeListItem('images', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 className="w-5 h-5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* BASIC INFO */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Problem Name *</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-2" required /></div>
                        <div><label className="block text-sm font-medium mb-1">Scientific Name</label><input type="text" name="scientific_name" value={formData.scientific_name} onChange={handleChange} className="w-full border rounded-lg p-2" /></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Problem Type *</label>
                            <select name="problem_type_id" value={formData.problem_type_id} onChange={handleChange} className="w-full border rounded-lg p-2">
                                <option value="">Select Type</option>
                                {lookups.types.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border rounded-lg p-2">
                                <option value="">Select Category</option>
                                {lookups.categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Risk Level</label>
                            <select name="risk_level" value={formData.risk_level} onChange={handleChange} className="w-full border rounded-lg p-2">
                                <option>Low</option><option>Medium</option><option>High</option><option>Critical</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* CROPS & PARTS */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">Crop Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Affected Crops</label>
                            <select multiple value={formData.crops} onChange={(e) => handleArrayChange('crops', Array.from(e.target.selectedOptions, o => o.value))} className="w-full border rounded-lg p-2 h-32">
                                {lookups.crops.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Affected Parts</label>
                            <select multiple value={formData.parts} onChange={(e) => handleArrayChange('parts', Array.from(e.target.selectedOptions, o => o.value))} className="w-full border rounded-lg p-2 h-32">
                                {lookups.parts.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    </div>
                </section>

                {/* 2. ABOUT THE PROBLEM */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">2. About the Problem</h2>
                    <div className="space-y-4">
                        <div><label className="block text-sm font-medium mb-1">Short Description (for public card)</label><textarea name="short_description" value={formData.short_description || ''} onChange={handleChange} rows={2} className="w-full border rounded-lg p-2"></textarea></div>
                        <div><label className="block text-sm font-medium mb-1">Full Description (for details page)</label><textarea name="full_description" value={formData.full_description || ''} onChange={handleChange} rows={4} className="w-full border rounded-lg p-2"></textarea></div>
                    </div>
                </section>

                {/* 3. CAUSE */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">3. Cause</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Cause Type</label>
                            <select name="cause_type" value={formData.cause_type || ''} onChange={handleChange} className="w-full border rounded-lg p-2">
                                <option value="">Select Cause</option>
                                <option>Bacteria</option><option>Fungus</option><option>Virus</option><option>Nematode</option><option>Insect</option><option>Animal</option><option>Nutrient Deficiency</option><option>Environmental</option><option>Other</option>
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Cause Description</label><textarea name="cause_description" value={formData.cause_description || ''} onChange={handleChange} rows={3} className="w-full border rounded-lg p-2"></textarea></div>
                    </div>
                </section>

                {/* 4. SYMPTOMS */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">4. Symptoms</h2>
                        <button onClick={() => addListItem('symptoms', { name: '', description: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Symptom</button>
                    </div>
                    <div className="space-y-3">
                        {formData.symptoms.map((s: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <input type="text" placeholder="Symptom Name" value={s.name || ''} onChange={e => updateListItem('symptoms', idx, 'name', e.target.value)} className="w-full border rounded p-2" />
                                    <textarea placeholder="Description" value={s.description || ''} onChange={e => updateListItem('symptoms', idx, 'description', e.target.value)} rows={2} className="w-full border rounded p-2"></textarea>
                                </div>
                                <button onClick={() => removeListItem('symptoms', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 5. HOW IT SPREADS */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">5. How It Spreads</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Spread Methods</label>
                            <select multiple value={formData.spread} onChange={(e) => handleArrayChange('spread', Array.from(e.target.selectedOptions, o => o.value))} className="w-full border rounded-lg p-2 h-32">
                                {lookups.spreadMethods.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div><label className="block text-sm font-medium mb-1">Spread Description</label><textarea value={formData.risk_conditions?.spread_description || ''} onChange={e => handleRiskChange({target:{name: 'spread_description', value: e.target.value}})} rows={3} className="w-full border rounded-lg p-2"></textarea></div>
                    </div>
                </section>

                {/* 6. CONDITIONS THAT INCREASE RISK */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">6. Conditions That Increase Risk</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium mb-1">Temperature</label><input type="text" name="temperature" value={formData.risk_conditions?.temperature || ''} onChange={handleRiskChange} className="w-full border rounded p-2" /></div>
                        <div><label className="block text-sm font-medium mb-1">Humidity</label><input type="text" name="humidity" value={formData.risk_conditions?.humidity || ''} onChange={handleRiskChange} className="w-full border rounded p-2" /></div>
                        <div><label className="block text-sm font-medium mb-1">Rainfall</label><input type="text" name="rainfall" value={formData.risk_conditions?.rainfall || ''} onChange={handleRiskChange} className="w-full border rounded p-2" /></div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Season</label>
                            <select name="season" value={formData.season || 'All Seasons'} onChange={handleChange} className="w-full border rounded-lg p-2">
                                <option>All Seasons</option><option>Rainy Season</option><option>Dry Season</option>
                            </select>
                        </div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Soil Conditions</label><textarea name="soil_conditions" value={formData.risk_conditions?.soil_conditions || ''} onChange={handleRiskChange} rows={2} className="w-full border rounded p-2"></textarea></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Other Risk Conditions</label><textarea name="other_conditions" value={formData.risk_conditions?.other_conditions || ''} onChange={handleRiskChange} rows={2} className="w-full border rounded p-2"></textarea></div>
                    </div>
                </section>

                {/* 7. PREVENTION */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">7. Prevention</h2>
                        <button onClick={() => addListItem('prevention', { title: '', description: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Prevention</button>
                    </div>
                    <div className="space-y-3">
                        {formData.prevention.map((p: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <input type="text" placeholder="Prevention Title" value={p.title || ''} onChange={e => updateListItem('prevention', idx, 'title', e.target.value)} className="w-full border rounded p-2" />
                                    <textarea placeholder="Description" value={p.description || ''} onChange={e => updateListItem('prevention', idx, 'description', e.target.value)} rows={2} className="w-full border rounded p-2"></textarea>
                                </div>
                                <button onClick={() => removeListItem('prevention', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 8. MANAGEMENT & CONTROL */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">8. Management & Control</h2>
                        <button onClick={() => addListItem('controls', { control_type: 'Cultural Control', title: '', description: '', safety_notes: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Control</button>
                    </div>
                    <div className="space-y-3">
                        {formData.controls.map((c: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-4">
                                        <select value={c.control_type || ''} onChange={e => updateListItem('controls', idx, 'control_type', e.target.value)} className="w-1/3 border rounded p-2">
                                            <option>Cultural Control</option><option>Biological Control</option><option>Mechanical Control</option><option>Chemical Control</option>
                                        </select>
                                        <input type="text" placeholder={c.control_type === 'Chemical Control' ? "Product / Active Ingredient" : "Title"} value={c.title || ''} onChange={e => updateListItem('controls', idx, 'title', e.target.value)} className="flex-1 border rounded p-2" />
                                    </div>
                                    <textarea placeholder="Description / Application Guidance" value={c.description || ''} onChange={e => updateListItem('controls', idx, 'description', e.target.value)} rows={2} className="w-full border rounded p-2"></textarea>
                                    <input type="text" placeholder="Safety Notes" value={c.safety_notes || ''} onChange={e => updateListItem('controls', idx, 'safety_notes', e.target.value)} className="w-full border rounded p-2" />
                                </div>
                                <button onClick={() => removeListItem('controls', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 9. IMPORTANT WARNING */}
                <section>
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b pb-2">9. Important Warning</h2>
                    <textarea name="warning" value={formData.warning !== undefined ? formData.warning : "Similar symptoms may be caused by other diseases, pests, nutrient deficiencies, or environmental problems. Seek professional agricultural advice when the diagnosis is uncertain."} onChange={handleChange} rows={3} className="w-full border rounded-lg p-2"></textarea>
                </section>

                {/* 10. EDUCATIONAL VIDEOS */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">10. Educational Videos</h2>
                        <button onClick={() => addListItem('videos', { title: '', video_url: '', description: '', thumbnail_url: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Video</button>
                    </div>
                    <div className="space-y-3">
                        {formData.videos.map((v: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <input type="text" placeholder="Video Title" value={v.title || ''} onChange={e => updateListItem('videos', idx, 'title', e.target.value)} className="w-full border rounded p-2" />
                                    <input type="text" placeholder="Video URL (YouTube/Vimeo)" value={v.video_url || ''} onChange={e => updateListItem('videos', idx, 'video_url', e.target.value)} className="w-full border rounded p-2" />
                                    <textarea placeholder="Description" value={v.description || ''} onChange={e => updateListItem('videos', idx, 'description', e.target.value)} rows={2} className="w-full border rounded p-2"></textarea>
                                </div>
                                <button onClick={() => removeListItem('videos', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 11. FARMER GUIDE */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">11. Farmer Guide & Resources</h2>
                        <button onClick={() => addListItem('resources', { title: '', description: '', resource_type: 'PDF Farmer Guide', file_url: '', source: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Resource</button>
                    </div>
                    <div className="space-y-3">
                        {formData.resources.map((r: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-4">
                                        <select value={r.resource_type || ''} onChange={e => updateListItem('resources', idx, 'resource_type', e.target.value)} className="w-1/3 border rounded p-2">
                                            <option>PDF Farmer Guide</option><option>Agricultural Article</option><option>External Guide</option><option>Other Educational Resource</option>
                                        </select>
                                        <input type="text" placeholder="Title" value={r.title || ''} onChange={e => updateListItem('resources', idx, 'title', e.target.value)} className="flex-1 border rounded p-2" />
                                    </div>
                                    <textarea placeholder="Description" value={r.description || ''} onChange={e => updateListItem('resources', idx, 'description', e.target.value)} rows={2} className="w-full border rounded p-2"></textarea>
                                    <div className="flex gap-4 items-center">
                                        <input type="text" placeholder="External URL" value={r.file_url || ''} onChange={e => updateListItem('resources', idx, 'file_url', e.target.value)} className="flex-1 border rounded p-2" />
                                        <span className="text-sm font-medium">OR</span>
                                        <div className="relative overflow-hidden inline-block">
                                            <button className="bg-slate-200 px-3 py-2 rounded text-sm font-medium">Upload File</button>
                                            <input type="file" title=" " onChange={(e) => handleFileUpload(e, 'document', (url) => { updateListItem('resources', idx, 'file_url', url); e.target.value = ''; })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => removeListItem('resources', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 12. EXPERT ADVICE */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">12. Expert Advice</h2>
                        <button onClick={() => addListItem('experts', { expert_name: '', organization: '', advice: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Expert Advice</button>
                    </div>
                    <div className="space-y-3">
                        {formData.experts.map((e: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-4">
                                        <input type="text" placeholder="Expert Name" value={e.expert_name || ''} onChange={ev => updateListItem('experts', idx, 'expert_name', ev.target.value)} className="w-1/2 border rounded p-2" />
                                        <input type="text" placeholder="Organization" value={e.organization || ''} onChange={ev => updateListItem('experts', idx, 'organization', ev.target.value)} className="w-1/2 border rounded p-2" />
                                    </div>
                                    <textarea placeholder="Advice" value={e.advice || ''} onChange={ev => updateListItem('experts', idx, 'advice', ev.target.value)} rows={2} className="w-full border rounded p-2"></textarea>
                                </div>
                                <button onClick={() => removeListItem('experts', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 13. SOURCES & VERIFICATION */}
                <section>
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h2 className="text-lg font-bold text-slate-900">13. Sources & Verification</h2>
                        <button onClick={() => addListItem('sources', { source_name: '', source_url: '', reference_document: '', verified_by: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Source</button>
                    </div>
                    <div className="space-y-3">
                        {formData.sources.map((s: any, idx: number) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border">
                                <div className="flex-1 space-y-3">
                                    <div className="flex gap-4">
                                        <input type="text" placeholder="Source Name" value={s.source_name || ''} onChange={ev => updateListItem('sources', idx, 'source_name', ev.target.value)} className="w-1/2 border rounded p-2" />
                                        <input type="text" placeholder="Source URL" value={s.source_url || ''} onChange={ev => updateListItem('sources', idx, 'source_url', ev.target.value)} className="w-1/2 border rounded p-2" />
                                    </div>
                                    <div className="flex gap-4">
                                        <input type="text" placeholder="Reference Document" value={s.reference_document || ''} onChange={ev => updateListItem('sources', idx, 'reference_document', ev.target.value)} className="w-1/2 border rounded p-2" />
                                        <input type="text" placeholder="Verified By" value={s.verified_by || ''} onChange={ev => updateListItem('sources', idx, 'verified_by', ev.target.value)} className="w-1/2 border rounded p-2" />
                                    </div>
                                </div>
                                <button onClick={() => removeListItem('sources', idx)} className="text-red-500 p-2 hover:bg-red-50 rounded shrink-0"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
                    <button onClick={() => navigate('/admin/plant-health')} className="px-6 py-2 rounded-lg font-medium hover:bg-slate-100 transition-colors">Cancel</button>
                    <button onClick={() => save('Draft')} disabled={loading} className="bg-slate-800 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-900 transition-colors flex items-center gap-2">
                        <Save className="h-5 w-5" /> {loading ? 'Saving...' : 'Save Draft'}
                    </button>
                    <button onClick={() => save('Published')} disabled={loading} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
                        {loading ? 'Publishing...' : 'Publish'}
                    </button>
                </div>
            </div>
        </div>
    );
}
`;
fs.writeFileSync('src/pages/admin/AddEditPlantHealth.tsx', content);
