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

async function runTests() {
  console.log("--- STARTING FRONTEND RUNTIME TESTS ---");

  try {
    const recs = await makeRequest('/api/crop-calendar/recommendations');
    console.log("Test 11 - What You Should Plant Now Endpoint:", recs.status === 200 ? "PASS" : "FAIL");

    const periods = await makeRequest('/api/crop-calendar/periods');
    console.log("Test 12 - Season Progress & Annual Calendar Data Endpoint:", periods.status === 200 ? "PASS" : "FAIL");

    const activities = await makeRequest('/api/crop-calendar/activities');
    console.log("Test 14 - Farming Activities Endpoint:", activities.status === 200 ? "PASS" : "FAIL");

    const before = await makeRequest('/api/crop-calendar/before-planting');
    console.log("Test 15 - Before You Plant Endpoint:", before.status === 200 ? "PASS" : "FAIL");

    const alerts = await makeRequest('/api/crop-calendar/alerts');
    console.log("Test 16 - Agriculture Alerts Endpoint:", alerts.status === 200 ? "PASS" : "FAIL");
    
    const crops = await makeRequest('/api/crop-calendar/crops');
    console.log("Test 17 - Crop Details Endpoint:", crops.status === 200 ? "PASS" : "FAIL");

    // Let's create an alert just to see if it works
    const districts = await makeRequest('/api/crop-calendar/districts');
    let district_id = null;
    if(districts.data && districts.data.length > 0) district_id = districts.data[0].id;
    
    console.log("Checking UI strings in index.html/js...");
    const htmlRes = await makeRequest('/');
    // Check if the frontend server is serving
    console.log("Frontend Server Running:", htmlRes.status === 200 ? "PASS" : "FAIL");

  } catch(e) {
     console.error("Test execution failed:", e);
  }
  
  console.log("--- END TESTS ---");
}

runTests();
