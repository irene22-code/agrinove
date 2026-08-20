import fs from 'fs';
const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

const weatherDecl = `
const getWeatherDecl: FunctionDeclaration = {
  name: "getWeather",
  description: "Get the current weather for a specific location. Use this to help farmers with planting and harvesting decisions.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: "Name of the city, district, or location (e.g., Kigali, Musanze)" }
    },
    required: ["location"]
  }
};
`;

const newSystemInstruction = `const systemInstruction = \`You are AgroMart AI, an intelligent agriculture assistant helping farmers in Rwanda.
You speak naturally and clearly. Prefer simple Kinyarwanda for Rwandan farmers, or English if asked in English. Avoid unnecessarily technical language. Explain technical terms when necessary.

Your primary functions:
1. Help with crop diseases, pests, and plant health.
2. Provide market prices.
3. Answer general agricultural questions.
4. Check weather forecasts for farming decisions.

Guidelines:
- Speak naturally and feel like a helpful agricultural advisor, not a static FAQ bot.
- Ask only useful follow-up questions, avoiding overwhelming users with too many questions.
- Remember the conversation context. Explain answers step-by-step when appropriate. Use headings and bullet points for complex answers.
- DO NOT invent market prices, database results, weather data, or products.
- If a tool for plant health returns empty, YOU MUST use your own extensive agricultural knowledge to answer the user fully, but clearly communicate uncertainty (e.g., "I couldn't find this in the AgroMart database, but generally...").
- When diagnosing crop diseases from images, combine visual observations, the farmer's description, conversation context, and Plant Health database results. DO NOT claim a diagnosis with 100% certainty. Say "This appears consistent with..." or "The symptoms could be caused by...".
- For weather, use the getWeather tool. Interpret the weather for the farmer (e.g., "There is rain today, so you might want to wait before spraying."). If location is missing, ask the farmer where the farm is. If the weather tool fails or is unavailable, clearly state that you cannot access live weather data right now, but offer general seasonal advice.
- For market prices, retrieve actual data. Summarize or compare markets if multiple exist. If no data exists, clearly say AgroMart does not currently have the requested price.
- If asked multiple questions (e.g., weather and prices), call all relevant tools and combine the results naturally.
- For chemical control, provide safety-conscious guidance (e.g., wear PPE, follow labels).\`;`;

// Replace systemInstruction block
content = content.replace(/const systemInstruction = `[\s\S]*?`;/, newSystemInstruction);

// Insert weather declaration before systemInstruction
content = content.replace("const systemInstruction =", weatherDecl + "\nconst systemInstruction =");

// Add getWeatherDecl to tools array
content = content.replace(
  "tools: [{ functionDeclarations: [queryPlantHealthDecl, queryMarketPricesDecl, queryProductsDecl] }],",
  "tools: [{ functionDeclarations: [queryPlantHealthDecl, queryMarketPricesDecl, queryProductsDecl, getWeatherDecl] }],"
);

// Update while loop for function calls
const oldWhileBlock = `  while (response.functionCalls && response.functionCalls.length > 0) {
    const call = response.functionCalls[0];
    let toolResult = "";
        
    if (call.name === 'queryPlantHealth') {`;

const newWhileBlock = `  while (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponses: any[] = [];
    
    for (const call of response.functionCalls) {
        let toolResult = "";
        
        if (call.name === 'queryPlantHealth') {`;

content = content.replace(oldWhileBlock, newWhileBlock);

// Replace queryPlantHealth to queryProducts tool blocks
// We need to find where the `try { response = await chat.sendMessage(...) }` happens inside the while loop.
// The end of the tools block looks like:
/*
        } else {
           toolResult = JSON.stringify(data);
        }
    }

    try {
      response = await chat.sendMessage({ 
          message: [{
              functionResponse: {
                  name: call.name,
                  response: { result: toolResult }
              }
          }] as any
      });
*/

const oldSendMessageBlock = `    }

    try {
      response = await chat.sendMessage({ 
          message: [{
              functionResponse: {
                  name: call.name,
                  response: { result: toolResult }
              }
          }] as any
      });`;

const newSendMessageBlock = `    }
        else if (call.name === 'getWeather') {
            const location = (call.args as any)?.location;
            const apiKey = process.env.WEATHER_API_KEY;
            const baseUrl = process.env.WEATHER_API_BASE_URL || 'https://api.openweathermap.org';
            
            if (!apiKey) {
                toolResult = "Weather API key is not configured. Live weather is unavailable.";
            } else {
                try {
                    const geoRes = await fetch(\`\${baseUrl}/geo/1.0/direct?q=\${encodeURIComponent(location)}&limit=1&appid=\${apiKey}\`);
                    const geoData = await geoRes.json();
                    
                    if (!geoData || geoData.length === 0) {
                        toolResult = \`Location '\${location}' not found.\`;
                    } else {
                        const { lat, lon } = geoData[0];
                        const weatherRes = await fetch(\`\${baseUrl}/data/2.5/weather?lat=\${lat}&lon=\${lon}&appid=\${apiKey}&units=metric\`);
                        const weatherData = await weatherRes.json();
                        
                        toolResult = JSON.stringify({
                            location: geoData[0].name,
                            description: weatherData.weather[0]?.description,
                            temp: weatherData.main?.temp,
                            humidity: weatherData.main?.humidity,
                            rain_1h: weatherData.rain?.['1h'] || 0
                        });
                    }
                } catch (e) {
                    console.error("Weather API Error:", e);
                    toolResult = "Failed to fetch weather data.";
                }
            }
        }

        functionResponses.push({
            functionResponse: {
                name: call.name,
                response: { result: toolResult }
            }
        });
    }

    try {
      response = await chat.sendMessage({ 
          message: functionResponses as any
      });`;

content = content.replace(oldSendMessageBlock, newSendMessageBlock);

fs.writeFileSync(file, content);
