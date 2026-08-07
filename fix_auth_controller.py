with open('server/controllers/authController.ts', 'r') as f:
    content = f.read()

import re

# Find registerSeller block
new_register_seller = """
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
"""

content = re.sub(r'export const registerSeller = async.*?finally \{\s*if \(client\) await client\.end\(\);\s*\}\s*\};', new_register_seller, content, flags=re.DOTALL)

with open('server/controllers/authController.ts', 'w') as f:
    f.write(content)
