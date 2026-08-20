const error = new Error("This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.");
error.status = 'UNAVAILABLE';
const errorMessage = error?.message || '';
const status = error?.status || 500;
const is503 = status === 503 || errorMessage.includes('503') || errorMessage.includes('temporarily unavailable') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNRESET');

console.log("errorMessage:", errorMessage);
console.log("status:", status);
console.log("is503:", is503);
console.log("status >= 500:", status >= 500);
console.log("errorMessage.includes('unavailable'):", errorMessage.includes('unavailable'));

if (is503 || status >= 500 || errorMessage.includes('unavailable')) {
    console.log("entered is503 block");
} else {
    console.log("did not enter");
}
