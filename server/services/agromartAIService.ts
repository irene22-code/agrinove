import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { getAdminSupabaseClient } from '../config/supabase.js';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const queryPlantHealthDecl: FunctionDeclaration = {
  name: "queryPlantHealth",
  description: "Automatically consider when the farmer describes crop diseases, pests, yellowing leaves, or uploads an image asking what's wrong with their plant.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Search query (e.g., tomato bacterial wilt, umugese)" }
    },
    required: ["query"]
  }
};

const queryMarketPricesDecl: FunctionDeclaration = {
  name: "queryMarketPrices",
  description: "Automatically use when the farmer asks about the price, cost, or where to sell/buy crops (e.g., ibijumba, ibigori).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      crop_name: { type: Type.STRING, description: "Name of the crop or product (e.g., ibirayi, ibishyimbo)" },
      market: { type: Type.STRING, description: "Optional name of the market (e.g., Nyabugogo)" }
    },
    required: ["crop_name"]
  }
};


const queryProductsDecl: FunctionDeclaration = {
  name: "queryProducts",
  description: "Automatically use when the farmer wants to buy or find products, seeds, fertilizers, or tools on AgroMart.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Search query (e.g., ibigori, inyongeramusaruro, seeds)" }
    },
    required: ["query"]
  }
};


const getWeatherDecl: FunctionDeclaration = {
  name: "getWeather",
  description: "Automatically use when the farmer asks about rain, weather, tomorrow's conditions, or mentions planting/spraying soon.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: "Name of the city, district, or location (e.g., Kigali, Musanze)" }
    },
    required: ["location"]
  }
};

const systemInstruction = `You are AgroMart AI, an intelligent agricultural assistant helping farmers in Rwanda.

1. LANGUAGE & TONE:
- Speak naturally in simple Kinyarwanda by default, or English if asked. Avoid complex technical jargon. Explain necessary terms simply.
- Sound like a knowledgeable agricultural advisor, not a database query system.

2. RESPONSE FORMATTING (MARKDOWN):
- Do NOT put the entire response into one paragraph. Use natural paragraphs.
- Use Markdown headings (###) when the answer is complex.
- Use bullet points (-) when listing several items.
- Use numbered steps (1. 2.) for procedures.
- Do NOT force headings on every short answer. For simple questions, answer naturally in 1-3 short paragraphs.
- Never dump raw database rows. Interpret and explain the data naturally.

3. SOURCE TRANSPARENCY & DATABASE FAILURES:
- Clearly distinguish between AgroMart Database Info, Live Weather, General Knowledge, and Visual Observations.
- If a tool (like Plant Health or Market Prices) returns nothing, DO NOT say "AgroMart ntabwo ifite amakuru" as your main answer. Instead, say briefly: "Mu makuru ya AgroMart mfite ubu, nta record yihariye nabonye kuri iki kibazo, ariko mu bumenyi rusange bw'ubuhinzi..." and then provide useful general knowledge.
- NEVER invent prices, products, or weather data.

4. PLANT HEALTH & IMAGE DIAGNOSIS:
- If an image is provided, state what you VISUALLY OBSERVE first.
- Combine observation with queryPlantHealth tool if relevant.
- NEVER claim 100% certainty from an image alone (say "Bishobora kuba...", "Bisa n'ibigaragaza...").
- Use this structure when useful for complex diagnosis:
  ### 🌱 Icyo mbona
  ### 🔎 Bishobora guterwa n'iki
  ### ✅ Icyo wakora
  ### ⚠️ Icyo kwitondera

5. WEATHER EXPERIENCE:
- Automatically use getWeather for weather/rain/planting/spraying intent.
- Do NOT just dump numbers. Translate to practical agricultural context.
- Use this structure when useful:
  ### 🌦️ Ikirere
  ### 🌱 Icyo bivuze ku murima
  ### ✅ Inama

6. MARKET PRICES:
- Automatically use queryMarketPrices for pricing intents.
- Use this structure when useful:
  ### 💰 Igiciro
  ### 📍 Isoko
  ### 📅 Itariki
  ### 📊 Kugereranya niba bishoboka

7. PRODUCTS:
- Use queryProducts to find seeds, fertilizers, etc. Explain relevant available products from the database.`;

