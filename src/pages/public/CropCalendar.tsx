import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { MapPin, Calendar, Sun, CloudRain, ShieldAlert, ArrowRight, CheckCircle2, ChevronRight, MessageSquare, AlertTriangle, Info, Sprout, Tractor, Scissors, Activity, Droplets, Thermometer, Box, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function CropCalendar() {
  const [districts, setDistricts] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [crops, setCrops] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [periods, setPeriods] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [beforePlanting, setBeforePlanting] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  
  const currentMonth = new Date().getMonth() + 1;
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedCropFilter, setSelectedCropFilter] = useState<string>('');
  
  // Crop Details Modal
  const [selectedCropForDetails, setSelectedCropForDetails] = useState<any>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDistrict || selectedSeason) {
      fetchRecommendations();
      fetchActivities();
      fetchBeforePlanting();
      fetchAlerts();
    }
  }, [selectedDistrict, selectedSeason, selectedMonth, selectedCropFilter]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [districtsRes, seasonsRes, cropsRes, periodsRes] = await Promise.all([
        api.get<any[]>('/crop-calendar/districts'),
        api.get<any[]>('/crop-calendar/seasons'),
        api.get<any[]>('/crop-calendar/crops'),
        api.get<any[]>('/crop-calendar/periods')
      ]);
      setDistricts(districtsRes || []);
      setSeasons(seasonsRes || []);
      setCrops(cropsRes || []);
      setPeriods(periodsRes || []);
      
      if (districtsRes && districtsRes.length > 0) {
        setSelectedDistrict(districtsRes[0].id);
      }
      if (seasonsRes && seasonsRes.length > 0) {
        const activeSeason = seasonsRes.find(s => {
           let start = s.start_month;
           let end = s.end_month;
           if (start <= end) return currentMonth >= start && currentMonth <= end;
           return currentMonth >= start || currentMonth <= end;
        });
        setSelectedSeason(activeSeason ? activeSeason.id : seasonsRes[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDistrict) params.append('district_id', selectedDistrict);
      if (selectedSeason) params.append('season_id', selectedSeason);
      if (selectedMonth) params.append('month', selectedMonth.toString());
      
      const res = await api.get<any[]>(`/crop-calendar/recommendations?${params.toString()}`);
      setRecommendations(res || []);
    } catch (err) {
      console.error(err);
      setRecommendations([]);
    }
  };

  const fetchActivities = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDistrict) params.append('district_id', selectedDistrict);
      if (selectedSeason) params.append('season_id', selectedSeason);
      if (selectedMonth) params.append('month', selectedMonth.toString());
      if (selectedCropFilter) params.append('crop_id', selectedCropFilter);
      if (selectedMonth) params.append('month', selectedMonth.toString());
      
      const res = await api.get<any[]>(`/crop-calendar/activities?${params.toString()}`);
      setActivities(res || []);
    } catch (err) {
      console.error(err);
      setActivities([]);
    }
  };
  
  const fetchBeforePlanting = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDistrict) params.append('district_id', selectedDistrict);
      if (selectedCropFilter) params.append('crop_id', selectedCropFilter);
      if (selectedMonth) params.append('month', selectedMonth.toString());
      if (selectedSeason) params.append('season_id', selectedSeason);
      
      const res = await api.get<any[]>(`/crop-calendar/before-planting?${params.toString()}`);
      setBeforePlanting(res || []);
    } catch (err) {
      console.error(err);
      setBeforePlanting([]);
    }
  };

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDistrict) params.append('district_id', selectedDistrict);
      if (selectedCropFilter) params.append('crop_id', selectedCropFilter);
      if (selectedMonth) params.append('month', selectedMonth.toString());
      
      const res = await api.get<any[]>(`/crop-calendar/alerts?${params.toString()}`);
      setAlerts(res || []);
    } catch (err) {
      console.error(err);
      setAlerts([]);
    }
  };

  const monthsList = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD_TO_PLANT': return 'bg-green-100 text-green-800 border-green-200';
      case 'POSSIBLE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'NOT_RECOMMENDED': return 'bg-red-100 text-red-800 border-red-200';
      case 'COMING_SOON': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'GOOD_TO_PLANT': return 'Ni igihe cyiza cyo gutera';
      case 'POSSIBLE': return 'Birashoboka';
      case 'NOT_RECOMMENDED': return 'Ntibisabwa muri iki gihe';
      case 'COMING_SOON': return 'Bizaba byiza mu gihe kiri imbere';
      default: return status;
    }
  };

  const handleAiClick = () => {
     const districtName = districts.find(d => d.id === selectedDistrict)?.name || 'Unknown';
     const seasonName = seasons.find(s => s.id === selectedSeason)?.name || 'Unknown';
     const monthName = monthsList.find(m => m.value === selectedMonth)?.label || 'Unknown';
     const context = `I am farming in ${districtName} district, during ${seasonName}, in the month of ${monthName}. What should I plant now and what activities are recommended?`;
     
     const event = new CustomEvent('agromart-ai-open-with-context', { detail: { context } });
     window.dispatchEvent(event);
  };
  
  // Calculate Current Stage
  const getCurrentStage = () => {
    if (periods.length === 0 || !selectedSeason) return null;
    let relevantPeriod = periods.find(p => p.district_id === selectedDistrict && p.season_id === selectedSeason);
    if (!relevantPeriod && periods.length > 0) relevantPeriod = periods[0];
    if (!relevantPeriod) return null;
    
    const isBetween = (m: number, start: number, end: number) => {
        if (!start || !end) return false;
        if (start <= end) return m >= start && m <= end;
        return m >= start || m <= end; // Wraps around year
    };
    
    if (isBetween(selectedMonth, relevantPeriod.preparation_start, relevantPeriod.preparation_end)) return { step: 1, name: 'Prepare Field', icon: Tractor };
    if (isBetween(selectedMonth, relevantPeriod.planting_start, relevantPeriod.planting_end)) return { step: 2, name: 'Planting', icon: Sprout };
    if (isBetween(selectedMonth, relevantPeriod.growing_start, relevantPeriod.growing_end)) return { step: 3, name: 'Growing', icon: Activity };
    if (isBetween(selectedMonth, relevantPeriod.harvest_start, relevantPeriod.harvest_end)) return { step: 4, name: 'Harvesting', icon: Scissors };
    
    return { step: 0, name: 'Off-Season', icon: Calendar };
  };

  const currentStage = getCurrentStage();

  return (
    <div className="bg-gray-50 min-h-screen pb-12 font-sans">
      {/* Hero */}
      <div className="bg-green-700 text-white py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1592982537447-6f2a6a0a091c?auto=format&fit=crop&q=80&w=2000" alt="Farming" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Rwanda Smart Crop Calendar</h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto mb-8">
            Kumenya igihe cyo gutera n'icyo ugomba gukora kugira ngo ubone umusaruro mwiza.
          </p>
          <button onClick={handleAiClick} className="inline-flex items-center bg-white text-green-700 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-50 transition-colors">
            <MessageSquare className="mr-2" size={20} />
            Ask AgroNavo AI
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
              <div className="relative">
                <Sun className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  {seasons.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop Filter (Optional)</label>
              <div className="relative">
                <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select 
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={selectedCropFilter}
                  onChange={(e) => setSelectedCropFilter(e.target.value)}
                >
                  <option value="">All Crops</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Alerts Section */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
            <ShieldAlert className="text-red-500 mr-2" size={20} />
            Agriculture Alerts
          </h3>
          {alerts && alerts.length > 0 ? (
            <div className="space-y-3">
             {alerts.map(alert => (
                <div key={alert.id} className={`p-4 rounded-xl border flex items-start shadow-sm 
                    ${alert.severity === 'Critical' || alert.severity === 'High' ? 'bg-red-50 border-red-200' : 
                      alert.severity === 'Medium' ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}
                `}>
                   <ShieldAlert className={`mt-0.5 mr-3 shrink-0 
                      ${alert.severity === 'Critical' || alert.severity === 'High' ? 'text-red-500' : 
                        alert.severity === 'Medium' ? 'text-orange-500' : 'text-blue-500'}
                   `} size={24} />
                   <div>
                      <h4 className={`font-bold ${alert.severity === 'Critical' || alert.severity === 'High' ? 'text-red-900' : alert.severity === 'Medium' ? 'text-orange-900' : 'text-blue-900'}`}>
                        {alert.title}
                      </h4>
                      <p className="text-sm text-slate-700 mt-1">{alert.message}</p>
                   </div>
                </div>
             ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg border border-gray-100">No active agriculture alerts for your selected location.</p>
          )}
        </div>

        {/* 1. WHERE ARE YOU IN THE SEASON */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Aho tugeze mu gihembwe (Season Progress)</h2>
          
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full hidden md:block"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
              {[
                { step: 1, name: 'Prepare Field', kiny: 'Gutegura umurima', icon: Tractor },
                { step: 2, name: 'Planting', kiny: 'Gutera imbuto', icon: Sprout },
                { step: 3, name: 'Growing', kiny: 'Gukura', icon: Activity },
                { step: 4, name: 'Harvesting', kiny: 'Gusarura', icon: Scissors }
              ].map((stage) => {
                const isActive = currentStage?.step === stage.step;
                const isPast = currentStage?.step ? currentStage.step > stage.step : false;
                const StageIcon = stage.icon;
                
                return (
                  <div key={stage.step} className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-md border-4 border-white transition-all
                      ${isActive ? 'bg-green-600 text-white scale-110' : 
                        isPast ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <StageIcon size={20} />
                    </div>
                    <span className={`font-bold text-sm text-center ${isActive ? 'text-green-700' : 'text-gray-900'}`}>{stage.name}</span>
                    <span className="text-xs text-gray-500 text-center">{stage.kiny}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            {/* 11. WHAT YOU SHOULD PLANT NOW */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ibyo watera ubu (What You Should Plant Now)</h2>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="bg-white rounded-xl h-64 animate-pulse"></div>)}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map(rec => (
                  <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    {rec.crop_calendar_crops?.image_url ? (
                      <img src={rec.crop_calendar_crops.image_url} alt={rec.crop_calendar_crops.name} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 bg-green-50 flex items-center justify-center"><Sprout size={48} className="text-green-200" /></div>
                    )}
                    <div className="p-5">
                      <div className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border mb-3 ${getStatusColor(rec.recommendation)}`}>
                        {getStatusLabel(rec.recommendation)}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{rec.crop_calendar_crops?.name || 'Unknown Crop'}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4">{rec.crop_calendar_crops?.description}</p>
                      <button onClick={() => setSelectedCropForDetails(rec.crop_calendar_crops)} className="text-green-600 font-medium hover:text-green-700 inline-flex items-center">
                        Read More <ArrowRight className="ml-1" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
                <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-lg">Nta bihingwa byerekanwe muri kano gace mur'iki gihe.</p>
                <p className="text-sm">No crops are currently recommended.</p>
              </div>
            )}

            {/* 2. WHAT YOU SHOULD DO NOW (Farming Activities) */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">Ibyo wakora ubu (Farming Activities)</h2>
            {activities.length > 0 ? (
               <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                 <ul className="divide-y divide-gray-100">
                    {activities.map(activity => (
                      <li key={activity.id} className="p-5 flex items-start">
                         <div className="bg-green-100 text-green-700 p-2 rounded-lg mr-4 shrink-0">
                            <CheckCircle2 size={24} />
                         </div>
                         <div>
                            <h4 className="text-lg font-bold text-gray-900">{activity.activity_name}</h4>
                            <p className="text-gray-600 mt-1">{activity.description}</p>
                            {activity.crop_calendar_crops && (
                               <span className="inline-block mt-2 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                                 {activity.crop_calendar_crops.name}
                               </span>
                            )}
                         </div>
                      </li>
                    ))}
                 </ul>
               </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                <p>Nta bikorwa byihariye byerekanwe.</p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-8">
            {/* 3. BEFORE YOU PLANT (Incorporating contextual data points) */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="text-orange-500 mr-2" size={20} />
                Mbere yo Gutera
              </h3>
              
              {beforePlanting.length > 0 ? (
                 <div className="space-y-3">
                    {beforePlanting.map(bp => (
                       <div key={bp.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 shadow-2xs">
                          {bp.title && (
                            <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center justify-between">
                              <span>{bp.title}</span>
                              {bp.category && (
                                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                                  {bp.category}
                                </span>
                              )}
                            </h4>
                          )}
                          <p className="text-sm text-slate-800 leading-relaxed">{bp.message}</p>
                          {bp.recommendation && (
                            <div className="mt-2 text-xs text-green-800 bg-green-50/80 p-2 rounded-lg border border-green-100">
                              <strong className="text-green-900">Inama:</strong> {bp.recommendation}
                            </div>
                          )}
                       </div>
                    ))}
                 </div>
              ) : (
                 <p className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded-lg border border-gray-100">
                   No current advisory available for your selected location and season.
                 </p>
              )}

              {/* Data integrations widgets (Simulated or fetched) */}
              <div className="mt-6 space-y-3">
                 <div className="flex items-center justify-between p-3 rounded-lg border border-blue-100 bg-blue-50">
                    <div className="flex items-center text-blue-800">
                       <CloudRain size={18} className="mr-2" />
                       <span className="font-medium text-sm">Weather Context</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 text-right">Good Rain expected</span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg border border-purple-100 bg-purple-50">
                    <div className="flex items-center text-purple-800">
                       <Activity size={18} className="mr-2" />
                       <span className="font-medium text-sm">Market Demand</span>
                    </div>
                    <Link to="/market-prices" className="text-xs font-bold text-purple-600 hover:underline">Check live prices</Link>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50">
                    <div className="flex items-center text-red-800">
                       <ShieldAlert size={18} className="mr-2" />
                       <span className="font-medium text-sm">Disease Risk</span>
                    </div>
                    <Link to="/plant-health" className="text-xs font-bold text-red-600 hover:underline">View warnings</Link>
                 </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. ANNUAL CROP CALENDAR */}
        <div className="mb-12 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900">Ingengabihe y'Umwaka (Annual Calendar)</h2>
            <p className="text-gray-500">Ibihe byo gutegura, gutera, no gusarura ku bihingwa bitandukanye.</p>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="w-full text-sm border-collapse min-w-[800px]">
               <thead>
                 <tr>
                    <th className="p-2 border border-gray-200 bg-gray-50 text-left font-bold w-48 shrink-0">Crop</th>
                    {monthsList.map(m => (
                       <th key={m.value} className="p-2 border border-gray-200 bg-gray-50 text-center text-xs font-medium">
                         {m.label.substring(0,3)}
                       </th>
                    ))}
                 </tr>
               </thead>
               <tbody>
                  {periods.length > 0 ? (
                     periods.map(period => (
                       <tr key={period.id}>
                          <td className="p-2 border border-gray-200 font-medium">{period.crop_calendar_crops?.name || 'Crop'}</td>
                          {monthsList.map(m => {
                             let bg = '';
                             let label = '';
                             const isBetween = (mVal: number, start: number, end: number) => {
                                 if (!start || !end) return false;
                                 if (start <= end) return mVal >= start && mVal <= end;
                                 return mVal >= start || mVal <= end;
                             };
                             
                             if (isBetween(m.value, period.preparation_start, period.preparation_end)) { bg = 'bg-yellow-200'; label = 'Prep'; }
                             else if (isBetween(m.value, period.planting_start, period.planting_end)) { bg = 'bg-green-400 text-white'; label = 'Plant'; }
                             else if (isBetween(m.value, period.growing_start, period.growing_end)) { bg = 'bg-green-200'; label = 'Grow'; }
                             else if (isBetween(m.value, period.harvest_start, period.harvest_end)) { bg = 'bg-orange-300 text-white'; label = 'Harv'; }
                             
                             return (
                               <td key={m.value} className={`p-1 border border-gray-200 text-center text-[10px] ${bg}`}>
                                  {label}
                               </td>
                             );
                          })}
                       </tr>
                     ))
                  ) : (
                     <tr><td colSpan={13} className="p-4 text-center text-gray-500">No calendar data found.</td></tr>
                  )}
               </tbody>
            </table>
            
            <div className="flex flex-wrap items-center mt-4 text-xs space-x-4">
               <div className="flex items-center"><div className="w-4 h-4 bg-yellow-200 mr-2"></div> Gutegura (Prepare)</div>
               <div className="flex items-center"><div className="w-4 h-4 bg-green-400 mr-2"></div> Gutera (Plant)</div>
               <div className="flex items-center"><div className="w-4 h-4 bg-green-200 mr-2"></div> Gukura (Grow)</div>
               <div className="flex items-center"><div className="w-4 h-4 bg-orange-300 mr-2"></div> Gusarura (Harvest)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. CROP DETAILS MODAL */}
      {selectedCropForDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 overflow-y-auto">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-8 relative overflow-hidden">
             {selectedCropForDetails.image_url ? (
                <div className="h-64 w-full relative">
                   <img src={selectedCropForDetails.image_url} alt={selectedCropForDetails.name} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                      <h2 className="text-3xl font-bold text-white">{selectedCropForDetails.name}</h2>
                   </div>
                   <button onClick={() => setSelectedCropForDetails(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70">
                      <X size={24} />
                   </button>
                </div>
             ) : (
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-green-50">
                   <h2 className="text-3xl font-bold text-green-900">{selectedCropForDetails.name}</h2>
                   <button onClick={() => setSelectedCropForDetails(null)} className="text-gray-500 hover:text-gray-800">
                      <X size={24} />
                   </button>
                </div>
             )}
             
             <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-6">
                   <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">{selectedCropForDetails.category}</span>
                   {selectedCropForDetails.growing_duration_days && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{selectedCropForDetails.growing_duration_days} Days to harvest</span>
                   )}
                </div>
                
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">{selectedCropForDetails.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <div>
                         <h4 className="font-bold text-gray-900 flex items-center mb-2"><Droplets size={18} className="mr-2 text-blue-500" /> Water & Rainfall</h4>
                         <p className="text-sm text-gray-600">{selectedCropForDetails.rainfall_requirement || 'Information not available.'}</p>
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 flex items-center mb-2"><Thermometer size={18} className="mr-2 text-orange-500" /> Temperature & Soil</h4>
                         <p className="text-sm text-gray-600">Soil: {selectedCropForDetails.soil_type || 'N/A'}</p>
                         <p className="text-sm text-gray-600">Temp: {selectedCropForDetails.temperature_min}°C to {selectedCropForDetails.temperature_max}°C</p>
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 flex items-center mb-2"><Sprout size={18} className="mr-2 text-green-500" /> Seeds & Fertilizer</h4>
                         <p className="text-sm text-gray-600 mb-2"><strong>Seeds:</strong> {selectedCropForDetails.seed_information || 'N/A'}</p>
                         <p className="text-sm text-gray-600"><strong>Fertilizer:</strong> {selectedCropForDetails.fertilizer_information || 'N/A'}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <div>
                         <h4 className="font-bold text-gray-900 flex items-center mb-2"><ShieldAlert size={18} className="mr-2 text-red-500" /> Pests & Diseases</h4>
                         <p className="text-sm text-gray-600 mb-2"><strong>Pests:</strong> {selectedCropForDetails.pest_information || 'N/A'}</p>
                         <p className="text-sm text-gray-600"><strong>Diseases:</strong> {selectedCropForDetails.disease_information || 'N/A'}</p>
                      </div>
                      <div>
                         <h4 className="font-bold text-gray-900 flex items-center mb-2"><Box size={18} className="mr-2 text-indigo-500" /> Storage & Market</h4>
                         <p className="text-sm text-gray-600 mb-2"><strong>Storage:</strong> {selectedCropForDetails.storage_advice || 'N/A'}</p>
                         <p className="text-sm text-gray-600"><strong>Market:</strong> {selectedCropForDetails.market_advice || 'N/A'}</p>
                      </div>
                   </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                   <button onClick={() => setSelectedCropForDetails(null)} className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 font-medium">
                      Close
                   </button>
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}

