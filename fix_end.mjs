import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

const regex = /const \{ error \} = await supabase\s*\.from\('ai_conversations'\)\s*\.delete\(\)\s*\.eq\('id', id\);\s*if \(error\) throw error;\s*res\.json\(\{ success: true \}\);/;

if (regex.test(content)) {
    content = content.replace(regex, `const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error("[AI DELETE] Database delete error:", error);
            throw error;
        }

        console.log("[AI DELETE] Successfully deleted from db:", id);
        res.json({ success: true });`);
    fs.writeFileSync(file, content);
    console.log("Fixed end of deleteConversation!");
} else {
    console.log("Regex didn't match.");
}
