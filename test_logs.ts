import { processChat } from './server/services/agromartAIService.js';

async function test() {
   try {
     const res = await processChat([], "What causes tomato bacterial wilt?", []);
     console.log("Success:", res);
   } catch (e) {
     console.error("Test failed:", e);
   }
}
test();
