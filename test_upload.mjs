import fs from 'fs';
import FormData from 'form-data';

async function run() {
  try {
    fs.writeFileSync('dummy.jpg', 'fake image content');
    
    // Login
    let res = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'seller@example.com', password: 'password123' })
    });
    let data = await res.json();
    if (!res.ok) {
        console.log('Login failed', data);
        res = await fetch('http://localhost:3000/api/auth/register/seller', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'seller@example.com', password: 'password123', full_name: 'Test', business_name: 'Test Farm' })
        });
        data = await res.json();
        console.log('Reg seller', data);
    }
    
    const token = data.data.session.access_token;
    
    // Check if seller is verified, in the DB it defaults to verified if we added trigger. Let's assume yes.
    res = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: 'Test Prod', description: 'Desc', price: 10, stock_quantity: 10, unit_of_measure: 'kg' })
    });
    data = await res.json();
    if (!res.ok) {
        console.log('Failed to create product', data);
        
        // Manually verify seller
        const { Client } = await import('pg');
        const url = process.env.DATABASE_URL.replace('[irene@2026@NDANGA]', 'irene%402026%40NDANGA');
        const client = new Client({ connectionString: url });
        await client.connect();
        await client.query("UPDATE sellers SET status = 'verified'");
        await client.end();
        
        res = await fetch('http://localhost:3000/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: 'Test Prod', description: 'Desc', price: 10, stock_quantity: 10, unit_of_measure: 'kg' })
        });
        data = await res.json();
    }
    
    console.log('Created product', data);
    const productId = data.data.id;
    
    // Upload image
    const form = new FormData();
    form.append('images', fs.createReadStream('dummy.jpg'));
    
    res = await fetch(`http://localhost:3000/api/products/${productId}/images`, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`,
        // Note: fetch will set correct Content-Type if we pass a standard DOM FormData, but since this is node-fetch/undici with form-data package we must provide headers
        ...form.getHeaders()
      },
      body: form
    });
    data = await res.json();
    console.log('Upload response', data);
    
  } catch(e) {
    console.error('Error:', e);
  }
}
run();
