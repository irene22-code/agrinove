import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

const oldDeleteConv = `export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = getUserIdFromReq(req);
        const supabase = getAdminSupabaseClient();
        const { data: conv } = await supabase.from('ai_conversations').select('user_id').eq('id', id).single();
        if (conv && conv.user_id && conv.user_id !== userId) {
            res.status(403).json({ error: "Unauthorized" });
            return;
        }
        
        // Delete associated files from storage first`;

const newDeleteConv = `export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = getUserIdFromReq(req);
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const supabase = getAdminSupabaseClient();
        const { data: conv, error: fetchErr } = await supabase.from('ai_conversations').select('user_id').eq('id', id).maybeSingle();
        
        if (fetchErr) throw fetchErr;
        
        if (!conv) {
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        if (conv.user_id !== userId) {
            res.status(403).json({ error: "Unauthorized access to this conversation." });
            return;
        }
        
        // Delete associated files from storage first`;

content = content.replace(oldDeleteConv, newDeleteConv);
fs.writeFileSync(file, content);
console.log('Controller patched!');
