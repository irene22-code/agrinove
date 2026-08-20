import fs from 'fs';
const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

const target = `  while (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
    let toolResult = "";`;

const replacement = `  while (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponses: any[] = [];
    for (const call of response.functionCalls) {
        let toolResult = "";`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
