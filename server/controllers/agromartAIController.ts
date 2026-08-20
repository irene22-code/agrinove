import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase.js';
import { processChat } from '../services/agromartAIService.js';
import { v4 as uuidv4 } from 'uuid';


import jwt from 'jsonwebtoken';

function getUserIdFromReq(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    try {
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || '';
        const decoded: any = jwt.verify(token, jwtSecret);
        return decoded.sub || null;
    } catch(e) {
        return null;
    }
}

export const handleChat = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, conversationId, attachments = [], context } = req.body;
        const userId = getUserIdFromReq(req);
        const supabase = getAdminSupabaseClient();
        
        let activeConversationId = conversationId;
        let history = [];
        
        if (!activeConversationId) {
            // Create new conversation
            const userId = getUserIdFromReq(req);
        const { data: conv, error: convErr } = await supabase
                .from('ai_conversations')
                .insert({
                    user_id: userId || null,
                    title: message.substring(0, 50) || 'New Conversation'
                })
                .select('id')
                .single();
                
            if (convErr) throw convErr;
        
        // Security check: If the conversation belongs to a user, only that user can access it.
        if (conv.user_id && conv.user_id !== userId) {
            res.status(403).json({ error: "Unauthorized access to this conversation." });
            return;
        }
            activeConversationId = conv.id;
        } else {
            // Fetch history
            const { data: historyData, error: histErr } = await supabase
                .from('ai_messages')
                .select('role, content')
                .eq('conversation_id', activeConversationId)
                .order('created_at', { ascending: true })
                .limit(20);
                
            if (histErr) throw histErr;
            history = historyData || [];
        }

        // Save user message
        const { data: userMsg, error: userMsgErr } = await supabase
            .from('ai_messages')
            .insert({
                conversation_id: activeConversationId,
                role: 'user',
                content: message || ''
            })
            .select('id')
            .single();
            
        if (userMsgErr) throw userMsgErr;

        // Process attachments (upload to supabase storage)
        const parsedAttachments = [];
        for (const att of attachments) {
            // att: { data: base64 (without data:image/png;base64, prefix), mimeType: string, name: string }
            const buffer = Buffer.from(att.data, 'base64');
            const fileExt = att.name.split('.').pop();
            
            // Gemini natively supports pdf and txt via inline data well.
            // If it's a generic document type that isn't PDF or TXT, it might fail.
            // But we pass it and let Gemini handle it if it can. If not, the error is caught.
            const fileName = `${uuidv4()}.${fileExt}`;
            const bucket = att.mimeType.startsWith('image/') ? 'agromart-ai-images' : 'agromart-ai-documents';
            
            const { data: uploadData, error: uploadErr } = await supabase.storage
                .from(bucket)
                .upload(fileName, buffer, { contentType: att.mimeType });
                
            if (uploadErr) {
                console.error("Upload error:", uploadErr);
                continue; // Skip failed uploads
            }
            
            await supabase.from('ai_message_attachments').insert({
                message_id: userMsg.id,
                file_type: att.mimeType.split('/')[0],
                file_name: att.name,
                storage_path: uploadData.path,
                mime_type: att.mimeType,
                file_size: buffer.length
            });
            
            parsedAttachments.push({
                mimeType: att.mimeType,
                data: att.data
            });
        }

        // Call Gemini
        const aiResponseText = await processChat(history, message, parsedAttachments, context);

        // Save model message
        await supabase
            .from('ai_messages')
            .insert({
                conversation_id: activeConversationId,
                role: 'model',
                content: aiResponseText
            });
            
        // Update conversation timestamp
        await supabase
            .from('ai_conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', activeConversationId);

        res.json({
            conversationId: activeConversationId,
            message: aiResponseText
        });
        
    } catch (error: any) {
        console.error("handleChat error:", error);
        res.status(error.statusCode || 500).json({ error: error.message || "Failed to process chat." });
    }
};

export const getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = getUserIdFromReq(req);
        if (!userId) {
            res.json([]);
            return;
        }
        const supabase = getAdminSupabaseClient();
        const { data, error } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });
            
        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const userId = getUserIdFromReq(req);
        const supabase = getAdminSupabaseClient();
        
        const { data: conv, error: convErr } = await supabase
            .from('ai_conversations')
            .select('*')
            .eq('id', id)
            .single();
            
        if (convErr) throw convErr;
        
        // Ensure user isolation
        if (conv.user_id && conv.user_id !== userId) {
            res.status(403).json({ error: "Unauthorized access to this conversation." });
            return;
        }
        
        const { data: messages, error: msgErr } = await supabase
            .from('ai_messages')
            .select('*, ai_message_attachments(*)')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });
            
        if (msgErr) throw msgErr;
        
        // Convert attachment paths to public URLs
        if (messages) {
           for (const msg of messages) {
               if (msg.ai_message_attachments) {
                   for (const att of msg.ai_message_attachments) {
                       const bucket = att.file_type === 'image' ? 'agromart-ai-images' : 'agromart-ai-documents';
                       const { data } = supabase.storage.from(bucket).getPublicUrl(att.storage_path);
                       att.publicUrl = data.publicUrl;
                   }
               }
           }
        }
        
        res.json({ conversation: conv, messages });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteConversation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        console.log("[AI DELETE] backend route reached", id);
        console.log("[AI DELETE] params", req.params);
        
        const userId = getUserIdFromReq(req);
        console.log("[AI DELETE] authenticated user", userId);
        
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const supabase = getAdminSupabaseClient();
        const { data: conv, error: fetchErr } = await supabase.from('ai_conversations').select('user_id').eq('id', id).maybeSingle();
        
        if (fetchErr) throw fetchErr;
        
        if (!conv) {
            console.log("[AI DELETE] conversation not found", id);
            res.status(404).json({ error: "Conversation not found" });
            return;
        }

        if (conv.user_id !== userId) {
            console.log("[AI DELETE] user_id mismatch", conv.user_id, userId);
            res.status(403).json({ error: "Unauthorized access to this conversation." });
            return;
        }
        
        console.log("[AI DELETE] Validated delete request for conversation:", id);
        
        // Delete associated files from storage first
        const { data: messages } = await supabase
            .from('ai_messages')
            .select('id, ai_message_attachments(storage_path, file_type)')
            .eq('conversation_id', id);
            
        if (messages) {
            const imagePaths: string[] = [];
            const docPaths: string[] = [];
            
            messages.forEach(msg => {
                msg.ai_message_attachments?.forEach((att: any) => {
                    if (att.file_type === 'image') imagePaths.push(att.storage_path);
                    else docPaths.push(att.storage_path);
                });
            });
            
            try {
                if (imagePaths.length > 0) {
                    await supabase.storage.from('agromart-ai-images').remove(imagePaths);
                }
                if (docPaths.length > 0) {
                    await supabase.storage.from('agromart-ai-documents').remove(docPaths);
                }
            } catch (storageErr) {
                console.error("[AI DELETE] Error deleting storage files (ignoring):", storageErr);
            }
        }
        
        // Now delete conversation (cascade handles messages and attachments tables)
        const { error } = await supabase
            .from('ai_conversations')
            .delete()
            .eq('id', id);
        
        if (error) {
            console.error("[AI DELETE] Database delete error:", error);
            throw error;
        }

        console.log("[AI DELETE] Successfully deleted from db:", id);
        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

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
