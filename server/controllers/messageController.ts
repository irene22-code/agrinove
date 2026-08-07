import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getMessages = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { inquiry_id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    // Check authorization on the inquiry
    const { data: inquiry, error: inquiryError } = await supabase.from('inquiries').select('buyer_id, seller_id').eq('id', inquiry_id).single();
    if (inquiryError || !inquiry) {
        return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    if (inquiry.buyer_id !== user_id && inquiry.seller_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to view messages for this inquiry' });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*, users!messages_sender_id_fkey(full_name)')
      .eq('inquiry_id', inquiry_id)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const sender_id = req.user.sub;
    const { inquiry_id } = req.params;
    const { content } = req.body;
    
    if (!content) {
        return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const supabase = getAdminSupabaseClient();
    
    // Check authorization on the inquiry
    const { data: inquiry, error: inquiryError } = await supabase.from('inquiries').select('buyer_id, seller_id').eq('id', inquiry_id).single();
    if (inquiryError || !inquiry) {
        return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    if (inquiry.buyer_id !== sender_id && inquiry.seller_id !== sender_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to send messages for this inquiry' });
    }

    const { data, error } = await supabase.from('messages').insert({
        inquiry_id,
        sender_id,
        content,
        read_at: null
    }).select().single();
      
    if (error) throw error;

    // Determine receiver
    const receiver_id = sender_id === inquiry.buyer_id ? inquiry.seller_id : inquiry.buyer_id;

    // Update inquiry status
    const newStatus = sender_id === inquiry.buyer_id ? 'pending' : 'responded';
    await supabase.from('inquiries').update({ status: newStatus }).eq('id', inquiry_id);

    // Notify receiver
    await supabase.from('notifications').insert({
        user_id: receiver_id,
        type: 'new_message',
        title: 'New Message Received',
        content: `You have received a new message regarding an inquiry.`,
        link: sender_id === inquiry.buyer_id ? `/seller/inquiries/${inquiry_id}` : `/buyer/inquiries/${inquiry_id}`
    });

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const markMessageRead = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { message_id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    // Check message existence
    const { data: message, error: fetchErr } = await supabase.from('messages').select('inquiry_id, sender_id').eq('id', message_id).single();
    if (fetchErr || !message) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    // Check inquiry auth
    const { data: inquiry } = await supabase.from('inquiries').select('buyer_id, seller_id').eq('id', message.inquiry_id).single();
    
    if (!inquiry || (inquiry.buyer_id !== user_id && inquiry.seller_id !== user_id)) {
       return res.status(403).json({ success: false, error: 'Unauthorized to mark this message' });
    }
    
    // Users can only mark messages sent BY the other person as read
    if (message.sender_id === user_id) {
       return res.status(400).json({ success: false, error: 'Cannot mark own message as read' });
    }

    const { data, error } = await supabase.from('messages').update({ read_at: new Date().toISOString() }).eq('id', message_id).select().single();
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { message_id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    const { data: message, error: fetchErr } = await supabase.from('messages').select('sender_id').eq('id', message_id).single();
    if (fetchErr || !message) {
        return res.status(404).json({ success: false, error: 'Message not found' });
    }
    
    if (message.sender_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Only the sender can delete a message' });
    }

    const { error } = await supabase.from('messages').delete().eq('id', message_id);
      
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const markAllMessagesRead = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { inquiry_id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    const { error } = await supabase.from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('inquiry_id', inquiry_id)
      .is('read_at', null)
      .neq('sender_id', user_id);
      
    if (error) throw error;
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};