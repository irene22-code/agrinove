const fs = require('fs');
let content = fs.readFileSync('server/controllers/plantHealthController.ts', 'utf8');

const oldReplace = `        const replaceChildren = async (table: string, items: any[]) => {
            await supabase.from(table).delete().eq('problem_id', id);
            if (items && items.length > 0) {
                await supabase.from(table).insert(items.map((i: any) => ({ ...i, problem_id: id, id: undefined })));
            }
        };`;

const newReplace = `        const replaceChildren = async (table: string, items: any[], fileUrlField?: string) => {
            if (fileUrlField) {
                // Find removed files to delete from storage
                const { data: existing } = await supabase.from(table).select(fileUrlField).eq('problem_id', id);
                if (existing) {
                    const newUrls = (items || []).map((i: any) => i[fileUrlField]).filter(Boolean);
                    const filesToDelete: string[] = [];
                    existing.forEach((row: any) => {
                        const url = row[fileUrlField];
                        if (url && !newUrls.includes(url) && url.includes('/storage/v1/object/public/')) {
                            const parts = url.split('/storage/v1/object/public/');
                            if (parts.length > 1) filesToDelete.push(parts[1]);
                        }
                    });
                    
                    if (filesToDelete.length > 0) {
                        try {
                            const bucketMap: Record<string, string[]> = {};
                            filesToDelete.forEach(filePath => {
                                const [bucket, ...rest] = filePath.split('/');
                                if (bucket && rest.length > 0) {
                                    if (!bucketMap[bucket]) bucketMap[bucket] = [];
                                    bucketMap[bucket].push(rest.join('/'));
                                }
                            });
                            for (const [bucket, paths] of Object.entries(bucketMap)) {
                                supabase.storage.from(bucket).remove(paths).catch(console.error);
                            }
                        } catch (e) {
                            console.error('Storage cleanup error', e);
                        }
                    }
                }
            }
            await supabase.from(table).delete().eq('problem_id', id);
            if (items && items.length > 0) {
                await supabase.from(table).insert(items.map((i: any) => ({ ...i, problem_id: id, id: undefined })));
            }
        };`;

content = content.replace(oldReplace, newReplace);
content = content.replace(`await replaceChildren('plant_health_images', body.images);`, `await replaceChildren('plant_health_images', body.images, 'image_url');`);
content = content.replace(`await replaceChildren('plant_health_videos', body.videos);`, `await replaceChildren('plant_health_videos', body.videos, 'thumbnail_url');`);
content = content.replace(`await replaceChildren('plant_health_resources', body.resources);`, `await replaceChildren('plant_health_resources', body.resources, 'file_url');`);
fs.writeFileSync('server/controllers/plantHealthController.ts', content);
