const http = require('http');

async function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (body) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(body));
    }

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch(e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', e => reject(e));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAudit() {
  console.log("--- STARTING BACKEND AUDIT ---");
  
  // 1. Get Districts & Seasons
  const districts = await makeRequest('/api/crop-calendar/districts');
  console.log("Districts:", districts.status, districts.data.length > 0 ? "PASS" : "FAIL");
  
  const seasons = await makeRequest('/api/crop-calendar/seasons');
  console.log("Seasons:", seasons.status, seasons.data.length > 0 ? "PASS" : "FAIL");

  // 4. Create a test crop
  const newCrop = {
    name: "Test Audit Crop",
    slug: "test-audit-crop",
    category: "Cereals",
    status: "published"
  };
  const createRes = await makeRequest('/api/admin/crop-calendar/crops', 'POST', newCrop);
  console.log("Create Crop:", createRes.status, createRes.data?.id ? "PASS" : "FAIL");
  const cropId = createRes.data?.id;

  // 6. Verify row exists
  const cropsRes = await makeRequest('/api/admin/crop-calendar/crops');
  const found = cropsRes.data.find(c => c.id === cropId);
  console.log("Verify Created Crop Exists:", found ? "PASS" : "FAIL");

  // 7. Edit the crop
  if (cropId) {
    const editRes = await makeRequest(`/api/admin/crop-calendar/crops/${cropId}`, 'PUT', { category: "Legumes" });
    console.log("Edit Crop:", editRes.data?.category === "Legumes" ? "PASS" : "FAIL");
  }

  // 18. Test Delete
  if (cropId) {
    const delRes = await makeRequest(`/api/admin/crop-calendar/crops/${cropId}`, 'DELETE');
    console.log("Delete Crop API:", delRes.status === 200 ? "PASS" : "FAIL");
    
    // 19. Verify deleted
    const cropsAfterDel = await makeRequest('/api/admin/crop-calendar/crops');
    const foundAfter = cropsAfterDel.data.find(c => c.id === cropId);
    console.log("Verify Deleted Crop Disappears:", !foundAfter ? "PASS" : "FAIL");
  }

  // Other public endpoints
  const recs = await makeRequest('/api/crop-calendar/recommendations');
  console.log("Recommendations Endpoint:", recs.status === 200 ? "PASS" : "FAIL");

  const activities = await makeRequest('/api/crop-calendar/activities');
  console.log("Activities Endpoint:", activities.status === 200 ? "PASS" : "FAIL");

  const alerts = await makeRequest('/api/crop-calendar/alerts');
  console.log("Alerts Endpoint:", alerts.status === 200 ? "PASS" : "FAIL");

  const beforePlanting = await makeRequest('/api/crop-calendar/before-planting');
  console.log("Before Planting Endpoint:", beforePlanting.status === 200 ? "PASS" : "FAIL");

  console.log("--- END BACKEND AUDIT ---");
}

runAudit();
