import fs from 'fs';
const file = 'src/components/ai/AgroMartAI.tsx';
let content = fs.readFileSync(file, 'utf8');

// Remove doc and docx from accept
content = content.replace(
  "accept=\"image/*,.pdf,.doc,.docx,.txt\"",
  "accept=\"image/*,.pdf,.txt\""
);

// Update validation
content = content.replace(
  "const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'text/plain' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';",
  "const isValidType = file.type.startsWith('image/') || file.type === 'application/pdf' || file.type === 'text/plain';"
);

content = content.replace(
  "if (!isValidType) alert(`${file.name} is not a supported file type (Images, PDF, DOC, TXT).`);",
  "if (!isValidType) alert(`${file.name} is not a supported file type (Only Images, PDF, TXT are supported. DOC/DOCX are not supported).`);"
);

fs.writeFileSync(file, content);
