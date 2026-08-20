import fs from 'fs';
const file = 'server/services/agromartAIService.ts';
let content = fs.readFileSync(file, 'utf8');

const oldWeatherLogic = `        else if (call.name === 'getWeather') {
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
        }`;

const newWeatherLogic = `        else if (call.name === 'getWeather') {
            const location = (call.args as any)?.location;
            
            try {
                const geoRes = await fetch(\`https://geocoding-api.open-meteo.com/v1/search?name=\${encodeURIComponent(location)}&count=1\`);
                const geoData = await geoRes.json();
                
                if (!geoData || !geoData.results || geoData.results.length === 0) {
                    toolResult = \`Location '\${location}' not found.\`;
                } else {
                    const { latitude, longitude, name, country } = geoData.results[0];
                    const weatherRes = await fetch(\`https://api.open-meteo.com/v1/forecast?latitude=\${latitude}&longitude=\${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto\`);
                    const weatherData = await weatherRes.json();
                    
                    toolResult = JSON.stringify({
                        location: \`\${name}, \${country}\`,
                        current: weatherData.current,
                        daily: weatherData.daily
                    });
                }
            } catch (e) {
                console.error("Weather API Error:", e);
                toolResult = "Failed to fetch weather data.";
            }
        }`;

content = content.replace(oldWeatherLogic, newWeatherLogic);

fs.writeFileSync(file, content);

const envFile = '.env.example';
if (fs.existsSync(envFile)) {
    let envContent = fs.readFileSync(envFile, 'utf8');
    envContent = envContent.replace(/# Weather API Configuration[\s\S]*?WEATHER_API_BASE_URL="https:\/\/api\.openweathermap\.org"/, "");
    fs.writeFileSync(envFile, envContent);
}

