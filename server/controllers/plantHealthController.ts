import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';
const supabase = getAdminSupabaseClient();

// Helper to check for errors
const handleDbResponse = (res: Response, data: any, error: any, customMessage: string) => {
    if (error) {
        console.error(customMessage, error);
        return res.status(500).json({ error: customMessage, details: error.message });
    }
    return res.json(data);
};

// --- PUBLIC ROUTES ---

export const getPlantHealthLookupData = async (req: Request, res: Response) => {
    try {
        const [types, categories, crops, parts, spreadMethods, riskLevels, seasons, causeTypes] = await Promise.all([
            supabase.from('plant_health_problem_types').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_categories').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_crops').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_affected_parts').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_spread_methods').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_risk_levels').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_seasons').select('*').eq('is_active', true).order('name'),
            supabase.from('plant_health_cause_types').select('*').eq('is_active', true).order('name')
        ]);
        
        return res.json({
            types: types.data || [],
            categories: categories.data || [],
            crops: crops.data || [],
            parts: parts.data || [],
            spreadMethods: spreadMethods.data || [],
            riskLevels: riskLevels.data || [],
            seasons: seasons.data || [],
            causeTypes: causeTypes.data || []
        });
    } catch (err: any) {
        return res.status(500).json({ error: "Failed to fetch lookup data", details: err.message });
    }
};

