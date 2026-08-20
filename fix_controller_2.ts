import fs from 'fs';
let content = fs.readFileSync('server/controllers/marketPricesController.ts', 'utf8');

// Replace createMarketPrice
const createFunction = `
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
            effective_date,
            expiry_date,
            status,
            notes,
            government_document_url: official_document_url,
            government_document_name: official_document_name,
            government_document_date: official_document_date,
            government_document_reference: official_document_ref,
            created_by: (req as any).user?.sub || adminId
        }).select();
        
        if (error) {
            console.error("Supabase insert error:", error);
            throw new Error(\`Unable to save Market Price: \${error.message}\`);
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
`;

content = content.replace(/export const createMarketPrice = async \(req: Request, res: Response\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);\n    \}\n\};/, createFunction);

// Replace updateMarketPrice similarly to remove the lookup logic
const updateFunction = `
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
        if (effective_date !== undefined) updateData.effective_date = effective_date;
        if (expiry_date !== undefined) updateData.expiry_date = expiry_date;
        if (official_document_url !== undefined) updateData.government_document_url = official_document_url;
        if (official_document_name !== undefined) updateData.government_document_name = official_document_name;
        if (official_document_date !== undefined) updateData.government_document_date = official_document_date;
        if (official_document_ref !== undefined) updateData.government_document_reference = official_document_ref;

        const { data, error } = await supabase.from('market_prices').update(updateData).eq('id', id).select();
        if (error) {
            console.error("Supabase update error:", error);
            throw new Error(\`Unable to update Market Price: \${error.message}\`);
        }
        
        res.status(200).json({ success: true, data: data[0] });
    } catch (error: any) {
        console.error("updateMarketPrice Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
};
`;

content = content.replace(/export const updateMarketPrice = async \(req: Request, res: Response\) => \{[\s\S]*?res\.status\(500\)\.json\(\{ success: false, error: error\.message \}\);\n    \}\n\};/, updateFunction);

fs.writeFileSync('server/controllers/marketPricesController.ts', content);
