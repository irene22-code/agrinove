const http = require('http');
// Mocking the request without auth just to see if it gets a 401 Unauthorized (which means the route exists and is protected)
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/crop-calendar/crops',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`Status: ${res.statusCode}`);
});
req.on('error', error => {
  console.error(error);
});
req.end();
