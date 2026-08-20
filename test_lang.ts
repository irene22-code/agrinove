import { processChat } from './server/services/agromartAIService.js';

async function test() {
   try {
     const res1 = await processChat([], "Amababi y'inyanya ari guhinduka umuhondo, nakora iki?", []);
     console.log("Kinyarwanda:", res1);
     
     const res2 = await processChat([], "Pourquoi les feuilles de mes tomates deviennent-elles jaunes ?", []);
     console.log("French:", res2);
   } catch (e) {
     console.error("Test failed:", e);
   }
}
test();
