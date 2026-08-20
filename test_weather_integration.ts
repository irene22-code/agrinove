import { processChat } from './server/services/agromartAIService.js';

async function test() {
   try {
     const res1 = await processChat([], "Ndashaka gutera inyanya ejo i Kigali. Imvura izagwa?", []);
     console.log("Weather Test:", res1);
   } catch (e) {
     console.error("Test failed:", e);
   }
}
test();
