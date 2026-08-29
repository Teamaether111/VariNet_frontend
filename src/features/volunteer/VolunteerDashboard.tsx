import React, { useState } from 'react';
import { 
  CheckCircle2, 
  MapPin, 
  Droplet, 
  AlertTriangle, 
  Clock, 
  Send
} from 'lucide-react';
import { useOperations } from '../../context/OperationsContext';
import { useLanguage } from '../../context/LanguageContext';
import { GisMap } from '../../components/map/GisMap';
import { GisQuickFilterBar } from '../../components/map/GisQuickFilterBar';
import { FacilityCard } from '../../components/common/FacilityCard';
import { ExpandableActionBar, ActionBarItem } from '../../components/common/ExpandableActionBar';
import { MapLayerState } from '../../types';

export const VolunteerDashboard: React.FC = () => {
  const {
    zones,
    incidents,
    facilities,
    routes,
    volunteerTasks,
    completeVolunteerTask,
    updateFacilityStatus,
    reportIncident,
  } = useOperations();
  const { t } = useLanguage();

  const [quickReportType, setQuickReportType] = useState<string>('MEDICAL_HEAT');
  const [quickReportDesc, setQuickReportDesc] = useState<string>('');
  const [quickReportZone, setQuickReportZone] = useState<string>('sector-c');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  const [mapLayers, setMapLayers] = useState<MapLayerState>({
    routes: true,
    alternateRoutes: true,
    roads: true,
    medicalCamps: true,
    policeBooths: true,
    toilets: true,
    waterPoints: true,
    shelters: true,
    parking: false,
    crowdHeatmap: true,
    incidents: true,
    volunteers: true,
    policeUnits: true,
    ambulances: true,
    traffic: false,
    weatherOverlay: true,
    riskZones: true,
    predictedCongestion: false,
    safeRoutes: true,
    recommendedInterventions: false,
  });

  const handleQuickReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickReportDesc.trim()) return;

    reportIncident({
      title: `${quickReportType.replace('_', ' ')} Alert`,
      description: quickReportDesc,
      type: quickReportType as any,
      priority: quickReportType.includes('HEAT') || quickReportType.includes('STAMPEDE') ? 'CRITICAL' : 'HIGH',
      location: {
        zoneId: quickReportZone,
        lat: 17.6745,
        lng: 75.3285,
        address: `${zones.find(z => z.id === quickReportZone)?.name || 'Sector C'} Ground Post`,
      },
    });

    setQuickReportDesc('');
    setReportSuccess(true);
    setTimeout(() => setReportSuccess(false), 4000);
  };

  const pendingTasks = volunteerTasks.filter(t => t.status !== 'COMPLETED');
  const completedTasks = volunteerTasks.filter(t => t.status === 'COMPLETED');

  // Role-Specific Action Bar Accordion Categories
  const actionBarItems: ActionBarItem[] = [
    {
      id: 'assigned-tasks',
      title: t('actionBar.assignedTasks', 'Assigned Tasks'),
      icon: <Clock className="w-4 h-4" />,
      badge: `${pendingTasks.length} Pending`,
      badgeColor: 'bg-orange-100 text-orange-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>{pendingTasks.length} {t('volunteer.assignedTasks', 'Pending Tasks')} in Sector</span>
            <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {completedTasks.length} Completed
            </span>
          </div>

          {pendingTasks.length === 0 ? (
            <div className="p-8 text-center bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5]">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-[#1A2B47]">All assigned volunteer tasks completed!</p>
              <p className="text-xs text-gray-500 mt-1">Stand by for new sector task dispatches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-[#F9F8F6] rounded-2xl border border-[#E5E5E5] p-5 shadow-2xs flex flex-col justify-between space-y-3.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                        {task.priority} PRIORITY
                      </span>
                      <span className="text-xs font-mono font-bold text-gray-500">{task.estimatedMinutes || 10} mins</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-[#1A2B47] mt-1">{task.title}</h4>
                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">{task.description || task.instruction}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
                    <div className="text-xs text-gray-500 font-bold flex items-center gap-1 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-[#F27D26] shrink-0" />
                      <span className="truncate">{task.location || task.zoneName}</span>
                    </div>
                    <button
                      id={`btn-complete-task-${task.id}`}
                      onClick={() => completeVolunteerTask(task.id)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 duration-150 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{t('volunteer.taskDone', 'Mark Done')}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'interactive-gis-map',
      title: t('actionBar.interactiveGisMap', 'Interactive GIS Map'),
      icon: <MapPin className="w-4 h-4" />,
      badge: 'Live GPS',
      badgeColor: 'bg-emerald-100 text-emerald-900',
      content: (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
            <span>Real-time GPS layers: Medical camps, water refill tanks, volunteer squads, and pinch points.</span>
            <span className="text-xs font-bold text-[#F27D26]">1,200 Volunteer Squads Online</span>
          </div>

          {/* Standardized Uniform GIS Quick-Filter Bar */}
          <GisQuickFilterBar
            layers={mapLayers}
            onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
          />

          <div className="rounded-2xl border border-[#E5E5E5] overflow-hidden bg-white p-2">
            <GisMap
              zones={zones}
              incidents={incidents}
              facilities={facilities}
              routes={routes}
              layers={mapLayers}
              selectedZoneId={zones[0]?.id}
              onSelectZone={() => {}}
              onToggleLayer={(key) => setMapLayers(prev => ({ ...prev, [key]: !prev[key] }))}
              onSetLayers={setMapLayers}
              role="volunteer"
            />
          </div>
        </div>
      ),
    },
    {
      id: 'facilities',
      title: t('actionBar.facilities', 'Facilities'),
      icon: <Droplet className="w-4 h-4" />,
      badge: `${facilities.length} Stations`,
      badgeColor: 'bg-sky-100 text-sky-900',
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-gray-500 font-bold">
            <span>Essential Relief, Hydration & Sanitation Stations</span>
            <span className="font-mono">{facilities.length} Total Registered Stations</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {facilities.map(fac => (
              <FacilityCard
                key={fac.id}
                facility={fac}
                onUpdateStatus={updateFacilityStatus}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'quick-report',
      title: t('actionBar.quickIncidentReport', 'Quick Incident Report'),
      icon: <AlertTriangle className="w-4 h-4" />,
      badge: '10-Sec SOS',
      badgeColor: 'bg-red-100 text-red-900',
      content: (
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-black tracking-wider uppercase border border-red-200">
              {t('volunteer.reportIncident', '10-Second Quick Ground Report')}
            </span>
            <h4 className="text-lg sm:text-xl font-black text-[#1A2B47] mt-2">
              Broadcast Live Incident to Police Command Triage
            </h4>
          </div>

          {reportSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Incident broadcast to Police Command dispatch system!</span>
            </div>
          )}

          <form onSubmit={handleQuickReport} className="space-y-4 bg-[#F9F8F6] p-5 rounded-2xl border border-[#E5E5E5]">
            <div>
              <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
                Incident Category
              </label>
              <select
                value={quickReportType}
                onChange={(e) => setQuickReportType(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 font-bold text-xs sm:text-sm bg-white"
              >
                <option value="MEDICAL_HEAT">Medical: Heat Exhaustion / Dehydration</option>
                <option value="CROWD_SURGE">Crowd Surge / Pinch Point</option>
                <option value="WATER_DEPLETED">Resource: Water Tank Empty</option>
                <option value="LOST_PERSON">Missing Pilgrim / Child</option>
                <option value="ROUTE_BLOCKED">Corridor Blockage / Vehicle Stall</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
                Sector Location
              </label>
              <select
                value={quickReportZone}
                onChange={(e) => setQuickReportZone(e.target.value)}
                className="w-full min-h-[44px] px-3.5 rounded-xl border border-gray-300 font-bold text-xs sm:text-sm bg-white"
              >
                {zones.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.code} — {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-gray-600 mb-1.5">
                Ground Notes (Observations)
              </label>
              <textarea
                value={quickReportDesc}
                onChange={(e) => setQuickReportDesc(e.target.value)}
                placeholder="e.g., 3 senior pilgrims resting with dizziness near Gate 4, ORS needed immediately..."
                rows={3}
                className="w-full p-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium bg-white"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] bg-red-600 hover:bg-red-700 active:scale-95 duration-150 text-white font-black py-3 px-5 rounded-xl uppercase tracking-widest text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Ground Alert</span>
            </button>
          </form>
        </div>
      ),
    },
  ];

  return (
    <div id="volunteer-field-dashboard" className="space-y-6">
      
      {/* 1. TOP HEADER & TELEMETRY */}
      <div className="bg-white rounded-3xl border border-[#E5E5E5] p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-orange-50 text-[#F27D26] text-xs font-black tracking-wider uppercase border border-orange-200">
                {t('volunteer.title', 'Volunteer Ground Force')}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1A2B47] leading-tight mt-2">
              {t('volunteer.myTasks', 'Field Operations & Real-Time Task Dispatch')}
            </h2>
          </div>
        </div>
      </div>

      {/* SINGLE REUSABLE EXPANDABLE ACTION BAR AT TOP OF MAIN CONTENT */}
      <ExpandableActionBar
        id="volunteer-action-bar"
        items={actionBarItems}
      />
    </div>
  );
};