export const getPublicPlantHealth = async (req: Request, res: Response) => {
    try {
        const { search, crop_id, type_id, part_id, risk_level, season } = req.query;
        
        let selectString = `
            id, name, slug, scientific_name, risk_level, short_description, status,
            problem_type_id, category_id, cause_type, cause_description, season,
            plant_health_images ( image_url, image_type ),
            plant_health_problem_types ( name ),
            plant_health_symptoms ( name )
        `;
        
        if (crop_id) {
            selectString += ', plant_health_problem_crops!inner ( crop_id, plant_health_crops (name) )';
        } else {
            selectString += ', plant_health_problem_crops ( crop_id, plant_health_crops (name) )';
        }
        
        if (part_id) {
            selectString += ', plant_health_problem_parts!inner ( part_id, plant_health_affected_parts (name) )';
        } else {
            selectString += ', plant_health_problem_parts ( part_id, plant_health_affected_parts (name) )';
        }

        let query = supabase.from('plant_health_problems').select(selectString).eq('status', 'Published');
        
        if (search) {
            query = query.or(`name.ilike.%${search}%,scientific_name.ilike.%${search}%`);
        }
        if (crop_id) {
            query = query.eq('plant_health_problem_crops.crop_id', crop_id);
        }
        if (type_id) {
            query = query.eq('problem_type_id', type_id);
        }
        if (part_id) {
            query = query.eq('plant_health_problem_parts.part_id', part_id);
        }
        if (risk_level) {
            query = query.eq('risk_level', risk_level);
        }
        if (season) {
            query = query.eq('season', season);
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        handleDbResponse(res, data, error, "Failed to fetch plant health list");
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const getPublicPlantHealthBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const { data, error } = await supabase.from('plant_health_problems').select(`
            *,
            plant_health_problem_types ( name ),
            plant_health_categories ( name ),
            plant_health_images ( * ),
            plant_health_symptoms ( * ),
            plant_health_prevention ( * ),
            plant_health_control_methods ( * ),
            plant_health_videos ( * ),
            plant_health_resources ( * ),
            plant_health_expert_advice ( * ),
            plant_health_sources ( * ),
            plant_health_problem_crops ( plant_health_crops ( id, name ) ),
            plant_health_problem_parts ( plant_health_affected_parts ( id, name ) ),
            plant_health_problem_spread ( plant_health_spread_methods ( id, name ) )
        `).eq('slug', slug).eq('status', 'Published').single();
        
        if (error) {
            return res.status(404).json({ error: "Not found", details: error.message });
        }
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

// --- ADMIN ROUTES ---

export const getAdminPlantHealth = async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('plant_health_problems').select(`
            id, name, slug, risk_level, status, last_updated,
            plant_health_images ( image_url ),
            plant_health_problem_types ( name ),
            plant_health_problem_crops ( plant_health_crops (name) )
        `).order('created_at', { ascending: false });
        
        handleDbResponse(res, data, error, "Failed to fetch admin list");
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

const buildSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export const createPlantHealth = async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const slug = buildSlug(body.name);
        
        // 1. Insert main record
        const { data: main, error: mainErr } = await supabase.from('plant_health_problems').insert({
            name: body.name,
            slug: slug,
            scientific_name: body.scientific_name,
            problem_type_id: body.problem_type_id,
            category_id: body.category_id,
            risk_level: body.risk_level,
            short_description: body.short_description,
            full_description: body.full_description,
            cause_type: body.cause_type,
            cause_description: body.cause_description,
            season: body.season,
            risk_conditions: body.risk_conditions,
            warning: body.warning,
            status: body.status || 'Draft',
            created_by: req.user?.id
        }).select().single();
        
        if (mainErr) return res.status(500).json({ error: "Failed to create record", details: mainErr.message });
        
        const problemId = main.id;
        
        // 2. Insert relations
        if (body.crops && body.crops.length > 0) {
            await supabase.from('plant_health_problem_crops').insert(
                body.crops.map((c: string) => ({ problem_id: problemId, crop_id: c }))
            );
        }
        if (body.parts && body.parts.length > 0) {
            await supabase.from('plant_health_problem_parts').insert(
                body.parts.map((p: string) => ({ problem_id: problemId, part_id: p }))
            );
        }
        if (body.spread && body.spread.length > 0) {
            await supabase.from('plant_health_problem_spread').insert(
                body.spread.map((s: string) => ({ problem_id: problemId, spread_method_id: s }))
            );
        }
        
        // 3. Insert child records (images, symptoms, etc.)
        if (body.images) {
            await supabase.from('plant_health_images').insert(
                body.images.map((i: any) => ({ ...i, problem_id: problemId }))
            );
        }
        if (body.symptoms) {
            await supabase.from('plant_health_symptoms').insert(
                body.symptoms.map((s: any) => ({ ...s, problem_id: problemId }))
            );
        }
        if (body.prevention) {
            await supabase.from('plant_health_prevention').insert(
                body.prevention.map((p: any) => ({ ...p, problem_id: problemId }))
            );
        }
        if (body.controls) {
            await supabase.from('plant_health_control_methods').insert(
                body.controls.map((c: any) => ({ ...c, problem_id: problemId }))
            );
        }
        if (body.videos) {
            await supabase.from('plant_health_videos').insert(
                body.videos.map((v: any) => ({ ...v, problem_id: problemId }))
            );
        }
        if (body.resources) {
            await supabase.from('plant_health_resources').insert(
                body.resources.map((r: any) => ({ ...r, problem_id: problemId }))
            );
        }
        if (body.experts) {
            await supabase.from('plant_health_expert_advice').insert(
                body.experts.map((e: any) => ({ ...e, problem_id: problemId }))
            );
        }
        if (body.sources) {
            await supabase.from('plant_health_sources').insert(
                body.sources.map((s: any) => ({ ...s, problem_id: problemId }))
            );
        }
        
        return res.json(main);
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const updatePlantHealth = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const slug = buildSlug(body.name);
        
        // Update main
        const { data: main, error: mainErr } = await supabase.from('plant_health_problems').update({
            name: body.name,
            slug: slug,
            scientific_name: body.scientific_name,
            problem_type_id: body.problem_type_id,
            category_id: body.category_id,
            risk_level: body.risk_level,
            short_description: body.short_description,
            full_description: body.full_description,
            cause_type: body.cause_type,
            cause_description: body.cause_description,
            season: body.season,
            risk_conditions: body.risk_conditions,
            warning: body.warning,
            status: body.status,
            last_updated: new Date().toISOString()
        }).eq('id', id).select().single();
        
        if (mainErr) return res.status(500).json({ error: "Failed to update record", details: mainErr.message });
        
        // Quick approach for relations: delete old, insert new
        await supabase.from('plant_health_problem_crops').delete().eq('problem_id', id);
        if (body.crops && body.crops.length > 0) {
            await supabase.from('plant_health_problem_crops').insert(
                body.crops.map((c: string) => ({ problem_id: id, crop_id: c }))
            );
        }
        
        await supabase.from('plant_health_problem_parts').delete().eq('problem_id', id);
        if (body.parts && body.parts.length > 0) {
            await supabase.from('plant_health_problem_parts').insert(
                body.parts.map((p: string) => ({ problem_id: id, part_id: p }))
            );
        }
        
        await supabase.from('plant_health_problem_spread').delete().eq('problem_id', id);
        if (body.spread && body.spread.length > 0) {
            await supabase.from('plant_health_problem_spread').insert(
                body.spread.map((s: string) => ({ problem_id: id, spread_method_id: s }))
            );
        }
        
        // For child records, similarly clear and rewrite (or use upsert). 
        // For simplicity, we assume frontend sends the full list and we replace them.
        const replaceChildren = async (table: string, items: any[], fileUrlField?: string) => {
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
        };
        
        await replaceChildren('plant_health_images', body.images, 'image_url');
        await replaceChildren('plant_health_symptoms', body.symptoms);
        await replaceChildren('plant_health_prevention', body.prevention);
        await replaceChildren('plant_health_control_methods', body.controls);
        await replaceChildren('plant_health_videos', body.videos, 'thumbnail_url');
        await replaceChildren('plant_health_resources', body.resources, 'file_url');
        await replaceChildren('plant_health_expert_advice', body.experts);
        await replaceChildren('plant_health_sources', body.sources);
        
        return res.json(main);
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const deletePlantHealth = async (req: Request, res: Response) => {
    console.log("DELETE PLANT HEALTH CONTROLLER REACHED");
    console.log("ID RECEIVED:", req.params.id);
    try {
        const { id } = req.params;

        // 1. Fetch related files for storage cleanup
        const [imagesRes, videosRes, resourcesRes] = await Promise.all([
            supabase.from('plant_health_images').select('image_url').eq('problem_id', id),
            supabase.from('plant_health_videos').select('thumbnail_url').eq('problem_id', id),
            supabase.from('plant_health_resources').select('file_url').eq('problem_id', id)
        ]);

        const filesToDelete: string[] = [];
        const extractPath = (url: string) => {
            if (url && url.includes('/storage/v1/object/public/')) {
                const parts = url.split('/storage/v1/object/public/');
                if (parts.length > 1) {
                    const pathWithQuery = parts[1];
                    const cleanPath = pathWithQuery.split('?')[0];
                    filesToDelete.push(cleanPath);
                }
            }
        };

        if (imagesRes.data) imagesRes.data.forEach((img: any) => extractPath(img.image_url));
        if (videosRes.data) videosRes.data.forEach((vid: any) => extractPath(vid.thumbnail_url));
        if (resourcesRes.data) resourcesRes.data.forEach((res: any) => extractPath(res.file_url));

        // 2. Delete child records (in case ON DELETE CASCADE is missing)
        const childTables = [
            'plant_health_problem_crops', 'plant_health_problem_parts', 'plant_health_problem_spread',
            'plant_health_images', 'plant_health_symptoms', 'plant_health_prevention', 
            'plant_health_control_methods', 'plant_health_videos', 'plant_health_resources', 
            'plant_health_expert_advice', 'plant_health_sources'
        ];

        let childErrors: any[] = [];
        for (const table of childTables) {
            const { error } = await supabase.from(table).delete().eq('problem_id', id);
            if (error) childErrors.push({ table, error });
        }

        if (childErrors.length > 0) {
            console.error("Child deletion errors:", childErrors);
        }

        // 3. Delete parent record
        const { data, error } = await supabase.from('plant_health_problems').delete().eq('id', id);

        if (error) {
            return res.status(500).json({ error: "Failed to delete record", details: error.message, code: error.code });
        }

        // 4. Clean up storage
        const storageErrors: any[] = [];
        if (filesToDelete.length > 0) {
            try {
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
                    const { data, error } = await supabase.storage.from(bucket).remove(paths);
                    if (error) storageErrors.push({ bucket, error });
                }
            } catch (storageErr) {
                console.error("Failed to delete some storage files", storageErr);
                storageErrors.push(storageErr);
            }
        }

        return res.json({ success: true, data, storageErrors, childErrors });
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const updatePlantHealthStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { data, error } = await supabase.from('plant_health_problems').update({ status }).eq('id', id).select().single();
        handleDbResponse(res, data, error, "Failed to update status");
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const uploadPlantHealthImage = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file provided' });
        
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { data, error } = await supabase.storage.from('plant-health-images').upload(fileName, file.buffer, {
            contentType: file.mimetype
        });
        
        if (error) return res.status(500).json({ error: 'Upload failed', details: error.message });
        
        const { data: publicUrl } = supabase.storage.from('plant-health-images').getPublicUrl(fileName);
        return res.json({ url: publicUrl.publicUrl });
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};

export const uploadPlantHealthDocument = async (req: Request, res: Response) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file provided' });
        
        const fileName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { data, error } = await supabase.storage.from('plant-health-documents').upload(fileName, file.buffer, {
            contentType: file.mimetype
        });
        
        if (error) return res.status(500).json({ error: 'Upload failed', details: error.message });
        
        const { data: publicUrl } = supabase.storage.from('plant-health-documents').getPublicUrl(fileName);
        return res.json({ url: publicUrl.publicUrl });
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};



export const getAdminPlantHealthById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('plant_health_problems').select(`
            *,
            plant_health_problem_types ( name ),
            plant_health_categories ( name ),
            plant_health_images ( * ),
            plant_health_symptoms ( * ),
            plant_health_prevention ( * ),
            plant_health_control_methods ( * ),
            plant_health_videos ( * ),
            plant_health_resources ( * ),
            plant_health_expert_advice ( * ),
            plant_health_sources ( * ),
            plant_health_problem_crops ( crop_id ),
            plant_health_problem_parts ( part_id ),
            plant_health_problem_spread ( spread_method_id )
        `).eq('id', id).single();
        
        if (error) {
            return res.status(404).json({ error: "Not found", details: error.message });
        }
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: "Server error", details: err.message });
    }
};



