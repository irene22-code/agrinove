import fs from 'fs';
const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "- DO NOT invent market prices.",
  "- DO NOT invent market prices.\\n- You DO NOT have access to live weather data. If asked about current weather, clearly state that you do not have live weather information but can offer general seasonal advice."
);

fs.writeFileSync(file, content);
