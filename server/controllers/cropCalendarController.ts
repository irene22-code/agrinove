import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

export const getPublicCrops = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase
      .from('crop_calendar_crops')
      .select('*')
      .eq('status', 'published');
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDistricts = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('crop_calendar_districts').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSeasons = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('crop_calendar_seasons').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, season_id, month } = req.query;
    
    let query = supabase.from('crop_calendar_recommendations').select('*, crop_calendar_crops(*)').eq('status', 'published');
    
    if (district_id) query = query.or(`district_id.eq.${district_id},district_id.is.null`);
    if (season_id) query = query.or(`season_id.eq.${season_id},season_id.is.null`);
    if (month) query = query.or(`month.eq.${month},month.is.null`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getActivities = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, season_id, month } = req.query;
    
    let query = supabase.from('crop_calendar_activities').select('*, crop_calendar_crops(*)').eq('status', 'published').order('priority', { ascending: false });
    
    if (district_id) query = query.or(`district_id.eq.${district_id},district_id.is.null`);
    if (season_id) query = query.or(`season_id.eq.${season_id},season_id.is.null`);
    if (month) query = query.or(`month.eq.${month},month.is.null`);

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPeriods = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { data, error } = await supabase.from('crop_calendar_periods').select('*, crop_calendar_crops(*)').eq('status', 'published');
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, crop_id } = req.query;
    
    let query = supabase.from('crop_calendar_alerts').select('*').eq('status', 'published');
    
    if (district_id) {
      query = query.or(`district_id.eq.${district_id},district_id.is.null`);
    }
    if (crop_id) {
      query = query.or(`crop_id.eq.${crop_id},crop_id.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // In-memory filter for active dates since Supabase OR syntax can get tricky
    // with multiple chained ORs and IS NULLs
    const now = new Date();
    const activeData = (data || []).filter((alert: any) => {
      let isActive = true;
      if (alert.start_date) {
        const start = new Date(alert.start_date);
        if (now < start) isActive = false;
      }
      if (alert.end_date) {
        const end = new Date(alert.end_date);
        if (now > end) isActive = false;
      }
      return isActive;
    });

    res.json(activeData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getBeforePlanting = async (req: Request, res: Response) => {
  try {
    const supabase = getAdminSupabaseClient();
    const { district_id, crop_id, month, season_id } = req.query;
    
    let query = supabase.from('crop_calendar_before_planting').select('*').eq('status', 'published');
    
    if (district_id) {
      query = query.or(`district_id.eq.${district_id},district_id.is.null`);
    }
    if (crop_id) {
      query = query.or(`crop_id.eq.${crop_id},crop_id.is.null`);
    }
    if (season_id) {
      query = query.or(`season_id.eq.${season_id},season_id.is.null`);
    }
    if (month) {
      query = query.or(`active_period.eq.${month},active_period.is.null`);
    }

    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
