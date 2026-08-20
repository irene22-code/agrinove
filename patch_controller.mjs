import fs from 'fs';

const file = 'server/controllers/agromartAIController.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'res.status(500).json({ error: error.message || "Failed to process chat." });',
  'res.status(error.statusCode || 500).json({ error: error.message || "Failed to process chat." });'
);

fs.writeFileSync(file, content);
