const express = require('express');
const multer = require('multer');
const upload = multer();
const app = express();
app.post('/upload', upload.single('image'), (req, res) => {
  if (req.file) {
    res.json({ bufferLength: req.file.buffer ? req.file.buffer.length : 0 });
  } else {
    res.json({ error: 'No file' });
  }
});
const server = app.listen(3002, () => {
  const fs = require('fs');
  const FormData = require('form-data');
  const form = new FormData();
  form.append('image', fs.createReadStream('package.json'));
  
  const http = require('http');
  const req = http.request({
    hostname: 'localhost',
    port: 3002,
    path: '/upload',
    method: 'POST',
    headers: form.getHeaders()
  }, (res) => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => { console.log(data); server.close(); });
  });
  form.pipe(req);
});
