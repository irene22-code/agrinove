import fs from 'fs';

const file = 'src/components/ai/AgroMartAI.tsx';
let content = fs.readFileSync(file, 'utf8');

const oldHandler = `  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
     if (e) {
         e.stopPropagation();
     }
     if (!id) return;
     if (!confirm('Usiba iyi conversation ya AgroMart AI?')) return;
     
     setDeletingId(id);
     try {
         const response = await fetch(\`/api/ai/conversations/\${id}\`, {
             headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
             method: 'DELETE'
         });
         if (response.ok) {`;

const newHandler = `  const handleDeleteConversation = async (id: string, e?: React.MouseEvent) => {
     console.log("[AI DELETE] clicked", id);
     if (e) {
         e.stopPropagation();
     }
     if (!id) return;
     if (!confirm('Usiba iyi conversation ya AgroMart AI?')) return;
     
     console.log("[AI DELETE] sending request", id);
     setDeletingId(id);
     try {
         const response = await fetch(\`/api/ai/conversations/\${id}\`, {
             headers: token ? { 'Authorization': \`Bearer \${token}\` } : {},
             method: 'DELETE'
         });
         console.log("[AI DELETE] response", response.status);
         if (response.ok) {`;

content = content.replace(oldHandler, newHandler);
fs.writeFileSync(file, content);
console.log('Added frontend logs');
