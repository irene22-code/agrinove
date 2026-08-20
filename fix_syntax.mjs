import fs from 'fs';

const file = 'src/components/ai/AgroMartAI.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('{messages.map((msg, idx) => (\n            {messages.map((msg, idx) => (', '{messages.map((msg, idx) => (');

// the close condition
content = content.replace('            <div ref={messagesEndRef} />\n          </div>', '            <div ref={messagesEndRef} />\n          </div>\n          )}');

fs.writeFileSync(file, content);
