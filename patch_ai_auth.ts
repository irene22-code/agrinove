import fs from 'fs';
const file = 'src/components/ai/AgroMartAI.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace("const { user } = useAuth();", "const { user, token } = useAuth();");

// Replace fetch for conversations load
content = content.replace(
  "fetch(`/api/ai/conversations?userId=${user.id}`)",
  "fetch(`/api/ai/conversations`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })"
);

content = content.replace(
  "fetch(`/api/ai/conversations/${latest.id}?userId=${user.id}`)",
  "fetch(`/api/ai/conversations/${latest.id}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })"
);
content = content.replace(
  "fetch(`/api/ai/conversations/${latest.id}`)",
  "fetch(`/api/ai/conversations/${latest.id}`, { headers: token ? { 'Authorization': `Bearer ${token}` } : {} })"
);

// Replace fetch for chat
content = content.replace(
  "headers: { 'Content-Type': 'application/json' },",
  "headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },"
);

// Replace fetch for delete
content = content.replace(
  "fetch(`/api/ai/conversations/${conversationId}${user ? `?userId=${user.id}` : ''}`, {",
  "fetch(`/api/ai/conversations/${conversationId}`, {\n             headers: token ? { 'Authorization': `Bearer ${token}` } : {},"
);

// Also remove userId from payload body since we'll rely on the server side
content = content.replace(
  "userId: user?.id,",
  ""
);

fs.writeFileSync(file, content);
