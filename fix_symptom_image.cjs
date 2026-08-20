const fs = require('fs');

let file = 'src/pages/admin/AddEditPlantHealth.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    `<button onClick={() => addListItem('symptoms', { name: '', description: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Symptom</button>`,
    `<button onClick={() => addListItem('symptoms', { name: '', description: '', image_url: '' })} className="text-emerald-600 font-medium flex items-center text-sm border px-3 py-1 rounded hover:bg-emerald-50"><Plus className="w-4 h-4 mr-1" /> Add Symptom</button>`
);

content = content.replace(
    `<input type="text" placeholder="Symptom Name" value={s.name || ''} onChange={e => updateListItem('symptoms', idx, 'name', e.target.value)} className="w-full border rounded p-2" />`,
    `<input type="text" placeholder="Symptom Name" value={s.name || ''} onChange={e => updateListItem('symptoms', idx, 'name', e.target.value)} className="w-full border rounded p-2" />
                                    <div className="flex gap-4 items-center mt-2">
                                        <input type="text" placeholder="Image URL (optional)" value={s.image_url || ''} onChange={e => updateListItem('symptoms', idx, 'image_url', e.target.value)} className="flex-1 border rounded p-2 text-sm" />
                                        <span className="text-sm font-medium">OR</span>
                                        <div className="relative overflow-hidden inline-block">
                                            <button className="bg-slate-200 px-3 py-2 rounded text-sm font-medium">Upload File</button>
                                            <input type="file" title=" " onChange={(e) => handleFileUpload(e, 'image', (url) => { updateListItem('symptoms', idx, 'image_url', url); e.target.value = ''; })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                        </div>
                                    </div>`
);

fs.writeFileSync(file, content);

// Now update PlantHealthDetails.tsx
let file2 = 'src/pages/public/PlantHealthDetails.tsx';
let content2 = fs.readFileSync(file2, 'utf8');

content2 = content2.replace(
    `<h4 className="font-bold text-slate-900 mb-1">{s.name}</h4>`,
    `{s.image_url && <div className="h-32 bg-slate-200 rounded-lg mb-3 overflow-hidden border border-slate-200"><img src={s.image_url} alt={s.name} className="w-full h-full object-cover" /></div>}
                                    <h4 className="font-bold text-slate-900 mb-1">{s.name}</h4>`
);
fs.writeFileSync(file2, content2);
