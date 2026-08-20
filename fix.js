const fs = require('fs');
const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "  while (response.functionCalls && response.functionCalls.length > 0) {\n    const call = response.functionCalls[0];\n    let toolResult = \"\";",
  "  while (response.functionCalls && response.functionCalls.length > 0) {\n    const functionResponses: any[] = [];\n    for (const call of response.functionCalls) {\n      let toolResult = \"\";"
);

fs.writeFileSync(file, content);
