const fs = require('fs');
const file = 'server/services/agromartAIService.ts';
let code = fs.readFileSync(file, 'utf-8');

code = code.replace(
    "const isRateLimit = status === 429 || errorMessage.includes('429') || errorMessage.includes('exceeded your current quota') || errorMessage.includes('RESOURCE_EXHAUSTED');",
    "const isRateLimit = status === 429 || status === 'RESOURCE_EXHAUSTED' || errorMessage.includes('429') || errorMessage.includes('exceeded your current quota') || errorMessage.includes('RESOURCE_EXHAUSTED');"
);

code = code.replace(
    "const is503 = status === 503 || errorMessage.includes('503') || errorMessage.includes('temporarily unavailable') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNRESET');",
    "const is503 = status === 503 || status === 'UNAVAILABLE' || errorMessage.includes('503') || errorMessage.includes('temporarily unavailable') || errorMessage.includes('high demand') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNRESET');"
);

code = code.replace(
    "if (is503 || status >= 500 || errorMessage.includes('unavailable')) {",
    "if (is503 || status >= 500 || errorMessage.toLowerCase().includes('unavailable')) {"
);

fs.writeFileSync(file, code);
