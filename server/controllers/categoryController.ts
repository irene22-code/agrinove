import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getCategories = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').select('*').order('name', { ascending: true });
    
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, parent_id, icon_url } = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').insert({
      name, slug, description, parent_id, icon_url
    }).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single();
    if (error) throw error;
    res.status(200).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
