import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

const oldDelete = `export const deleteMarketSetting = async (req: Request, res: Response) => {
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

const newDelete = `export const deleteMarketSetting = async (req: Request, res: Response) => {
    console.log("DELETE CLICKED - ROUTE ACCESSED");
    try {
        const { type, id } = req.params; // type: 'market' or 'source'
        console.log(\`TYPE: \${type}\`);
        console.log(\`ID: \${id}\`);
        console.log(\`API: DELETE /api/admin/market-settings/\${type}/\${id}\`);
        console.log(\`BACKEND RECEIVED\`);
        
        const supabase = getAdminSupabaseClient();
        
        if (type === 'market') {
            console.log(\`SUPABASE DELETE START for market_id: \${id}\`);
            const { data: used, error: checkError } = await supabase.from('market_prices').select('id').eq('market_id', id).limit(1);
            if (checkError) {
                console.error("Check error:", checkError);
                throw checkError;
            }
            
            if (used && used.length > 0) {
                console.log(\`MARKET IS USED, ATTEMPTING TO DEACTIVATE...\`);
                const { error, data } = await supabase.from('markets').update({ active: false }).eq('id', id).select();
                if (error) {
                    console.error("Deactivate error:", error);
                    throw error;
                }
                console.log(\`SUPABASE RESULT (deactivate):\`, data);
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                console.log(\`MARKET IS UNUSED, ATTEMPTING TO DELETE...\`);
                const { error, data } = await supabase.from('markets').delete().eq('id', id).select();
                if (error) {
                    console.error("Delete error:", error);
                    throw error;
                }
                console.log(\`SUPABASE RESULT (delete):\`, data);
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        } else if (type === 'source') {
            console.log(\`SUPABASE DELETE START for source_id: \${id}\`);
            const { data: used, error: checkError } = await supabase.from('market_prices').select('id').eq('source_id', id).limit(1);
            if (checkError) {
                console.error("Check error:", checkError);
                throw checkError;
            }
            
            if (used && used.length > 0) {
                console.log(\`SOURCE IS USED, ATTEMPTING TO DEACTIVATE...\`);
                const { error, data } = await supabase.from('price_sources').update({ active: false }).eq('id', id).select();
                if (error) {
                    console.error("Deactivate error:", error);
                    throw error;
                }
                console.log(\`SUPABASE RESULT (deactivate):\`, data);
                return res.status(200).json({ success: true, action: 'deactivated' });
            } else {
                console.log(\`SOURCE IS UNUSED, ATTEMPTING TO DELETE...\`);
                const { error, data } = await supabase.from('price_sources').delete().eq('id', id).select();
                if (error) {
                    console.error("Delete error:", error);
                    throw error;
                }
                console.log(\`SUPABASE RESULT (delete):\`, data);
                return res.status(200).json({ success: true, action: 'deleted' });
            }
        }
        
        console.log(\`ERROR: INVALID TYPE \${type}\`);
        res.status(400).json({ success: false, error: 'Invalid type' });
    } catch (error: any) {
        console.error("deleteMarketSetting Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync('server/controllers/marketPricesController.ts', content);
