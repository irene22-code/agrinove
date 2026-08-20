import express from 'express';
import multer from 'multer';
import FormData from 'form-data';
import fetch from 'node-fetch';
import fs from 'fs';
const app = express();
const upload = multer();
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ bufferOk: !!req.file?.buffer });
});
const server = app.listen(3005, async () => {
  const form = new FormData();
  form.append('image', fs.createReadStream('package.json'));
  const res = await fetch('http://localhost:3005/upload', { method: 'POST', body: form });
  console.log(await res.json());
  server.close();
});