async function sendMessageWithRetry(chat: any, payload: any, maxRetries = 3) {
    let retries = 0;
    while (true) {
        try {
            return await chat.sendMessage(payload);
        } catch (error: any) {
            console.error(`Gemini API Error (Attempt ${retries + 1}):`, error);
            
            const errorMessage = error?.message || '';
            const status = error?.status || 500;
            
            const isRateLimit = status === 429 || status === 'RESOURCE_EXHAUSTED' || errorMessage.includes('429') || errorMessage.includes('exceeded your current quota') || errorMessage.includes('RESOURCE_EXHAUSTED');
            const is503 = status === 503 || status === 'UNAVAILABLE' || errorMessage.includes('503') || errorMessage.includes('temporarily unavailable') || errorMessage.includes('high demand') || errorMessage.includes('timeout') || errorMessage.includes('fetch failed') || errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNRESET');

            if (isRateLimit) {
                const err = new Error("AgroMart AI iri kwakira requests nyinshi muri aka kanya. Tegereza akanya gato wongere ugerageze.");
                (err as any).statusCode = 429;
                throw err;
            }

            if (is503 || status >= 500 || errorMessage.toLowerCase().includes('unavailable')) {
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

export async function processChat(
  history: any[],
  newMessage: string,
  attachments: { mimeType: string; data: string }[],
  context?: any
): Promise<string> {
  const supabase = getAdminSupabaseClient();
  
  const formattedHistory = history.map(msg => ({
    role: msg.role === 'model' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
  
  const currentParts: any[] = [];
  if (context && Object.keys(context).length > 0) {
      currentParts.push({ text: `[System Context: ${JSON.stringify(context)}]` });
  }
  if (newMessage) {
      currentParts.push({ text: newMessage });
  }
  for (const att of attachments) {
      currentParts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
  }

  const chat = ai.chats.create({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: [queryPlantHealthDecl, queryMarketPricesDecl, queryProductsDecl, getWeatherDecl] }],
      // toolConfig: { includeServerSideToolInvocations: true }
    },
    history: formattedHistory
  });

  let response: GenerateContentResponse;
  response = await sendMessageWithRetry(chat, { message: currentParts as any });

  let toolIterations = 0;
  const maxToolIterations = 5;

  while (response.functionCalls && response.functionCalls.length > 0) {
    if (toolIterations >= maxToolIterations) {
        console.warn("Max tool iterations reached.");
        break;
    }
    toolIterations++;
    const functionResponses: any[] = [];
    for (const call of response.functionCalls) {
        let toolResult = "";
    
    if (call.name === 'queryPlantHealth') {
        const query = (call.args as any)?.query;
        const { data, error } = await supabase
            .from('plant_health_problems')
            .select('id, name, slug, short_description, full_description, plant_health_symptoms(description)')
            .or(`name.ilike.%${query}%,short_description.ilike.%${query}%,full_description.ilike.%${query}%`)
            .limit(3);
        if (error) {
           console.error("Plant Health Query Error:", error);
           toolResult = "Database error";
        }
        else if (!data || data.length === 0) toolResult = "No records found.";
        else toolResult = JSON.stringify(data);
    } 
    else if (call.name === 'queryMarketPrices') {
        const crop = (call.args as any)?.crop_name;
        // The foreign key relationships might differ, let's use a simple query first
        const { data, error } = await supabase
            .from('market_prices')
            .select('current_price, previous_price, unit, markets(name), products(title)')
            .limit(20);
        
        if (error) {
           console.error("Market Price Query Error:", error);
           toolResult = "Database error";
        } else {
            const matched = data.filter(r => {
                const prodName = (r.products as any)?.title || "";
                return prodName.toLowerCase().includes(crop.toLowerCase());
            });
            if (matched.length > 0) toolResult = JSON.stringify(matched.slice(0,5));
            else toolResult = "No current price exists for that crop.";
        }
    }

    
    else if (call.name === 'queryProducts') {
        const query = (call.args as any)?.query;
        const { data, error } = await supabase
            .from('products')
            .select('id, title, description, price, stock_quantity, unit_of_measure, users(full_name)')
            .ilike('title', `%${query}%`)
            .limit(5);
        if (error) {
           console.error("Products Query Error:", error);
           toolResult = "Database error";
        } else if (!data || data.length === 0) {
           toolResult = "No products found matching that query.";
        } else {
           toolResult = JSON.stringify(data);
        }
    }
        else if (call.name === 'getWeather') {
            const location = (call.args as any)?.location;
            
            try {
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`);
                const geoData = await geoRes.json();
                
                if (!geoData || !geoData.results || geoData.results.length === 0) {
                    toolResult = `Location '${location}' not found.`;
                } else {
                    const { latitude, longitude, name, country } = geoData.results[0];
                    const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`);
                    const weatherData = await weatherRes.json();
                    
                    toolResult = JSON.stringify({
                        location: `${name}, ${country}`,
                        current: weatherData.current,
                        daily: weatherData.daily
                    });
                }
            } catch (e) {
                console.error("Weather API Error:", e);
                toolResult = "Failed to fetch weather data.";
            }
        }

        functionResponses.push({
            functionResponse: {
                name: call.name,
                response: { result: toolResult }
            }
        });
    }

    response = await sendMessageWithRetry(chat, { message: functionResponses as any });
  }

  return response.text || "I'm sorry, I couldn't process that request.";
}
