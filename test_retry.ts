import { processChat } from './server/services/agromartAIService.js';

// We can't easily mock the AI client without hacking into the module cache,
// so let's just trigger a normal chat and see if it fails nicely with the custom error when quota is exceeded.
async function test() {
    try {
        await processChat([], "Test message", []);
        console.log("Success (Quota must have reset)");
    } catch (e: any) {
        console.log("Caught Error:", e.message, "Status Code:", e.statusCode);
    }
}
test();
