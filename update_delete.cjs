const fs = require('fs');
let content = fs.readFileSync('server/controllers/plantHealthController.ts', 'utf8');

const oldDelete = `export const deletePlantHealth = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('plant_health_problems').delete().eq('id', id);
        handleDbResponse(res, data, error, "Failed to delete record");
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};`;

const newDelete = `export const deletePlantHealth = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Fetch related files for storage cleanup
        const [imagesRes, videosRes, resourcesRes] = await Promise.all([
            supabase.from('plant_health_images').select('image_url').eq('problem_id', id),
            supabase.from('plant_health_videos').select('thumbnail_url').eq('problem_id', id),
            supabase.from('plant_health_resources').select('file_url').eq('problem_id', id)
        ]);

        const filesToDelete: string[] = [];

        if (imagesRes.data) {
            imagesRes.data.forEach((img: any) => {
                if (img.image_url && img.image_url.includes('/storage/v1/object/public/')) {
                    const parts = img.image_url.split('/storage/v1/object/public/');
                    if (parts.length > 1) filesToDelete.push(parts[1]);
                }
            });
        }
        if (videosRes.data) {
            videosRes.data.forEach((vid: any) => {
                if (vid.thumbnail_url && vid.thumbnail_url.includes('/storage/v1/object/public/')) {
                    const parts = vid.thumbnail_url.split('/storage/v1/object/public/');
                    if (parts.length > 1) filesToDelete.push(parts[1]);
                }
            });
        }
        if (resourcesRes.data) {
            resourcesRes.data.forEach((res: any) => {
                if (res.file_url && res.file_url.includes('/storage/v1/object/public/')) {
                    const parts = res.file_url.split('/storage/v1/object/public/');
                    if (parts.length > 1) filesToDelete.push(parts[1]);
                }
            });
        }

        // 2. Delete child records (in case ON DELETE CASCADE is missing)
        const childTables = [
            'plant_health_problem_crops', 'plant_health_problem_parts', 'plant_health_problem_spread',
            'plant_health_images', 'plant_health_symptoms', 'plant_health_prevention', 
            'plant_health_control_methods', 'plant_health_videos', 'plant_health_resources', 
            'plant_health_expert_advice', 'plant_health_sources'
        ];

        for (const table of childTables) {
            await supabase.from(table).delete().eq('problem_id', id);
        }

        // 3. Delete parent record
        const { data, error } = await supabase.from('plant_health_problems').delete().eq('id', id);

        if (error) {
            return res.status(500).json({ error: "Failed to delete record", details: error.message });
        }

        // 4. Clean up storage (Fire and forget, do not block if it fails)
        if (filesToDelete.length > 0) {
            try {
                // Group by bucket
                const bucketMap: Record<string, string[]> = {};
                filesToDelete.forEach(filePath => {
                    const [bucket, ...rest] = filePath.split('/');
                    const path = rest.join('/');
                    if (bucket && path) {
                        if (!bucketMap[bucket]) bucketMap[bucket] = [];
                        bucketMap[bucket].push(path);
                    }
                });

                for (const [bucket, paths] of Object.entries(bucketMap)) {
                    await supabase.storage.from(bucket).remove(paths);
                }
            } catch (storageErr) {
                console.error("Failed to delete some storage files", storageErr);
            }
        }

        return res.json({ success: true, data });
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync('server/controllers/plantHealthController.ts', content);
