import { processChat } from './server/services/agromartAIService.js';

async function test() {
   try {
     const res = await processChat([], "What is common between these two images?", [
       {
         mimeType: 'image/jpeg',
         data: '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=' // Minimal 1x1 valid jpeg base64
       },
       {
         mimeType: 'image/png',
         data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=' // Minimal 1x1 valid png base64
       }
     ]);
     console.log("Success:", res);
   } catch (e) {
     console.error("Test failed:", e);
   }
}
test();
