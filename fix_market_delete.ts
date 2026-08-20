import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

const oldDelete = `export const deleteMarketSetting = async (req: Request, res: Response) => {
    try {
        const { type, id } = req.params; // type: 'market' or 'source'
        const supabase = getAdminSupabaseClient();
        
        if (type === 'market') {
            // Check if used
            const { data: used } = await supabase.from('market_prices').select('id').eq('market_id', id).limit(1);
            if (used && used.length > 0) {
                // Deactivate
                await supabase.from('markets').update({ active: false }).eq('id', id);
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                // Delete
                await supabase.from('markets').delete().eq('id', id);
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        } else if (type === 'source') {
            const { data: used } = await supabase.from('market_prices').select('id').eq('source_id', id).limit(1);
            if (used && used.length > 0) {
                // Deactivate
                await supabase.from('price_sources').update({ active: false }).eq('id', id);
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                // Delete
                await supabase.from('price_sources').delete().eq('id', id);
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        }
        
        res.status(400).json({ success: false, error: 'Invalid type' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};`;

const newDelete = `export const deleteMarketSetting = async (req: Request, res: Response) => {
    try {
        const { type, id } = req.params; // type: 'market' or 'source'
        const supabase = getAdminSupabaseClient();
        
        if (type === 'market') {
            const { data: used, error: checkError } = await supabase.from('market_prices').select('id').eq('market_id', id).limit(1);
            if (checkError) throw checkError;
            
            if (used && used.length > 0) {
                const { error } = await supabase.from('markets').update({ active: false }).eq('id', id);
                if (error) throw error;
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                const { error } = await supabase.from('markets').delete().eq('id', id);
                if (error) throw error;
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        } else if (type === 'source') {
            const { data: used, error: checkError } = await supabase.from('market_prices').select('id').eq('source_id', id).limit(1);
            if (checkError) throw checkError;
            
            if (used && used.length > 0) {
                const { error } = await supabase.from('price_sources').update({ active: false }).eq('id', id);
                if (error) throw error;
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                const { error } = await supabase.from('price_sources').delete().eq('id', id);
                if (error) throw error;
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        }
        
        res.status(400).json({ success: false, error: 'Invalid type' });
    } catch (error: any) {
        console.error("deleteMarketSetting Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync('server/controllers/marketPricesController.ts', content);
