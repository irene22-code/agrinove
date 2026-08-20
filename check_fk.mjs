import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
    // Let's create a conversation, add a message, then try to delete the conversation.
    const { data: conv } = await supabase.from('ai_conversations').insert({
        title: 'FK test',
        user_id: '6890c2ce-f93e-445c-b068-1f1b19cae853'
    }).select().single();
    
    console.log("Created conv:", conv.id);
    
    const { data: msg, error: msgErr } = await supabase.from('ai_messages').insert({
        conversation_id: conv.id,
        role: 'user',
        content: 'hello'
    }).select().single();
    
    if (msgErr) console.log("Msg insert err:", msgErr);
    
    const { error: delErr } = await supabase.from('ai_conversations').delete().eq('id', conv.id);
    if (delErr) {
        console.log("Delete error:", delErr);
    } else {
        console.log("Deleted successfully! Cascade is working.");
    }
})();
