import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

const newCode = `
export const deleteAllConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromReq(req);
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const supabase = getAdminSupabaseClient();
        
        // Find all conversations for this user
        const { data: convs } = await supabase
            .from('ai_conversations')
            .select('id')
            .eq('user_id', userId);
            
        if (convs && convs.length > 0) {
            const convIds = convs.map(c => c.id);
            
            // Delete associated files from storage first
            const { data: messages } = await supabase
                .from('ai_messages')
                .select('id, ai_message_attachments(storage_path, file_type)')
                .in('conversation_id', convIds);
                
            if (messages) {
                const imagePaths: string[] = [];
                const docPaths: string[] = [];
                
                messages.forEach(msg => {
                    msg.ai_message_attachments?.forEach((att: any) => {
                        if (att.file_type === 'image') imagePaths.push(att.storage_path);
                        else docPaths.push(att.storage_path);
                    });
                });
                
                if (imagePaths.length > 0) {
                    await supabase.storage.from('agromart-ai-images').remove(imagePaths);
                }
                if (docPaths.length > 0) {
                    await supabase.storage.from('agromart-ai-documents').remove(docPaths);
                }
            }
            
            // Now delete conversations (cascade handles messages and attachments tables)
            const { error } = await supabase
                .from('ai_conversations')
                .delete()
                .in('id', convIds);
                
            if (error) throw error;
        }

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
`;

content += newCode;
fs.writeFileSync(file, content);

const routesFile = 'server/routes/agromartAIRoutes.ts';
let routesContent = fs.readFileSync(routesFile, 'utf8');

routesContent = routesContent.replace(
    "import { handleChat, getConversations, getConversation, deleteConversation } from '../controllers/agromartAIController.js';",
    "import { handleChat, getConversations, getConversation, deleteConversation, deleteAllConversations } from '../controllers/agromartAIController.js';"
);

routesContent = routesContent.replace(
    "router.delete('/conversations/:id', deleteConversation);",
    "router.delete('/conversations', deleteAllConversations);\nrouter.delete('/conversations/:id', deleteConversation);"
);

fs.writeFileSync(routesFile, routesContent);
console.log('Backend patched!');
