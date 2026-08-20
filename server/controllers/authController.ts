import { Request, Response } from 'express';
import { getAdminSupabaseClient } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const generateToken = (userId: string, role: string) => {
  return jwt.sign({ sub: userId, role, aud: 'authenticated' }, process.env.JWT_SECRET!, { expiresIn: '7d' });
};

export const registerBuyer = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ success: false, error: 'Email, password, and full_name are required' });
    }

    const supabase = getAdminSupabaseClient();

    // Check if user exists in public.users to prevent double registration
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
       return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: 'buyer' }
    });

    if (authError) throw authError;

    const userId = authData.user.id;
    const user = { id: userId, email, full_name, role: 'buyer' };
    const token = generateToken(user.id, user.role);

    res.status(201).json({ success: true, data: { user, session: { access_token: token } } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || String(error) });
  }
};

export const registerSeller = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, business_name, phone_number, whatsapp_number, address, location, about } = req.body;

    if (!email || !password || !full_name || !business_name) {
      return res.status(400).json({ success: false, error: 'Email, password, full_name, and business_name are required' });
    }

    const supabase = getAdminSupabaseClient();

    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
       return res.status(400).json({ success: false, error: 'User already exists' });
    }

    let avatar_url = null;
    if (req.file) {
      const sanitizedName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '');
      const fileName = `${Date.now()}_${sanitizedName}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
        avatar_url = publicUrl;
      }
    }

    const meta = {
       full_name,
       role: 'seller',
       business_name,
       avatar_url
    };

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta
    });

    if (authError) throw authError;
    const userId = authData.user.id;

    // Update the seller's new fields since the trigger just creates it with default status 'verified'
    await supabase.from('sellers').update({
      phone_number: phone_number || null,
      whatsapp_number: whatsapp_number || null,
      address: address || null,
      location: location || null,
      about: about || null
    }).eq('id', userId);

    if (phone_number) {
       await supabase.from('users').update({ phone_number }).eq('id', userId);
    }

    const user = { id: userId, email, full_name, role: 'seller' };
    const token = generateToken(user.id, user.role);

    res.status(201).json({ success: true, data: { user, session: { access_token: token } } });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || String(error) });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    // Use a temporary client to verify credentials via REST without changing admin session
    console.log("Before createClient");
    const tempClient = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    console.log("Before signInWithPassword");
    const { data: authData, error: authError } = await tempClient.auth.signInWithPassword({
      email,
      password
    });

    console.log("After signInWithPassword", authError?.message);
    if (authError || !authData.user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const authUser = authData.user;
    const meta = authUser.user_metadata || {};

    const supabase = getAdminSupabaseClient();
    const { data: statusCheck } = await supabase.from('users').select('status, role').eq('id', authUser.id).maybeSingle();

    let actualRole = meta.role || 'buyer';

    if (statusCheck) {
      const status = statusCheck.status;
      actualRole = statusCheck.role || actualRole;

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
