require('dotenv').config();

async function test() {
  const login = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superuser@agromart.com', password: process.env.NEW_ADMIN_PASSWORD || 'TestingPassword123!' })
  });
  const loginData = await login.json();
  const t = loginData.data.session.access_token;
  
  const req = await fetch('http://localhost:3000/api/admin/users?role=buyer', { headers: { 'Authorization': `Bearer ${t}` } });
  const data = await req.json();
  const buyer = data.data[0];
  
  if (buyer) {
     console.log("Found buyer:", buyer.id);
     const res = await fetch(`http://localhost:3000/api/admin/users/${buyer.id}`, {
       method: 'DELETE',
       headers: { 
         'Authorization': `Bearer ${t}`
       }
     });
     console.log("Delete status:", res.status);
     console.log("Delete result:", await res.json());
  } else {
     console.log("No buyer found.");
  }
}
test();
