import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';

function sanitizePayload(table: string, body: Record<string, any>) {
  const sanitized: Record<string, any> = { ...body };
  
  // Remove non-table fields that might be joined or passed from UI
  delete sanitized.crop_calendar_crops;
  delete sanitized.crop_calendar_districts;
  delete sanitized.crop_calendar_seasons;
  delete sanitized.created_at;
  delete sanitized.updated_at;

  for (const key of Object.keys(sanitized)) {
    if (sanitized[key] === '') {
      sanitized[key] = null;
    }
  }

  if (sanitized.active_period !== undefined && sanitized.active_period !== null) {
    const val = parseInt(sanitized.active_period, 10);
    sanitized.active_period = isNaN(val) ? null : val;
  }

  if (sanitized.month !== undefined && sanitized.month !== null) {
    const val = parseInt(sanitized.month, 10);
    sanitized.month = isNaN(val) ? null : val;
  }

  // Handle severity case for alerts
  if (table === 'crop_calendar_alerts' && sanitized.severity) {
    const sevMap: Record<string, string> = {
      information: 'Information',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
      Information: 'Information',
      Low: 'Low',
      Medium: 'Medium',
      High: 'High',
      Critical: 'Critical',
    };
    if (sevMap[sanitized.severity]) {
      sanitized.severity = sevMap[sanitized.severity];
    }
  }

  // Ensure valid crop_status
  if (sanitized.status) {
    const s = String(sanitized.status).toLowerCase();
    if (['draft', 'published', 'archived'].includes(s)) {
      sanitized.status = s;
    } else {
      sanitized.status = 'published';
    }
  }

  return sanitized;
}

