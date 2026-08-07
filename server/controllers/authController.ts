import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';
import { Client } from 'pg';
import jwt from 'jsonwebtoken';

const getPgClient = async () => {
  const url = process.env.DATABASE_URL!.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
  const client = new Client({ connectionString: url });
  await client.connect();
  return client;
};

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role, aud: 'authenticated' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const registerBuyer = async (req: Request, res: Response) => {
  let client;
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'Email, password, and full_name are required' });
    }

    client = await getPgClient();
    
    // Check if user exists
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
       return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const result = await client.query(`
      INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, aud, role) 
      VALUES (
          gen_random_uuid(), 
          $1, 
          crypt($2, gen_salt('bf')),
          $3, 
          'authenticated', 
          'authenticated'
      ) RETURNING id;
    `, [email, password, JSON.stringify({ full_name, role: 'buyer' })]);

    const user = { id: result.rows[0].id, email, full_name, role: 'buyer' };
    const token = generateToken(user.id, user.role);

    res.status(201).json({ success: true, data: { user, session: { access_token: token } } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || String(error) });
  } finally {
    if (client) await client.end();
  }
};


export const registerSeller = async (req: Request, res: Response) => {
  let client;
  try {
    const { email, password, full_name, business_name, phone_number, whatsapp_number, address, location, about } = req.body;
    if (!email || !password || !full_name || !business_name) {
      return res.status(400).json({ success: false, error: 'Email, password, full_name, and business_name are required' });
    }

    client = await getPgClient();
    
    const existing = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (existing.rows.length > 0) { 
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    let avatar_url = null;
    const adminSupabase = getAdminSupabaseClient();

    if (req.file) {
      const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `${Date.now()}_${sanitizedName}`;
      const { data: uploadData, error: uploadError } = await adminSupabase.storage
        .from('avatars')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });
      if (!uploadError) {
        const { data: { publicUrl } } = adminSupabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_url = publicUrl;
      }
    }

    const meta = { 
      full_name, 
      role: 'seller', 
      business_name, 
      avatar_url 
    };

    const result = await client.query(`
      INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, aud, role) 
      VALUES (
          gen_random_uuid(), 
          $1, 
          crypt($2, gen_salt('bf')),
          $3, 
          'authenticated', 
          'authenticated'
      ) RETURNING id;
    `, [email, password, JSON.stringify(meta)]);

    const userId = result.rows[0].id;
    
    // Also update the seller's new fields since the trigger just creates it with default status 'verified'
    await client.query(`
      UPDATE public.sellers 
      SET phone_number = $1, whatsapp_number = $2, address = $3, location = $4, about = $5
      WHERE id = $6
    `, [phone_number || null, whatsapp_number || null, address || null, location || null, about || null, userId]);

    // Also update the user's phone if passed
    if (phone_number) {
       await client.query(`UPDATE public.users SET phone_number = $1 WHERE id = $2`, [phone_number, userId]);
    }

    const user = { id: userId, email, full_name, role: 'seller' };
    const token = generateToken(user.id, user.role);

    res.status(201).json({ success: true, data: { user, session: { access_token: token } } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || String(error) });
  } finally {
    if (client) await client.end();
  }
};


export const login = async (req: Request, res: Response) => {
  let client;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    client = await getPgClient();
    
    const checkPwd = await client.query(`
      SELECT id, raw_user_meta_data FROM auth.users 
      WHERE email = $1 AND encrypted_password = crypt($2, encrypted_password);
    `, [email, password]);

    if (checkPwd.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const authUser = checkPwd.rows[0];
    const meta = authUser.raw_user_meta_data || {};
    
    // Check status
    const statusCheck = await client.query('SELECT status, role FROM public.users WHERE id = $1', [authUser.id]);
    let actualRole = meta.role || 'buyer';
    if (statusCheck.rows.length > 0) {
      const status = statusCheck.rows[0].status;
      actualRole = statusCheck.rows[0].role;
      if (status === 'suspended') {
        return res.status(403).json({ success: false, error: 'Your account is suspended.' });
      }
      if (status === 'deleted') {
        return res.status(403).json({ success: false, error: 'Your account has been deleted.' });
      }
    }
    const user = { id: authUser.id, email, full_name: meta.full_name, role: actualRole };
    const token = generateToken(user.id, user.role);

    res.status(200).json({ success: true, data: { user, session: { access_token: token } } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || String(error) });
  } finally {
    if (client) await client.end();
  }
};

export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.sub;
    const adminSupabase = getAdminSupabaseClient();
    
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) throw new Error('User not found');

    let profileData = { ...user };

    if (user.role === 'buyer') {
      const { data: buyerData } = await adminSupabase
        .from('buyers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (buyerData) profileData = { ...profileData, buyer: buyerData };
    } 
    else if (user.role === 'seller') {
      const { data: sellerData } = await adminSupabase
        .from('sellers')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (sellerData) profileData = { ...profileData, seller: sellerData };
    }

    res.status(200).json({ success: true, data: profileData });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};