const tableMapping: Record<string, string> = {
    types: 'plant_health_problem_types',
    categories: 'plant_health_categories',
    crops: 'plant_health_crops',
    parts: 'plant_health_affected_parts',
    spreadMethods: 'plant_health_spread_methods',
    riskLevels: 'plant_health_risk_levels',
    seasons: 'plant_health_seasons',
    causeTypes: 'plant_health_cause_types'
};



export const getAdminPlantHealthLookups = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const table = tableMapping[type as string];
        if (!table) return res.status(400).json({ error: "Invalid type" });
        
        const { data, error } = await supabase.from(table).select('*').order('name');
        if (error) throw error;
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const createPlantHealthLookup = async (req: Request, res: Response) => {
    try {
        const { type } = req.params;
        const { name } = req.body;
        const table = tableMapping[type as string];
        if (!table) return res.status(400).json({ error: "Invalid type" });
        
        const { data, error } = await supabase.from(table).insert({ name, is_active: true }).select().single();
        if (error) throw error;
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const updatePlantHealthLookup = async (req: Request, res: Response) => {
    try {
        const { type, id } = req.params;
        const { name, is_active } = req.body;
        const table = tableMapping[type as string];
        if (!table) return res.status(400).json({ error: "Invalid type" });
        
        const { data, error } = await supabase.from(table).update({ name, is_active }).eq('id', id).select().single();
        if (error) throw error;
        return res.json(data);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};

export const deletePlantHealthLookup = async (req: Request, res: Response) => {
    try {
        const { type, id } = req.params;
        const table = tableMapping[type as string];
        if (!table) return res.status(400).json({ error: "Invalid type" });

        // Check for references before deleting
        let isReferenced = false;
        
        if (type === 'types') {
            const { data } = await supabase.from('plant_health_problems').select('id').eq('problem_type_id', id).limit(1);
            isReferenced = data && data.length > 0;
        } else if (type === 'categories') {
            const { data } = await supabase.from('plant_health_problems').select('id').eq('category_id', id).limit(1);
            isReferenced = data && data.length > 0;
        } else if (type === 'crops') {
            const { data } = await supabase.from('plant_health_problem_crops').select('id').eq('crop_id', id).limit(1);
            isReferenced = data && data.length > 0;
        } else if (type === 'parts') {
            const { data } = await supabase.from('plant_health_problem_parts').select('id').eq('part_id', id).limit(1);
            isReferenced = data && data.length > 0;
        } else if (type === 'spreadMethods') {
            const { data } = await supabase.from('plant_health_problem_spread').select('id').eq('spread_method_id', id).limit(1);
            isReferenced = data && data.length > 0;
        } else if (type === 'riskLevels' || type === 'seasons' || type === 'causeTypes') {
            // Because these are text columns in plant_health_problems, we need to find the name first
            const { data: lookupData } = await supabase.from(table).select('name').eq('id', id).single();
            if (lookupData) {
               const column = type === 'riskLevels' ? 'risk_level' : (type === 'seasons' ? 'season' : 'cause_type');
               const { data } = await supabase.from('plant_health_problems').select('id').eq(column, lookupData.name).limit(1);
               isReferenced = data && data.length > 0;
            }
        }
        
        if (isReferenced) {
            // Deactivate instead
            const { data, error } = await supabase.from(table).update({ is_active: false }).eq('id', id).select().single();
            if (error) throw error;
            return res.json({ message: "Lookup is referenced by existing problems. It has been deactivated instead.", data, deactivated: true });
        } else {
            // Delete permanently
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            return res.json({ message: "Lookup deleted successfully.", deleted: true });
        }
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
};
