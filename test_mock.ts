import { processChat } from './server/services/agromartAIService.js';

async function test() {
    // We will monkey-patch the global 'ai' object in the service if possible, or we can just mock fetch?
    // The google genai SDK uses global fetch.
    const originalFetch = globalThis.fetch;
    
    // Simulate 503 x3
    let fetchCount = 0;
    globalThis.fetch = async (url, options) => {
        fetchCount++;
        if (url.toString().includes('generativelanguage')) {
            if (fetchCount <= 3) {
                return new Response(JSON.stringify({ error: { message: "Service unavailable", status: "UNAVAILABLE", code: 503 } }), { status: 503, headers: { 'Content-Type': 'application/json' } });
            }
        }
        return originalFetch(url, options);
    };

    try {
        console.log("Testing 503 recovery...");
        const res = await processChat([], "Hello", []);
        console.log("Recovered:", res ? "Yes" : "No");
    } catch (e: any) {
        console.log("Failed 503 test:", e.message);
    }
    
    // Simulate 429
    globalThis.fetch = async (url, options) => {
        if (url.toString().includes('generativelanguage')) {
            return new Response(JSON.stringify({ error: { message: "Quota exceeded", status: "RESOURCE_EXHAUSTED", code: 429 } }), { status: 429, headers: { 'Content-Type': 'application/json' } });
        }
        return originalFetch(url, options);
    };

    try {
        console.log("Testing 429 handling...");
        await processChat([], "Hello", []);
        console.log("Should not reach here");
    } catch (e: any) {
        console.log("Caught 429 Error correctly:", e.message, "Status:", e.statusCode);
    }
    
    // Restore
    globalThis.fetch = originalFetch;
}
test();