const createCrud = (table: string) => ({
  getAll: async (req: Request, res: Response) => {
    try {
      const supabase = getAdminSupabaseClient();
      let query: any;
      
      if (
        table === 'crop_calendar_periods' ||
        table === 'crop_calendar_recommendations' ||
        table === 'crop_calendar_activities' ||
        table === 'crop_calendar_before_planting' ||
        table === 'crop_calendar_women_farmer'
      ) {
        query = supabase
          .from(table)
          .select('*, crop_calendar_crops(name), crop_calendar_districts(name), crop_calendar_seasons(name)')
          .order('created_at', { ascending: false });
      } else if (table === 'crop_calendar_alerts') {
        query = supabase
          .from(table)
          .select('*, crop_calendar_crops(name), crop_calendar_districts(name)')
          .order('created_at', { ascending: false });
      } else {
        query = supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) {
        console.error(`[Admin GET ${table}] Supabase error:`, error);
        return res.status(500).json({ error: error.message || 'Database error' });
      }
      res.json(data || []);
    } catch (error: any) {
      console.error(`[Admin GET ${table}] Exception:`, error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  },

  getOne: async (req: Request, res: Response) => {
    try {
      const supabase = getAdminSupabaseClient();
      const { id } = req.params;
      const { data, error } = await supabase.from(table).select('*').eq('id', id).single();
      if (error) {
        return res.status(404).json({ error: error.message || 'Record not found' });
      }
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  create: async (req: Request, res: Response) => {
    const adminUserId = (req as any).user?.id || 'admin';
    const rawBody = req.body;
    const sanitized = sanitizePayload(table, rawBody);

    console.log(`[Admin POST ${table}] Request:`, {
      adminUserId,
      rawBody,
      sanitizedPayload: sanitized,
    });

    // Validation rules
    if (table === 'crop_calendar_alerts') {
      if (!sanitized.title || !String(sanitized.title).trim()) {
        console.warn(`[Admin POST ${table}] Validation failed: Missing title`);
        return res.status(400).json({ error: 'Alert title is required.' });
      }
      if (!sanitized.message || !String(sanitized.message).trim()) {
        console.warn(`[Admin POST ${table}] Validation failed: Missing message`);
        return res.status(400).json({ error: 'Alert message is required.' });
      }
    }

    if (table === 'crop_calendar_before_planting') {
      if (!sanitized.message && !sanitized.title) {
        console.warn(`[Admin POST ${table}] Validation failed: Missing message and title`);
        return res.status(400).json({ error: 'Message / Information or Title is required.' });
      }
    }

    try {
      const supabase = getAdminSupabaseClient();
      const { data, error } = await supabase.from(table).insert(sanitized).select().single();

      if (error) {
        console.error(`[Admin POST ${table}] Supabase Error:`, error);
        const statusCode = error.code === '23502' ? 400 : error.code === '23503' ? 404 : 400;
        return res.status(statusCode).json({ error: error.message, details: error.details, hint: error.hint });
      }

      console.log(`[Admin POST ${table}] Success! Record ID:`, data.id);

      // Log Audit
      try {
        await supabase.from('crop_calendar_audit_logs').insert({
          action: 'CREATE',
          user_id: (req as any).user?.id || null,
          record_type: table,
          record_id: data.id,
        });
      } catch (auditErr) {
        console.warn(`[Admin POST ${table}] Audit log warning:`, auditErr);
      }

      res.status(201).json(data);
    } catch (error: any) {
      console.error(`[Admin POST ${table}] Server Exception:`, error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  update: async (req: Request, res: Response) => {
    const adminUserId = (req as any).user?.id || 'admin';
    const { id } = req.params;
    const rawBody = req.body;
    const sanitized = sanitizePayload(table, rawBody);
    sanitized.updated_at = new Date().toISOString();

    console.log(`[Admin PUT ${table} ${id}] Request:`, {
      adminUserId,
      sanitizedPayload: sanitized,
    });

    if (table === 'crop_calendar_alerts') {
      if (sanitized.title !== undefined && !String(sanitized.title).trim()) {
        return res.status(400).json({ error: 'Alert title cannot be empty.' });
      }
      if (sanitized.message !== undefined && !String(sanitized.message).trim()) {
        return res.status(400).json({ error: 'Alert message cannot be empty.' });
      }
    }

    try {
      const supabase = getAdminSupabaseClient();
      const { data, error } = await supabase.from(table).update(sanitized).eq('id', id).select().single();

      if (error) {
        console.error(`[Admin PUT ${table} ${id}] Supabase Error:`, error);
        return res.status(400).json({ error: error.message, details: error.details });
      }

      // Log Audit
      try {
        await supabase.from('crop_calendar_audit_logs').insert({
          action: 'UPDATE',
          user_id: (req as any).user?.id || null,
          record_type: table,
          record_id: data.id,
        });
      } catch (auditErr) {
        console.warn(`[Admin PUT ${table}] Audit log warning:`, auditErr);
      }

      res.json(data);
    } catch (error: any) {
      console.error(`[Admin PUT ${table} ${id}] Server Exception:`, error);
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const supabase = getAdminSupabaseClient();
      const { id } = req.params;

      try {
        await supabase.from('crop_calendar_audit_logs').insert({
          action: 'DELETE',
          user_id: (req as any).user?.id || null,
          record_type: table,
          record_id: id,
        });
      } catch (auditErr) {
        console.warn(`[Admin DELETE ${table}] Audit log warning:`, auditErr);
      }

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error(`[Admin DELETE ${table} ${id}] Supabase Error:`, error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
});

export const getCrops = createCrud('crop_calendar_crops').getAll;
export const createCrop = createCrud('crop_calendar_crops').create;
export const updateCrop = createCrud('crop_calendar_crops').update;
export const deleteCrop = createCrud('crop_calendar_crops').delete;

export const seasons = createCrud('crop_calendar_seasons');
export const periods = createCrud('crop_calendar_periods');
export const recommendations = createCrud('crop_calendar_recommendations');
export const activities = createCrud('crop_calendar_activities');
export const beforePlanting = createCrud('crop_calendar_before_planting');
export const alerts = createCrud('crop_calendar_alerts');
export const womenFarmer = createCrud('crop_calendar_women_farmer');
export const auditLogs = createCrud('crop_calendar_audit_logs');
