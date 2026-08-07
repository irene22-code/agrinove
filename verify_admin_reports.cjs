const { createClient } = require('@supabase/supabase-js');

async function runTests() {
  const ts = Date.now();
  const password = 'password123';
  const adminEmail = `admin_ver_${ts}@test.com`;
  const buyerEmail = `buyer_ver_${ts}@test.com`;
  const sellerEmail = `seller_ver_${ts}@test.com`;
  
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Create test users
  let adminRes = await supabase.auth.admin.createUser({ email: adminEmail, password, email_confirm: true, user_metadata: { role: 'admin', full_name: 'Admin User' } });
  await supabase.from('users').update({ role: 'admin' }).eq('id', adminRes.data.user.id);
  
  let buyerRes = await supabase.auth.admin.createUser({ email: buyerEmail, password, email_confirm: true, user_metadata: { role: 'buyer', full_name: 'Buyer User' } });
  await supabase.from('users').update({ role: 'buyer' }).eq('id', buyerRes.data.user.id);
  await supabase.from('buyers').insert({ id: buyerRes.data.user.id, phone_number: '123' });
  
  let sellerRes = await supabase.auth.admin.createUser({ email: sellerEmail, password, email_confirm: true, user_metadata: { role: 'seller', full_name: 'Seller User' } });
  await supabase.from('users').update({ role: 'seller' }).eq('id', sellerRes.data.user.id);
  await supabase.from('sellers').insert({ id: sellerRes.data.user.id, business_name: 'Test Business', status: 'verified' });
  
  const login = async (email) => {
      const res = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      });
      return (await res.json()).data.session.access_token;
  };
  
  const adminToken = await login(adminEmail);
  const buyerToken = await login(buyerEmail);
  const sellerToken = await login(sellerEmail);
  
  const apiFetch = async (endpoint, method, token, body = null) => {
      const opts = { method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } };
      if (body) opts.body = JSON.stringify(body);
      const res = await fetch(`http://localhost:3000/api${endpoint}`, opts);
      return { status: res.status, data: await res.json() };
  };
  
  console.log("--- 1. & 10. AUTH & ROUTE TESTS ---");
  const ep = '/admin/reports';
  const aRes = await apiFetch(ep, 'GET', adminToken);
  console.log("Admin 200 OK:", aRes.status === 200 && aRes.data.success ? "PASS" : "FAIL");
  
  const bRes = await apiFetch(ep, 'GET', buyerToken);
  console.log("Buyer 403:", bRes.status === 403 || bRes.status === 401 ? "PASS" : "FAIL");
  
  const sRes = await apiFetch(ep, 'GET', sellerToken);
  console.log("Seller 403:", sRes.status === 403 || sRes.status === 401 ? "PASS" : "FAIL");
  
  if (!aRes.data.success) {
      console.log("Aborting due to Admin Reports API failure");
      return;
  }
  
  const reportData = aRes.data.data;
  const metrics = reportData.metrics;
  const inventory = reportData.inventory;
  
  console.log("\n--- 2. OVERVIEW METRICS VERIFICATION ---");
  
  // Direct DB queries
  const { count: dbUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { count: dbBuyers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'buyer');
  const { count: dbSellers } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'seller');
  const { count: dbProducts } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: dbOrders } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  
  console.log("Users match:", metrics.totalUsers === dbUsers ? "PASS" : `FAIL (API: ${metrics.totalUsers}, DB: ${dbUsers})`);
  console.log("Buyers match:", metrics.totalBuyers === dbBuyers ? "PASS" : `FAIL (API: ${metrics.totalBuyers}, DB: ${dbBuyers})`);
  console.log("Sellers match:", metrics.totalSellers === dbSellers ? "PASS" : `FAIL (API: ${metrics.totalSellers}, DB: ${dbSellers})`);
  console.log("Products match:", metrics.totalProducts === dbProducts ? "PASS" : `FAIL (API: ${metrics.totalProducts}, DB: ${dbProducts})`);
  console.log("Orders match:", metrics.totalOrders === dbOrders ? "PASS" : `FAIL (API: ${metrics.totalOrders}, DB: ${dbOrders})`);
  
  console.log("\n--- 3. REVENUE CALCULATION ---");
  const { data: dbCompletedOrders } = await supabase.from('orders').select('total_amount').in('order_status', ['completed', 'delivered']);
  const dbRevenue = dbCompletedOrders?.reduce((acc, order) => acc + Number(order.total_amount || 0), 0) || 0;
  console.log("Revenue matches:", Math.abs(metrics.totalRevenue - dbRevenue) < 0.01 ? "PASS" : `FAIL (API: ${metrics.totalRevenue}, DB: ${dbRevenue})`);
  
  console.log("\n--- 4. ORDER STATUS STATISTICS ---");
  const { count: dbPending } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'pending');
  const { count: dbCompleted } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'delivered');
  const { count: dbCancelled } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'cancelled');
  
  const apiPending = reportData.orderStatusCounts['pending'] || 0;
  const apiCompleted = reportData.orderStatusCounts['completed'] || 0;
  const apiCancelled = reportData.orderStatusCounts['cancelled'] || 0;
  
  console.log("Pending matches:", apiPending === dbPending ? "PASS" : `FAIL (API: ${apiPending}, DB: ${dbPending})`);
  console.log("Completed matches:", apiCompleted === dbCompleted ? "PASS" : `FAIL (API: ${apiCompleted}, DB: ${dbCompleted})`);
  console.log("Cancelled matches:", apiCancelled === dbCancelled ? "PASS" : `FAIL (API: ${apiCancelled}, DB: ${dbCancelled})`);
  
  console.log("\n--- 5, 6, 7. PERFORMANCE METRICS GENERATED ---");
  console.log("Top Products generated:", Array.isArray(reportData.topProducts) ? "PASS" : "FAIL");
  console.log("Top Sellers generated:", Array.isArray(reportData.topSellers) ? "PASS" : "FAIL");
  console.log("Top Categories generated:", Array.isArray(reportData.topCategories) ? "PASS" : "FAIL");
  
  console.log("\n--- 8. INVENTORY STATISTICS ---");
  const { count: dbInStock } = await supabase.from('products').select('*', { count: 'exact', head: true }).gt('stock_quantity', 9).neq('status', 'archived').neq('status', 'inactive');
  const { count: dbOutStock } = await supabase.from('products').select('*', { count: 'exact', head: true }).eq('stock_quantity', 0).neq('status', 'archived').neq('status', 'inactive');
  
  console.log("In Stock matches:", inventory.inStock === dbInStock ? "PASS" : `FAIL (API: ${inventory.inStock}, DB: ${dbInStock})`);
  console.log("Out of Stock matches:", inventory.outOfStock === dbOutStock ? "PASS" : `FAIL (API: ${inventory.outOfStock}, DB: ${dbOutStock})`);
  
  console.log("\n--- 9. DATE FILTERS ---");
  // Past date filter should yield 0 for time-based metrics
  const start = new Date(0).toISOString();
  const end = new Date(0).toISOString();
  const rangeRes = await apiFetch(`${ep}?startDate=${start}&endDate=${end}`, 'GET', adminToken);
  
  if (rangeRes.status === 200 && rangeRes.data.success) {
      const filteredMetrics = rangeRes.data.data.metrics;
      console.log("Date filter applied correctly (Total Orders):", filteredMetrics.totalOrders === 0 ? "PASS" : "FAIL");
      console.log("Date filter applied correctly (Revenue):", filteredMetrics.totalRevenue === 0 ? "PASS" : "FAIL");
  } else {
      console.log("Date filter test FAIL - API error");
  }

  console.log("\n--- 11. REGRESSION (EXISTING MODULES) ---");
  // Just hitting the major endpoints
  let reg = true;
  if ((await apiFetch('/products', 'GET', buyerToken)).status !== 200) reg = false;
  if ((await apiFetch('/orders/buyer', 'GET', buyerToken)).status !== 200) reg = false;
  if ((await apiFetch('/products', 'GET', sellerToken)).status !== 200) reg = false;
  if ((await apiFetch('/admin/users', 'GET', adminToken)).status !== 200) reg = false;
  if ((await apiFetch('/admin/products', 'GET', adminToken)).status !== 200) reg = false;
  if ((await apiFetch('/admin/orders', 'GET', adminToken)).status !== 200) reg = false;
  if ((await apiFetch('/admin/messages', 'GET', adminToken)).status !== 200) reg = false;
  
  console.log("Regression checks:", reg ? "PASS" : "FAIL");
}

runTests().catch(console.error);
