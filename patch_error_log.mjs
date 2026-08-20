import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

const oldDelete = `        const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', id);
        
        if (error) throw error;`;

const newDelete = `        const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error("[AI DELETE] Database delete error:", error);
            throw error;
        }`;

content = content.replace(oldDelete, newDelete);
fs.writeFileSync(file, content);
console.log('Patched error logging');
