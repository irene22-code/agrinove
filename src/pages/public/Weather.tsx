import { useState, useEffect } from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Sun, 
  CloudRain, 
  Thermometer, 
  MapPin, 
  Search, 
  Calendar, 
  Compass, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface DistrictLocation {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

const RWANDA_DISTRICTS: DistrictLocation[] = [
  { name: 'Kigali (Nyarugenge)', province: 'Kigali City', latitude: -1.9536, longitude: 30.0606 },
  { name: 'Musanze', province: 'Northern Province', latitude: -1.4998, longitude: 29.6350 },
  { name: 'Nyagatare', province: 'Eastern Province', latitude: -1.2972, longitude: 30.3247 },
  { name: 'Huye', province: 'Southern Province', latitude: -2.5967, longitude: 29.7394 },
  { name: 'Rubavu', province: 'Western Province', latitude: -1.6792, longitude: 29.2625 },
  { name: 'Rwamagana', province: 'Eastern Province', latitude: -1.9487, longitude: 30.4347 },
  { name: 'Gicumbi', province: 'Northern Province', latitude: -1.6111, longitude: 30.0706 },
  { name: 'Muhanga', province: 'Southern Province', latitude: -2.0784, longitude: 29.7561 },
  { name: 'Karongi', province: 'Western Province', latitude: -2.1583, longitude: 29.3514 },
  { name: 'Rusizi', province: 'Western Province', latitude: -2.4833, longitude: 28.8958 },
  { name: 'Bugesera', province: 'Eastern Province', latitude: -2.2167, longitude: 30.1667 },
  { name: 'Nyamagabe', province: 'Southern Province', latitude: -2.4722, longitude: 29.5667 },
];

export function Weather() {
  const { language, t } = useLanguage();
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictLocation>(RWANDA_DISTRICTS[0]);
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [locating, setLocating] = useState<boolean>(false);

  useEffect(() => {
    fetchWeather(selectedDistrict.latitude, selectedDistrict.longitude);
  }, [selectedDistrict]);

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,precipitation_sum,rain_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Africa%2FKigali`
      );

      if (!response.ok) {
        throw new Error('Failed to retrieve weather data from Open-Meteo');
      }

      const data = await response.json();
      setWeatherData(data);
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError('Unable to load weather forecast right now. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const customLoc: DistrictLocation = {
          name: 'Your Current Location',
          province: 'GPS Detected',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setSelectedDistrict(customLoc);
        setLocating(false);
      },
      (geoError) => {
        console.warn('Geolocation error:', geoError);
        alert('Could not access your location. Please select a district from the list.');
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const getWeatherInterpretation = (code: number) => {
    // WMO Weather interpretation codes (WW)
    if (code === 0) return { label: 'Clear Sky', icon: Sun, color: 'text-amber-500', bg: 'from-amber-400 to-orange-500' };
    if (code === 1 || code === 2 || code === 3) return { label: 'Mainly Clear / Partly Cloudy', icon: CloudSun, color: 'text-sky-500', bg: 'from-sky-400 to-blue-600' };
    if (code === 45 || code === 48) return { label: 'Foggy / Mist', icon: CloudSun, color: 'text-slate-400', bg: 'from-slate-400 to-slate-600' };
    if (code >= 51 && code <= 55) return { label: 'Light Drizzle', icon: CloudRain, color: 'text-blue-400', bg: 'from-blue-400 to-indigo-500' };
    if (code >= 61 && code <= 65) return { label: 'Moderate to Heavy Rain', icon: CloudRain, color: 'text-blue-600', bg: 'from-blue-600 to-cyan-700' };
    if (code >= 80 && code <= 82) return { label: 'Rain Showers', icon: CloudRain, color: 'text-indigo-500', bg: 'from-indigo-500 to-blue-700' };
    if (code >= 95 && code <= 99) return { label: 'Thunderstorm', icon: AlertTriangle, color: 'text-rose-500', bg: 'from-purple-600 to-slate-800' };
    return { label: 'Cloudy', icon: CloudSun, color: 'text-slate-500', bg: 'from-green-600 to-sky-700' };
  };

  // Agricultural advisory calculation
  const getFarmingAdvice = (current: any, todayDaily: any) => {
    const temp = current?.temperature_2m ?? 22;
    const humidity = current?.relative_humidity_2m ?? 65;
    const precipProb = todayDaily?.precipitation_probability_max?.[0] ?? 20;
    const windSpeed = current?.wind_speed_10m ?? 8;

    const advices: { title: string; desc: string; type: 'success' | 'warning' | 'info' }[] = [];

    // Spraying advice
    if (windSpeed > 15 || precipProb > 50) {
      advices.push({
        title: language === 'rw' ? 'Kwirinda Gutera Imiti Ubu' : 'Avoid Chemical Spraying',
        desc: language === 'rw' 
          ? 'Imvura cyangwa umuyaga mwinshi bishobora gukura imiti ku bimera. Tegereza umunsi utuje.' 
          : 'High probability of rain or strong winds can wash away agrochemicals or cause spray drift.',
        type: 'warning'
      });
    } else {
      advices.push({
        title: language === 'rw' ? 'Igihe Cyiza cyo Gutera Imiti n\'Ifumbire' : 'Favorable Spraying Conditions',
        desc: language === 'rw' 
          ? 'Umuyaga uri hasi kandi nta mvura nyinshi iteganijwe. Ni igihe cyiza cyo gutera imiti.' 
          : 'Low wind and moderate dry weather make this an optimal window for foliar fertilizer and pesticide application.',
        type: 'success'
      });
    }

    // Irrigation & Soil Moisture
    if (precipProb > 60) {
      advices.push({
        title: language === 'rw' ? 'Kurinda Kuhira Birenze Urugero' : 'Delay Field Irrigation',
        desc: language === 'rw'
          ? 'Imvura iteganijwe muri iki gihe. Rinda amazi kurenga mu murima.'
          : 'Significant precipitation expected today. Allow natural rainfall to hydrate crops and conserve irrigation water.',
        type: 'info'
      });
    } else {
      advices.push({
        title: language === 'rw' ? 'Kuhira Imyaka n\'Ibimera' : 'Field Irrigation Recommended',
        desc: language === 'rw'
          ? 'Ubuhehere buri hasi. Hira imyaka n\'ingemwe mu gitondo kare cyangwa ku mugoroba.'
          : 'Dry conditions observed. Ensure sensitive seedlings and vegetables receive sufficient water in early morning or late evening.',
        type: 'info'
      });
    }

    // Harvesting advice
    if (precipProb < 30 && temp >= 20) {
      advices.push({
        title: language === 'rw' ? 'Igihe Cyiza cyo Gusarura no Kuanika' : 'Ideal Harvest & Drying Window',
        desc: language === 'rw'
          ? 'Ikirere cyiza cyo gusarura ibishyimbo, ibigori, cyangwa kwanika umusaruro ku zuba.'
          : 'Optimal warm, dry atmospheric conditions for harvesting grains, pulses, and solar crop drying.',
        type: 'success'
      });
    }

    return advices;
  };

  const filteredDistricts = RWANDA_DISTRICTS.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.province.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-green-900 via-slate-900 to-sky-950 text-white py-16">
        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=2000&auto=format&fit=crop" 
            alt="Agriculture Weather" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
            <CloudSun className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-green-200">
              {language === 'rw' ? 'Iteganyagihe ry\'Ubuhinzi' : 'AgroNavo Weather Intelligence'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            {language === 'rw' ? 'Iteganyagihe ry\'Ubuhinzi mu Rwanda' : 'Rwanda Agricultural Weather Forecast'}
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl font-light">
            {language === 'rw' 
              ? 'Reba iteganyagihe nyaryo ry\'uturere twose tw\'u Rwanda, ubushyuhe, imvura, n\'inama z\'ingenzi mu buhinzi.'
              : 'Real-time hyper-local weather conditions, 7-day rainfall forecasts, and agronomic field advisories across Rwanda.'}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* District Selector & Location Bar */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input 
                  type="text"
                  placeholder={language === 'rw' ? 'Shakisha akarere cyangwa intara...' : 'Search district or province...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              {/* Quick Select District Dropdown */}
              <div className="w-full sm:w-auto flex-1">
                <select
                  value={selectedDistrict.name}
                  onChange={(e) => {
                    const match = RWANDA_DISTRICTS.find(d => d.name === e.target.value);
                    if (match) setSelectedDistrict(match);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  {filteredDistricts.map(d => (
                    <option key={d.name} value={d.name}>
                      {d.name} ({d.province})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              >
                <MapPin className="w-4 h-4 text-green-600" />
                {locating ? (language === 'rw' ? 'Gushakisha...' : 'Detecting GPS...') : (language === 'rw' ? 'Ahantu Ndi Ubu' : 'Use Current Location')}
              </button>

              <button
                onClick={() => fetchWeather(selectedDistrict.latitude, selectedDistrict.longitude)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                title="Refresh Forecast"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-green-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center my-8">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-rose-900 mb-1">{language === 'rw' ? 'Habaye Ikibazo' : 'Weather Unavailable'}</h3>
            <p className="text-sm text-rose-700 mb-4">{error}</p>
            <button
              onClick={() => fetchWeather(selectedDistrict.latitude, selectedDistrict.longitude)}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              {language === 'rw' ? 'Ongera Ugerageze' : 'Try Again'}
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !error && (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl p-8 h-80 border border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-16 bg-slate-200 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-16 bg-slate-200 rounded"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 h-80 border border-slate-200">
                <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-14 bg-slate-200 rounded"></div>
                  <div className="h-14 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 h-64 border border-slate-200">
              <div className="h-6 bg-slate-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Live Weather Content */}
        {!loading && !error && weatherData && (
          <div className="space-y-8">
            {/* Top Row: Current Weather Hero + Agricultural Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Primary Weather Card */}
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
                <div className="absolute right-0 top-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/60 pb-6">
                  <div>
                    <div className="flex items-center gap-2 text-green-400 font-bold text-sm tracking-wide uppercase mb-1">
                      <MapPin className="w-4 h-4" />
                      <span>{selectedDistrict.name}</span>
                      <span className="text-slate-400 font-normal">({selectedDistrict.province})</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {language === 'rw' ? 'Igihe Giheruka:' : 'Live Readings:'} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                    {(() => {
                      const interp = getWeatherInterpretation(weatherData.current?.weather_code || 0);
                      const Icon = interp.icon;
                      return (
                        <>
                          <Icon className={`w-8 h-8 ${interp.color}`} />
                          <span className="text-sm font-semibold text-white">{interp.label}</span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="my-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-baseline">
                      <span className="text-6xl sm:text-7xl font-extrabold tracking-tighter text-white">
                        {Math.round(weatherData.current?.temperature_2m ?? 0)}
                      </span>
                      <span className="text-4xl font-light text-green-400 ml-1">°C</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1">
                      {language === 'rw' ? 'Bimeze nka:' : 'Feels like:'} {Math.round(weatherData.current?.apparent_temperature ?? 0)}°C
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <Droplets className="w-3.5 h-3.5 text-sky-400" /> {language === 'rw' ? 'Ubuhehere' : 'Humidity'}
                      </span>
                      <span className="text-base font-bold text-white">
                        {weatherData.current?.relative_humidity_2m ?? 0}%
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <CloudRain className="w-3.5 h-3.5 text-blue-400" /> {language === 'rw' ? 'Imvura' : 'Rain'}
                      </span>
                      <span className="text-base font-bold text-white">
                        {weatherData.current?.precipitation ?? 0} mm
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <Wind className="w-3.5 h-3.5 text-teal-400" /> {language === 'rw' ? 'Umuyaga' : 'Wind'}
                      </span>
                      <span className="text-base font-bold text-white">
                        {weatherData.current?.wind_speed_10m ?? 0} km/h
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
                      <span className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Max/Min
                      </span>
                      <span className="text-base font-bold text-white">
                        {Math.round(weatherData.daily?.temperature_2m_max?.[0] ?? 0)}° / {Math.round(weatherData.daily?.temperature_2m_min?.[0] ?? 0)}°
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-700/60">
                  <span className="flex items-center gap-1">
                    <Sun className="w-4 h-4 text-amber-400" /> 
                    {language === 'rw' ? 'Izuba Rirashe:' : 'Sunrise:'} {weatherData.daily?.sunrise?.[0] ? new Date(weatherData.daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '06:00'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Compass className="w-4 h-4 text-sky-400" /> 
                    {language === 'rw' ? 'Izuba Rirenze:' : 'Sunset:'} {weatherData.daily?.sunset?.[0] ? new Date(weatherData.daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '18:10'}
                  </span>
                </div>
              </div>

              {/* Agricultural Action Advisory Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-200 flex flex-col">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-green-100 rounded-lg text-green-700">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {language === 'rw' ? 'Inama z\'Iteganyagihe mu Buhinzi' : 'Agronomic Action Advisory'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {language === 'rw' ? 'Bishingiye ku kirere cy\'uyu munsi' : 'Tailored to today\'s weather patterns'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 flex-1 flex flex-col justify-between">
                  {getFarmingAdvice(weatherData.current, weatherData.daily).map((adv, idx) => (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-xl border transition-all ${
                        adv.type === 'success' 
                          ? 'bg-green-50/70 border-green-200 text-green-950' 
                          : adv.type === 'warning' 
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                          : 'bg-sky-50/70 border-sky-200 text-sky-950'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {adv.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />}
                        {adv.type === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        {adv.type === 'info' && <Droplets className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />}
                        <div>
                          <h4 className="text-xs font-bold mb-0.5">{adv.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{adv.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7-Day Extended Forecast */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {language === 'rw' ? 'Iteganyagihe ry\'Iminsi 7' : '7-Day Farming Weather Outlook'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {language === 'rw' ? 'Iteganyagihe ryagufasha gupanga ihinga, gutera ifumbire, no gusarura.' : 'Plan planting, weeding, fertilizing, and harvesting schedules with confidence.'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs text-slate-600 font-medium self-start sm:self-auto">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>Africa/Kigali Timezone</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {weatherData.daily?.time?.map((dateStr: string, index: number) => {
                  const date = new Date(dateStr);
                  const isToday = index === 0;
                  const dayName = isToday 
                    ? (language === 'rw' ? 'Uyu Munsi' : 'Today') 
                    : date.toLocaleDateString(language === 'rw' ? 'rw-RW' : 'en-US', { weekday: 'short' });
                  
                  const maxT = Math.round(weatherData.daily.temperature_2m_max[index]);
                  const minT = Math.round(weatherData.daily.temperature_2m_min[index]);
                  const rainProb = weatherData.daily.precipitation_probability_max[index] ?? 0;
                  const rainSum = weatherData.daily.precipitation_sum[index] ?? 0;
                  const code = weatherData.daily.weather_code[index];
                  const interp = getWeatherInterpretation(code);
                  const Icon = interp.icon;

                  return (
                    <div 
                      key={dateStr}
                      className={`p-4 rounded-xl border flex flex-col items-center text-center transition-all ${
                        isToday 
                          ? 'bg-green-50/80 border-green-300 ring-2 ring-green-600/20 shadow-sm' 
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isToday ? 'text-green-700' : 'text-slate-600'}`}>
                        {dayName}
                      </span>
                      <span className="text-[11px] text-slate-400 mb-3">
                        {date.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>

                      <div className="my-2 p-2.5 bg-white rounded-full shadow-xs">
                        <Icon className={`w-7 h-7 ${interp.color}`} />
                      </div>

                      <span className="text-[11px] font-medium text-slate-600 line-clamp-1 mb-3">
                        {interp.label.split('/')[0]}
                      </span>

                      <div className="flex items-center gap-2 font-bold text-sm text-slate-800 mb-2">
                        <span className="text-slate-900">{maxT}°</span>
                        <span className="text-slate-400 text-xs font-normal">/</span>
                        <span className="text-slate-500 text-xs">{minT}°</span>
                      </div>

                      <div className="mt-auto w-full pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span className="flex items-center gap-0.5 text-blue-600 font-bold">
                          <CloudRain className="w-3 h-3" /> {rainProb}%
                        </span>
                        <span>{rainSum}mm</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
