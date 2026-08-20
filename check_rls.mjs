import pg from 'pg';
const { Client } = pg;
const dbUrl = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', '%5Birene%402026%40NDANGA%5D');
const client = new Client({ connectionString: dbUrl });
await client.connect();

// Enable RLS for ai_conversations
await client.query(`
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_conversations_owner ON ai_conversations;
CREATE POLICY ai_conversations_owner ON ai_conversations 
    FOR ALL USING (user_id = auth.uid());
`);

// Enable RLS for ai_messages
await client.query(`
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_messages_owner ON ai_messages;
CREATE POLICY ai_messages_owner ON ai_messages 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_conversations 
            WHERE ai_conversations.id = ai_messages.conversation_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );
`);

// Enable RLS for ai_message_attachments
await client.query(`
ALTER TABLE ai_message_attachments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_message_attachments_owner ON ai_message_attachments;
CREATE POLICY ai_message_attachments_owner ON ai_message_attachments 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM ai_messages
            JOIN ai_conversations ON ai_conversations.id = ai_messages.conversation_id
            WHERE ai_messages.id = ai_message_attachments.message_id 
            AND ai_conversations.user_id = auth.uid()
        )
    );
`);

console.log("RLS policies applied successfully!");
await client.end();
