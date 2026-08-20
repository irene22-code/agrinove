import https from 'https';

async function fetchJson(url: string) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function test() {
    try {
        const geo: any = await fetchJson('https://geocoding-api.open-meteo.com/v1/search?name=Kigali&count=1');
        if (geo.results && geo.results.length > 0) {
            const { latitude, longitude, name, country } = geo.results[0];
            const weather: any = await fetchJson(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto`);
            console.log("Weather for", name, country);
            console.log("Current:", weather.current);
            console.log("Daily:", weather.daily);
        } else {
            console.log("Not found");
        }
    } catch(e) {
        console.error(e);
    }
}
test();
