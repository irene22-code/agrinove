import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

// Helper to get admin seller id
const getAdminSellerId = async () => {
    const supabase = getAdminSupabaseClient();
    const { data } = await supabase.from('users').select('id').eq('role', 'admin').limit(1);
    return data?.[0]?.id;
};


export const getAdminMarketPrices = async (req: Request, res: Response) => {
    try {
        const supabase = getAdminSupabaseClient();
        
        const { data, error } = await supabase
            .from('market_prices')
            .select(`
                id, current_price, previous_price, price_change,
                effective_date, expiry_date, status, notes, unit,
                government_document_url, government_document_name, government_document_date, government_document_reference,
                created_at, updated_at,
                product_id, market_id, source_id,
                products ( id, title, category_id, categories ( id, name ) ),
                markets ( id, name ),
                price_sources ( id, name )
            `)
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        
        const mappedData = data.map((p: any) => ({
            id: p.id,
            product_id: p.products?.id,
            product_name: p.products?.title,
            category_name: p.products?.categories?.name,
            category_id: p.products?.categories?.id,
            unit: p.unit,
            current_price: p.current_price,
            previous_price: p.previous_price,
            price_change: p.price_change,
            market_id: p.markets?.id,
            market_name: p.markets?.name,
            source_id: p.price_sources?.id,
            source: p.price_sources?.name,
            notes: p.notes,
            effective_date: p.effective_date,
            expiry_date: p.expiry_date,
            official_document_url: p.government_document_url,
            official_document_name: p.government_document_name,
            official_document_date: p.government_document_date,
            official_document_ref: p.government_document_reference,
            status: p.status,
            created_at: p.created_at,
            updated_at: p.updated_at
        }));
        
        res.status(200).json({ success: true, data: mappedData });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};


export const createMarketPrice = async (req: Request, res: Response) => {
    try {
        const adminId = await getAdminSellerId();
        if (!adminId) return res.status(400).json({ success: false, error: 'Admin seller profile not found' });
        
        const { product_id, unit, current_price, previous_price, market_id, source_id, notes, effective_date, expiry_date, status = 'published', official_document_url, official_document_name, official_document_date, official_document_ref } = req.body;
        
        const supabase = getAdminSupabaseClient();
        
        if (!product_id || !market_id || !source_id) {
            return res.status(400).json({ success: false, error: 'product_id, market_id, and source_id are required' });
        }

        let price_change = 0;
        if (previous_price && previous_price > 0) {
            price_change = ((current_price - previous_price) / previous_price) * 100;
        }

        const { data, error } = await supabase.from('market_prices').insert({
            product_id,
            market_id: market_id,
            source_id: source_id,
            unit: unit || '1 Kg',
            current_price,
            previous_price,
            price_change,
            effective_date: effective_date || null,
            expiry_date: expiry_date || null,
            status,
            notes,
            government_document_url: official_document_url,
            government_document_name: official_document_name,
            government_document_date: official_document_date || null,
            government_document_reference: official_document_ref,
            created_by: (req as any).user?.sub || adminId
        }).select();
        
        if (error) {
            console.error("Supabase insert error:", error);
            throw new Error(`Unable to save Market Price: ${error.message}`);
        }
        
        await supabase.from('market_price_history').insert({
            market_price_id: data[0].id,
            previous_price: previous_price || null,
            new_price: current_price,
            price_change,
            changed_by: (req as any).user?.sub || adminId
        });
        
        res.status(201).json({ success: true, data: data[0] });
    } catch (error: any) {
        console.error("createMarketPrice Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};



export const updateMarketPrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { unit, current_price, previous_price, market_id, source_id, notes, effective_date, expiry_date, status, official_document_url, official_document_name, official_document_date, official_document_ref } = req.body;
        
        const supabase = getAdminSupabaseClient();
        
        let price_change = 0;
        if (previous_price && previous_price > 0) {
            price_change = ((current_price - previous_price) / previous_price) * 100;
        }
        
        // Log to history
        const { data: old } = await supabase.from('market_prices').select('*').eq('id', id).single();
        if (old && old.current_price != current_price) {
            await supabase.from('market_price_history').insert({
                market_price_id: id,
                previous_price: old.current_price,
                new_price: current_price,
                price_change: old.current_price > 0 ? ((current_price - old.current_price) / old.current_price) * 100 : 0,
                changed_by: (req as any).user?.sub
            });
        }
        
        const updateData: any = {
            updated_at: new Date().toISOString()
        };
        
        if (market_id) updateData.market_id = market_id;
        if (source_id) updateData.source_id = source_id;
        
        if (current_price !== undefined) updateData.current_price = current_price;
        if (previous_price !== undefined) updateData.previous_price = previous_price;
        if (price_change !== undefined) updateData.price_change = price_change;
        if (unit) updateData.unit = unit;
        if (status) updateData.status = status;
        if (notes !== undefined) updateData.notes = notes;
        if (effective_date !== undefined) updateData.effective_date = effective_date || null;
        if (expiry_date !== undefined) updateData.expiry_date = expiry_date || null;
        if (official_document_url !== undefined) updateData.government_document_url = official_document_url;
        if (official_document_name !== undefined) updateData.government_document_name = official_document_name;
        if (official_document_date !== undefined) updateData.government_document_date = official_document_date || null;
        if (official_document_ref !== undefined) updateData.government_document_reference = official_document_ref;

        const { data, error } = await supabase.from('market_prices').update(updateData).eq('id', id).select();
        if (error) {
            console.error("Supabase update error:", error);
            throw new Error(`Unable to update Market Price: ${error.message}`);
        }
        
        res.status(200).json({ success: true, data: data[0] });
    } catch (error: any) {
        console.error("updateMarketPrice Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};


export const deleteMarketPrice = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const supabase = getAdminSupabaseClient();
        const { error } = await supabase.from('market_prices').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- SETTINGS (Markets & Sources) ---
export const getMarketSettings = async (req: Request, res: Response) => {
    try {
        const supabase = getAdminSupabaseClient();
        const { data: marketsData } = await supabase.from('markets').select('*').order('name');
        const { data: sourcesData } = await supabase.from('price_sources').select('*').order('name');
        
        let markets = marketsData || [];
        let sources = sourcesData || [];

        res.status(200).json({ success: true, data: { markets, sources } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateMarketSettings = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body; 
        const supabase = getAdminSupabaseClient();
        
        if (key === 'markets') {
            for (const m of value) {
                if (m.archived) {
                    await supabase.from('markets').update({ active: false }).eq('id', m.id);
                } else {
                    await supabase.from('markets').upsert({ id: m.id, name: m.name, location: m.location, active: true });
                }
            }
        } else if (key === 'price_sources') {
            for (const s of value) {
                const sId = typeof s === 'string' ? null : s.id;
                const sName = typeof s === 'string' ? s : s.name;
                const sArch = typeof s === 'string' ? false : s.archived;
                
                if (sArch && sId) {
                    await supabase.from('price_sources').update({ active: false }).eq('id', sId);
                } else {
                    await supabase.from('price_sources').upsert({ id: sId || ('s_' + Date.now()), name: sName, active: true });
                }
            }
        }
        
        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const uploadMarketDocument = async (req: Request, res: Response) => {
    try {
        const file = req.file as Express.Multer.File;
        if (!file) {
            return res.status(400).json({ success: false, error: 'No document file provided' });
        }
        
        const supabase = getAdminSupabaseClient();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
        const fileName = `market_doc_${Date.now()}_${sanitizedName}`;
        
        const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });
            
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
            
        res.status(200).json({ success: true, data: { url: publicUrlData.publicUrl } });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};


export const getPublicMarketPrices = async (req: Request, res: Response) => {
    try {
        const supabase = getAdminSupabaseClient();
        const { sort } = req.query;
        
        const { data, error } = await supabase
            .from('market_prices')
            .select(`
                id, current_price, previous_price, price_change,
                effective_date, expiry_date, status, notes, unit,
                government_document_url, government_document_name, government_document_date, government_document_reference,
                created_at, updated_at,
                product_id, market_id, source_id,
                products ( id, title, category_id, categories ( id, name ) ),
                markets ( id, name, location ),
                price_sources ( id, name )
            `)
            .eq('status', 'published');
            
        if (error) throw error;
        
        // Filter out expired ones
        let mappedData = data
            .map((p: any) => ({
                id: p.id,
                product_id: p.products?.id,
                product_name: p.products?.title,
                category_name: p.products?.categories?.name,
                category_id: p.products?.categories?.id,
                unit: p.unit,
                current_price: p.current_price,
                previous_price: p.previous_price,
                price_change: p.price_change,
                market_id: p.markets?.id,
                market_name: p.markets?.name,
                market_location: p.markets?.location,
                source_id: p.price_sources?.id,
                source: p.price_sources?.name,
                notes: p.notes,
                effective_date: p.effective_date,
                expiry_date: p.expiry_date,
                official_document_url: p.government_document_url,
                official_document_name: p.government_document_name,
                official_document_date: p.government_document_date,
                official_document_ref: p.government_document_reference,
                status: p.status,
                created_at: p.created_at,
                updated_at: p.updated_at
            }))
            .filter((p: any) => !p.expiry_date || new Date(p.expiry_date) > new Date());
            
        if (sort === 'highest') {
            mappedData = mappedData.sort((a: any, b: any) => b.current_price - a.current_price);
        } else if (sort === 'lowest') {
            mappedData = mappedData.sort((a: any, b: any) => a.current_price - b.current_price);
        } else {
            mappedData = mappedData.sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        }

        res.status(200).json({ success: true, data: mappedData });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};


export const deleteMarketSetting = async (req: Request, res: Response) => {
    console.log("DELETE CLICKED - ROUTE ACCESSED");
    try {
        const { type, id } = req.params; // type: 'market' or 'source'
        console.log(`TYPE: ${type}`);
        console.log(`ID: ${id}`);
        console.log(`API: DELETE /api/admin/market-settings/${type}/${id}`);
        console.log(`BACKEND RECEIVED`);
        
        const supabase = getAdminSupabaseClient();
        
        if (type === 'market') {
            console.log(`SUPABASE DELETE START for market_id: ${id}`);
            const { data: used, error: checkError } = await supabase.from('market_prices').select('id').eq('market_id', id).limit(1);
            if (checkError) {
                console.error("Check error:", checkError);
                throw checkError;
            }
            
            if (used && used.length > 0) {
                console.log(`MARKET IS USED, ATTEMPTING TO DEACTIVATE...`);
                const { error, data } = await supabase.from('markets').update({ active: false }).eq('id', id).select();
                if (error) {
                    console.error("Deactivate error:", error);
                    throw error;
                }
                console.log(`SUPABASE RESULT (deactivate):`, data);
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                console.log(`MARKET IS UNUSED, ATTEMPTING TO DELETE...`);
                const { error, data } = await supabase.from('markets').delete().eq('id', id).select();
                if (error) {
                    console.error("Delete error:", error);
                    throw error;
                }
                console.log(`SUPABASE RESULT (delete):`, data);
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        } else if (type === 'source') {
            console.log(`SUPABASE DELETE START for source_id: ${id}`);
            const { data: used, error: checkError } = await supabase.from('market_prices').select('id').eq('source_id', id).limit(1);
            if (checkError) {
                console.error("Check error:", checkError);
                throw checkError;
            }
            
            if (used && used.length > 0) {
                console.log(`SOURCE IS USED, ATTEMPTING TO DEACTIVATE...`);
                const { error, data } = await supabase.from('price_sources').update({ active: false }).eq('id', id).select();
                if (error) {
                    console.error("Deactivate error:", error);
                    throw error;
                }
                console.log(`SUPABASE RESULT (deactivate):`, data);
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                console.log(`SOURCE IS UNUSED, ATTEMPTING TO DELETE...`);
                const { error, data } = await supabase.from('price_sources').delete().eq('id', id).select();
                if (error) {
                    console.error("Delete error:", error);
                    throw error;
                }
                console.log(`SUPABASE RESULT (delete):`, data);
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        }
        
        console.log(`ERROR: INVALID TYPE ${type}`);
        res.status(400).json({ success: false, error: 'Invalid type' });
    } catch (error: any) {
        console.error("deleteMarketSetting Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
