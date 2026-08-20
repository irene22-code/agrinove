import React, { useState } from 'react';
import { Sprout, Calendar, List, MapPin, Activity, AlertTriangle, ShieldAlert, History } from 'lucide-react';
import { CropsManager } from '../../components/admin/crop-calendar/CropsManager';
import { SeasonsManager } from '../../components/admin/crop-calendar/SeasonsManager';
import { PeriodsManager } from '../../components/admin/crop-calendar/PeriodsManager';
import { RecommendationsManager } from '../../components/admin/crop-calendar/RecommendationsManager';
import { ActivitiesManager } from '../../components/admin/crop-calendar/ActivitiesManager';
import { BeforePlantingManager } from '../../components/admin/crop-calendar/BeforePlantingManager';
import { AlertsManager } from '../../components/admin/crop-calendar/AlertsManager';
import { AuditLogsManager } from '../../components/admin/crop-calendar/AuditLogsManager';
import { WomenFarmerManager } from '../../components/admin/crop-calendar/WomenFarmerManager';
import { Users } from 'lucide-react';

export default function AdminCropCalendar() {
  const [activeTab, setActiveTab] = useState('crops');

  const tabs = [
    { id: 'crops', label: 'Crops', icon: Sprout },
    { id: 'seasons', label: 'Seasons', icon: Calendar },
    { id: 'periods', label: 'Annual Calendar', icon: List },
    { id: 'recommendations', label: 'What to Plant Now', icon: MapPin },
    { id: 'activities', label: 'Activities', icon: Activity },
    { id: 'before-planting', label: 'Before You Plant', icon: AlertTriangle },
    { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
    { id: 'women-farmer', label: 'Women Farmer', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: History }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Crop Calendar Management</h1>
        <p className="text-gray-500">Manage planting seasons, crop recommendations, farming activities, and agricultural guidance.</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-3 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'crops' && <CropsManager />}
        {activeTab === 'seasons' && <SeasonsManager />}
        {activeTab === 'periods' && <PeriodsManager />}
        {activeTab === 'recommendations' && <RecommendationsManager />}
        {activeTab === 'activities' && <ActivitiesManager />}
        {activeTab === 'before-planting' && <BeforePlantingManager />}
        {activeTab === 'alerts' && <AlertsManager />}
        {activeTab === 'women-farmer' && <WomenFarmerManager />}
        {activeTab === 'audit' && <AuditLogsManager />}
      </div>
    </div>
  );
}
