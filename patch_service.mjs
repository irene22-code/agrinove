import fs from 'fs';

const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

const retryLogic = `async function sendMessageWithRetry(chat: any, payload: any, maxRetries = 3) {
    let retries = 0;
    while (true) {
        try {
            return await chat.sendMessage(payload);
        } catch (error: any) {
            console.error(\`Gemini API Error (Attempt \${retries + 1}):\`, error);
            
            const errorMessage = error?.message || '';
            const status = error?.status || 500;
            
            const isRateLimit = status === 429 || errorMessage.includes('429') || errorMessage.includes('exceeded your current quota') || errorMessage.includes('RESOURCE_EXHAUSTED');
            const is503 = status === 503 || errorMessage.includes('503') || errorMessage.includes('temporarily unavailable') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNRESET');

            if (isRateLimit) {
                const err = new Error("AgroMart AI iri kwakira requests nyinshi muri aka kanya. Tegereza akanya gato wongere ugerageze.");
                (err as any).statusCode = 429;
                throw err;
            }

            if (is503 || status >= 500 || errorMessage.includes('unavailable')) {
                if (retries >= maxRetries) {
                    const err = new Error("AgroMart AI iri guhura n'akanya gato ko kutaboneka. Ongera ugerageze nyuma gato.");
                    (err as any).statusCode = 503;
                    throw err;
                }
                const backoffMs = Math.pow(2, retries) * 1000 + Math.random() * 1000;
                await new Promise(resolve => setTimeout(resolve, backoffMs));
                retries++;
                continue;
            }

            const err = new Error("AgroMart AI yagize ikibazo. Ongera ugerageze nyuma.");
            (err as any).statusCode = 500;
            throw err;
        }
    }
}

export async function processChat(`;

content = content.replace('export async function processChat(', retryLogic);

const oldTry1 = `  let response: GenerateContentResponse;
  try {
    response = await chat.sendMessage({ message: currentParts as any });
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AgroMart AI is temporarily unavailable. Please try again.");
  }`;

const newTry1 = `  let response: GenerateContentResponse;
  response = await sendMessageWithRetry(chat, { message: currentParts as any });`;

content = content.replace(oldTry1, newTry1);

const oldTry2 = `    try {
      response = await chat.sendMessage({ 
          message: functionResponses as any
      });
    } catch (error) {
       console.error("Gemini tool response error:", error);
       throw new Error("AgroMart AI is temporarily unavailable. Please try again.");
    }`;

const newTry2 = `    response = await sendMessageWithRetry(chat, { message: functionResponses as any });`;

content = content.replace(oldTry2, newTry2);

const oldLoop = `  while (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponses: any[] = [];`;

const newLoop = `  let toolIterations = 0;
  const maxToolIterations = 5;

  while (response.functionCalls && response.functionCalls.length > 0) {
    if (toolIterations >= maxToolIterations) {
        console.warn("Max tool iterations reached.");
        break;
    }
    toolIterations++;
    const functionResponses: any[] = [];`;

content = content.replace(oldLoop, newLoop);

fs.writeFileSync(file, content);
