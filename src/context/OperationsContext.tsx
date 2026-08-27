import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { 
  UserRole, 
  Zone, 
  Incident, 
  AIRecommendation, 
  Facility, 
  RouteOption, 
  TempleQueueStatus, 
  VolunteerTask,
  IncidentType
} from '../types';
import { 
  INITIAL_ZONES, 
  INITIAL_INCIDENTS, 
  INITIAL_RECOMMENDATIONS, 
  INITIAL_FACILITIES, 
  INITIAL_ROUTES, 
  INITIAL_TEMPLE_STATUS 
} from '../data/initialData';
import { generateUniqueId } from '../utils/idGenerator';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  timestamp: string;
  roleTarget?: UserRole | 'ALL';
}

export interface OperationsContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  
  // Live Operational Data State
  zones: Zone[];
  selectedZone: Zone;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  
  incidents: Incident[];
  recommendations: AIRecommendation[];
  activeRecommendation: AIRecommendation;
  facilities: Facility[];
  routes: RouteOption[];
  templeStatus: TempleQueueStatus;
  volunteerTasks: VolunteerTask[];
  notifications: NotificationItem[];
  
  // Live Operational Actions
  approveRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  acknowledgeIncident: (id: string) => void;
  assignIncidentUnits: (id: string, units: string[]) => void;
  resolveIncident: (id: string) => void;
  reportIncident: (data: {
    type: IncidentType;
    title: string;
    description: string;
    zoneId: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    locationDetails: string;
    coordinates?: { x: number; y: number };
    photoUrl?: string;
    audioRecorded?: boolean;
  }) => void;
  
  updateVolunteerTaskStatus: (
    taskId: string, 
    status: VolunteerTask['status'], 
    evidenceNotes?: string, 
    evidencePhoto?: string
  ) => void;
  
  triggerPilgrimSos: (sosType: string, details?: string) => void;
  dismissNotification: (id: string) => void;
  divertRouteManually: (routeId: string, activate: boolean) => void;
  
  audioAlertEnabled: boolean;
  setAudioAlertEnabled: (enabled: boolean) => void;

  networkStatus: 'ONLINE' | 'LOW' | 'OFFLINE';
  setNetworkStatus: (status: 'ONLINE' | 'LOW' | 'OFFLINE') => void;
  lastSyncedTime: string;

  pilgrimZoneId: string;
  setPilgrimZoneId: (zoneId: string) => void;
  updateZoneRisk: (zoneId: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', riskScore?: number) => void;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('police');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>('sector-c');
  const [audioAlertEnabled, setAudioAlertEnabled] = useState<boolean>(true);
  const [networkStatus, setNetworkStatus] = useState<'ONLINE' | 'LOW' | 'OFFLINE'>('LOW');
  const [lastSyncedTime] = useState<string>('2 mins ago');
  const [pilgrimZoneId, setPilgrimZoneId] = useState<string>('sector-c');

  // Entities state
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>(INITIAL_RECOMMENDATIONS);
  const [facilities] = useState<Facility[]>(INITIAL_FACILITIES);
  const [routes, setRoutes] = useState<RouteOption[]>(INITIAL_ROUTES);
  const [templeStatus] = useState<TempleQueueStatus>(INITIAL_TEMPLE_STATUS);
  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>([
    {
      id: 'task-101',
      volunteerId: 'VOL-402',
      title: 'Distribute ORS Sachets & Water at Pillar 14',
      instruction: 'Setup hydration outpost opposite Dnyaneshwar Hall. Assist 3 dehydrated senior pilgrims.',
      zoneId: 'sector-c',
      zoneName: 'Sector C (Palkhi Marg)',
      priority: 'HIGH',
      status: 'ASSIGNED',
      createdAt: '4 mins ago',
    },
    {
      id: 'task-102',
      volunteerId: 'VOL-402',
      title: 'Verify Namdev Gate Barricade Clearance',
      instruction: 'Coordinate with Temple Police to remove temporary vendor encroachment on East Gate steps.',
      zoneId: 'sector-b',
      zoneName: 'Sector B (Temple Quad)',
      priority: 'MEDIUM',
      status: 'IN_ACTION',
      createdAt: '12 mins ago',
    },
  ]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'VARI-Net Online',
      message: 'Ground Intelligence engine monitoring 5 pilgrimage zones in Pandharpur.',
      type: 'INFO',
      timestamp: 'Just now',
      roleTarget: 'ALL',
    },
  ]);

  // Selected Zone lookup
  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[2] || zones[0];
  const activeRecommendation = recommendations.find(r => r.status === 'PENDING_APPROVAL' || r.status === 'APPROVED') || recommendations[0];

  // Action: Approve AI Recommendation
  const approveRecommendation = useCallback((id: string) => {
    setRecommendations(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'APPROVED',
          approvedBy: 'Superintendent of Police & District Collector',
          approvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return r;
    }));

    // Update routes: Mark main corridor diverted and Bypass 2 as safe recommendation
    setRoutes(prev => prev.map(r => {
      if (r.id === 'route-main') return { ...r, status: 'BLOCKED', activeDiverted: true };
      if (r.id === 'route-bypass-2') return { ...r, status: 'RECOMMENDED_SAFE', activeDiverted: true };
      return r;
    }));

    // Update sector status and reallocated units
    setZones(prev => prev.map(z => {
      if (z.id === 'sector-c') {
        return {
          ...z,
          status: 'DIVERTED',
          activeUnits: { police: 30, volunteers: 63, ambulances: 4 },
        };
      }
      return z;
    }));

    // Add critical execution task for field volunteers
    setVolunteerTasks(prev => [
      {
        id: generateUniqueId('task'),
        volunteerId: 'VOL-402',
        title: 'EXECUTE: Divert Crowd to Bypass 2 at Shivaji Chowk',
        instruction: 'Setup directional signage, open Bypass 2 gate barricade, and guide oncoming Warkari Dindis.',
        zoneId: 'sector-c',
        zoneName: 'Sector C (Palkhi Marg)',
        priority: 'CRITICAL',
        status: 'ASSIGNED',
        createdAt: 'Just now',
      },
      ...prev,
    ]);

    // Send dispatch notification across network
    setNotifications(prev => [
      {
        id: generateUniqueId('notif'),
        title: '✅ Action Approved: Flow Diversion Active',
        message: 'Police Command approved Bypass 2 diversion. Automated task dispatch sent to 18 volunteers.',
        type: 'SUCCESS',
        timestamp: 'Just now',
        roleTarget: 'ALL',
      },
      ...prev,
    ]);
  }, []);

  const rejectRecommendation = useCallback((id: string) => {
    setRecommendations(prev => prev.map(r => {
      if (r.id === id) return { ...r, status: 'REJECTED' };
      return r;
    }));
    setNotifications(prev => [
      {
        id: generateUniqueId('notif'),
        title: 'Action Rejected by Human Authority',
        message: 'Command center declined the automated recommendation. Standard monitoring continues.',
        type: 'WARNING',
        timestamp: 'Just now',
        roleTarget: 'police',
      },
      ...prev,
    ]);
  }, []);

  const acknowledgeIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(i => {
      if (i.id === id) return { ...i, status: 'ACKNOWLEDGED' };
      return i;
    }));
  }, []);

  const assignIncidentUnits = useCallback((id: string, units: string[]) => {
    setIncidents(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: 'IN_PROGRESS',
          assignedUnits: units,
          assignedTo: units.join(', '),
        };
      }
      return i;
    }));
    setNotifications(prev => [
      {
        id: generateUniqueId('notif'),
        title: 'Units Dispatched',
        message: `Assigned ${units.join(', ')} to incident #${id}.`,
        type: 'INFO',
        timestamp: 'Just now',
      },
      ...prev,
    ]);
  }, []);

  const resolveIncident = useCallback((id: string) => {
    setIncidents(prev => prev.map(i => {
      if (i.id === id) {
        return {
          ...i,
          status: 'RESOLVED',
          resolvedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return i;
    }));
  }, []);

  const reportIncident = useCallback((data: {
    type: IncidentType;
    title: string;
    description: string;
    zoneId: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    locationDetails: string;
    coordinates?: { x: number; y: number };
    photoUrl?: string;
    audioRecorded?: boolean;
  }) => {
    const zone = zones.find(z => z.id === data.zoneId);
    const newInc: Incident = {
      id: generateUniqueId('inc'),
      type: data.type,
      title: data.title,
      description: data.description,
      zoneId: data.zoneId,
      zoneName: zone ? `${zone.code} — ${zone.name}` : data.zoneId,
      priority: data.priority,
      status: 'NEW',
      reportedBy: currentRole === 'volunteer' ? 'Field Volunteer VOL-402' : 'Citizen Pilgrim App',
      reportedRole: currentRole === 'volunteer' ? 'VOLUNTEER' : 'PILGRIM',
      timestamp: 'Just now',
      locationDetails: data.locationDetails,
      coordinates: data.coordinates || { x: 420, y: 490 },
      evidenceUrl: data.photoUrl,
      audioNote: data.audioRecorded ? 'Voice Dispatch Recorded (0:14)' : undefined,
    };

    setIncidents(prev => [newInc, ...prev]);

    setNotifications(prev => [
      {
        id: generateUniqueId('notif'),
        title: `🚨 New Incident: ${data.title}`,
        message: `${data.priority} priority report logged in ${zone?.code || data.zoneId}.`,
        type: data.priority === 'CRITICAL' || data.priority === 'HIGH' ? 'ALERT' : 'WARNING',
        timestamp: 'Just now',
        roleTarget: 'police',
      },
      ...prev,
    ]);
  }, [zones, currentRole]);

  const updateVolunteerTaskStatus = useCallback((
    taskId: string, 
    status: VolunteerTask['status'], 
    evidenceNotes?: string, 
    evidencePhoto?: string
  ) => {
    setVolunteerTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          status,
          evidenceNotes: evidenceNotes || t.evidenceNotes,
          evidencePhoto: evidencePhoto || t.evidencePhoto,
        };
      }
      return t;
    }));

    if (status === 'COMPLETED') {
      setNotifications(prev => [
        {
          id: generateUniqueId('notif'),
          title: 'Task Completed by Volunteer',
          message: `Task #${taskId} verified with evidence and closed on ground.`,
          type: 'SUCCESS',
          timestamp: 'Just now',
          roleTarget: 'ALL',
        },
        ...prev,
      ]);
    }
  }, []);

  const triggerPilgrimSos = useCallback((sosType: string, details?: string) => {
    const newInc: Incident = {
      id: generateUniqueId('sos'),
      type: sosType === 'Medical' ? 'MEDICAL_EMERGENCY' : sosType === 'Lost Person' ? 'LOST_PERSON' : 'STAMPEDE_RISK',
      title: `SOS: ${sosType} Assistance Requested`,
      description: details || `Urgent pilgrim distress signal sent from mobile app with real-time GPS beacon.`,
      zoneId: 'sector-c',
      zoneName: 'Sector C (Palkhi Marg)',
      priority: 'CRITICAL',
      status: 'NEW',
      reportedBy: 'Pilgrim Mobile App (GPS: 17.6745° N, 75.3211° E)',
      reportedRole: 'PILGRIM',
      timestamp: 'Just now',
      locationDetails: 'Palkhi Marg near Shivaji Chowk (Accurate to 3m)',
      coordinates: { x: 430, y: 510 },
    };

    setIncidents(prev => [newInc, ...prev]);

    setNotifications(prev => [
      {
        id: generateUniqueId('notif'),
        title: `🚨 EMERGENCY SOS: ${sosType}`,
        message: 'Pilgrim distress signal transmitted to nearest QRT and ambulance unit.',
        type: 'ALERT',
        timestamp: 'Just now',
        roleTarget: 'ALL',
      },
      ...prev,
    ]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const divertRouteManually = useCallback((routeId: string, activate: boolean) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          activeDiverted: activate,
          status: activate ? 'BLOCKED' : 'CONGESTED',
        };
      }
      return r;
    }));
  }, []);

  const updateZoneRisk = useCallback((zoneId: string, riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL', riskScore?: number) => {
    setZones(prev => prev.map(z => {
      if (z.id === zoneId) {
        const calculatedScore = riskScore !== undefined ? riskScore : (
          riskLevel === 'CRITICAL' ? 88 :
          riskLevel === 'HIGH' ? 74 :
          riskLevel === 'MEDIUM' ? 48 : 22
        );
        return {
          ...z,
          riskLevel,
          riskScore: calculatedScore,
        };
      }
      return z;
    }));
  }, []);

  return (
    <OperationsContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        
        zones,
        selectedZone,
        selectedZoneId,
        setSelectedZoneId,
        
        incidents,
        recommendations,
        activeRecommendation,
        facilities,
        routes,
        templeStatus,
        volunteerTasks,
        notifications,
        
        approveRecommendation,
        rejectRecommendation,
        acknowledgeIncident,
        assignIncidentUnits,
        resolveIncident,
        reportIncident,
        updateVolunteerTaskStatus,
        triggerPilgrimSos,
        dismissNotification,
        divertRouteManually,
        
        audioAlertEnabled,
        setAudioAlertEnabled,

        networkStatus,
        setNetworkStatus,
        lastSyncedTime,

        pilgrimZoneId,
        setPilgrimZoneId,
        updateZoneRisk,
      }}
    >
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (!context) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
