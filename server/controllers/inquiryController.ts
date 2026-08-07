import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const createInquiry = async (req: Request, res: Response) => {
  try {
    const buyer_id = req.user.sub;
    const { seller_id, product_id, subject, message } = req.body;
    
    if (!seller_id || !product_id || !message) {
      return res.status(400).json({ success: false, error: 'seller_id, product_id, and message are required' });
    }

    const supabase = getAdminSupabaseClient();
    
    // Create the inquiry
    const { data: inquiry, error: inquiryError } = await supabase.from('inquiries').insert({
      buyer_id,
      seller_id,
      product_id,
      subject: subject || 'Product Inquiry',
      status: 'pending'
    }).select().single();

    if (inquiryError) throw inquiryError;

    // Create the initial message
    const { error: msgError } = await supabase.from('messages').insert({
      inquiry_id: inquiry.id,
      sender_id: buyer_id,
      content: message,
      read_at: null
    });

    if (msgError) throw msgError;

    // Notify the seller
    await supabase.from('notifications').insert({
      user_id: seller_id,
      type: 'new_inquiry',
      title: 'New Product Inquiry',
      content: `You have received a new inquiry from a buyer.`,
      link: `/seller/inquiries/${inquiry.id}`
    });

    res.status(201).json({ success: true, data: inquiry });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const role = req.user.role || req.user.user_metadata?.role;
    
    const supabase = getAdminSupabaseClient();
    
    let query = supabase.from('inquiries').select(`
      *,
      products(title, product_images(url, is_primary)),
      users!inquiries_buyer_id_fkey(full_name),
      sellers(business_name)
    `).order('created_at', { ascending: false });
    
    if (role === 'seller') {
      query = query.eq('seller_id', user_id);
    } else if (role === 'buyer') {
      query = query.eq('buyer_id', user_id);
    }

    const { data, error } = await query;
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInquiryById = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { id } = req.params;
    
    const supabase = getAdminSupabaseClient();
    
    const { data: inquiry, error } = await supabase.from('inquiries').select(`
      *,
      products(title, price, product_images(url, is_primary)),
      users!inquiries_buyer_id_fkey(full_name, email),
      sellers(business_name)
    `).eq('id', id).single();
      
    if (error) throw error;
    
    if (inquiry.buyer_id !== user_id && inquiry.seller_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to view this inquiry' });
    }

    res.status(200).json({ success: true, data: inquiry });
  } catch (error: any) {
    res.status(404).json({ success: false, error: 'Inquiry not found' });
  }
};

export const updateInquiryStatus = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.sub;
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'read', 'responded', 'closed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const supabase = getAdminSupabaseClient();
    
    const { data: inquiry, error: fetchErr } = await supabase.from('inquiries').select('buyer_id, seller_id').eq('id', id).single();
    
    if (fetchErr || !inquiry) {
        return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    if (inquiry.buyer_id !== user_id && inquiry.seller_id !== user_id) {
       return res.status(403).json({ success: false, error: 'Unauthorized to update this inquiry' });
    }

    const { data, error } = await supabase.from('inquiries').update({ status }).eq('id', id).select().single();
      
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
