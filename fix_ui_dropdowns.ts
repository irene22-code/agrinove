import fs from 'fs';
let content = fs.readFileSync('src/pages/admin/AdminMarketPrices.tsx', 'utf8');

content = content.replace(`    source: '',`, `    source: '',\n    source_id: '',`);
content = content.replace(`      source: price.source || '',`, `      source: price.source || '',\n      source_id: price.source_id || '',`);
content = content.replace(`      source: '',`, `      source: '',\n      source_id: '',`);

// Market select
content = content.replace(/value=\{formData\.market_name\}\n\s*onChange=\{e => \{\n\s*const selected = markets\.find\(m => m\.name === e\.target\.value\);\n\s*setFormData\(\{\.\.\.formData, market_name: selected\?\.name \|\| '', market_id: selected\?\.id \|\| ''\}\)\n\s*\}\}\n\s*className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2\.5 border bg-white"\n\s*>\n\s*<option value="">Select Market ▼<\/option>\n\s*\{markets\.filter\(m => !m\.archived\)\.map\(m => \(\n\s*<option key=\{m\.id \|\| m\.name\} value=\{m\.name\}>\{m\.name\}<\/option>\n\s*\)\)\}\n\s*<\/select>/,
`<select
                      required
                      value={formData.market_id}
                      onChange={e => {
                        const selected = markets.find(m => m.id === e.target.value);
                        setFormData({...formData, market_id: selected?.id || '', market_name: selected?.name || ''})
                      }}
                      className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                    >
                      <option value="">Select Market ▼</option>
                      {markets.filter(m => !m.archived).map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>`);

// Source select
content = content.replace(/onChange=\{e => setFormData\(\{\.\.\.formData, source: e\.target\.value\}\)\}\n\s*className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2\.5 border bg-white"\n\s*>\n\s*<option value="">Select Price Source ▼<\/option>\n\s*\{sources\.filter\(s => !s\.archived\)\.map\(s => \(\n\s*<option key=\{s\.id \|\| s\.name\} value=\{s\.id \|\| s\.name\}>\{s\.name \|\| s\}<\/option>\n\s*\)\)\}\n\s*<\/select>/,
`onChange={e => {
                        const selected = sources.find(s => s.id === e.target.value);
                        setFormData({...formData, source_id: selected?.id || '', source: selected?.name || ''})
                      }}
                    className="w-full rounded-lg border-slate-300 shadow-xs focus:border-emerald-500 focus:ring-emerald-500 text-sm p-2.5 border bg-white"
                  >
                    <option value="">Select Price Source ▼</option>
                    {sources.filter(s => !s.archived).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>`);
                  
content = content.replace(/value=\{formData\.source\}/, `value={formData.source_id}`);

fs.writeFileSync('src/pages/admin/AdminMarketPrices.tsx', content);
