import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    const supabase = getAdminSupabaseClient();
    
    const { data, error } = await supabase.from('contact_messages').insert({
      name,
      email,
      subject: subject || 'No Subject',
      message
    }).select().single();

    if (error) {
      // Create table if it doesn't exist? Wait, we might need to create it using SQL. Let's just create it.
      throw error;
    }

    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
