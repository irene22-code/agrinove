import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function run() {
  try {
    // 1. Create a dummy image file
    fs.writeFileSync('dummy.jpg', 'fake image content');
    
    // We need a valid token for a seller and a valid product id.
    // Let's get the seller's token. 
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'seller@example.com',
      password: 'password123' // assuming seller exists, or we should create one
    }).catch(e => e.response);
    
    if (loginRes.status !== 200) {
      console.log('Login failed', loginRes.data);
      // Create seller
      const regRes = await axios.post('http://localhost:3000/api/auth/register/seller', {
        email: 'seller@example.com',
        password: 'password123',
        full_name: 'Test Seller',
        business_name: 'Test Farm'
      }).catch(e => e.response);
      console.log('Reg seller', regRes.data);
    }
    
    const loginRes2 = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'seller@example.com',
      password: 'password123'
    });
    const token = loginRes2.data.data.session.access_token;
    
    // 2. Create product
    const prodRes = await axios.post('http://localhost:3000/api/products', {
      title: 'Test Prod',
      description: 'Desc',
      price: 10,
      stock_quantity: 10,
      unit_of_measure: 'kg'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const productId = prodRes.data.data.id;
    console.log('Created product', productId);
    
    // 3. Upload image
    const form = new FormData();
    form.append('images', fs.createReadStream('dummy.jpg'));
    
    const uploadRes = await axios.post(`http://localhost:3000/api/products/${productId}/images`, form, {
      headers: { 
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Upload response', uploadRes.data);
    
  } catch(e) {
    console.error('Error:', e.response?.data || e.message);
  }
}
run();
