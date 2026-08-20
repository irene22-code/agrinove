import { processChat } from './server/services/agromartAIService.js';

async function test() {
   try {
     const res1 = await processChat([], "What is the market price for ibirayi in Nyabugogo?", []);
     console.log("Market Price:", res1);
     
     const res2 = await processChat([], "Show me some fertilizers available on AgroMart", []);
     console.log("Products:", res2);
   } catch (e) {
     console.error("Test failed:", e);
   }
}
test();
