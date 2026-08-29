import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  UserRole,
  Zone,
  Incident,
  AIRecommendation,
  Facility,
  RouteOption,
  TempleQueueStatus,
  VolunteerTask,
  IncidentType,
} from '../types';

import { apiService } from '../api/apiService';

import {
  INITIAL_ZONES,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ROUTES,
  INITIAL_TEMPLE_STATUS,
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

  updateZoneRisk: (
    zoneId: string,
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    riskScore?: number
  ) => void;
}

const OperationsContext = createContext<
  OperationsContextType | undefined
>(undefined);

export const OperationsProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('police');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    'sector-c'
  );
  const [audioAlertEnabled, setAudioAlertEnabled] = useState(true);
  const [networkStatus, setNetworkStatus] = useState<
    'ONLINE' | 'LOW' | 'OFFLINE'
  >('LOW');

  const [lastSyncedTime] = useState('2 mins ago');
  const [pilgrimZoneId, setPilgrimZoneId] = useState('sector-c');

  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [recommendations, setRecommendations] = useState<
    AIRecommendation[]
  >(INITIAL_RECOMMENDATIONS);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>(INITIAL_ROUTES);
  const [templeStatus] = useState<TempleQueueStatus>(
    INITIAL_TEMPLE_STATUS
  );

  const [volunteerTasks, setVolunteerTasks] = useState<VolunteerTask[]>([
    {
      id: 'task-101',
      volunteerId: 'VOL-402',
      title: 'Distribute ORS Sachets & Water at Pillar 14',
      instruction:
        'Setup hydration outpost opposite Dnyaneshwar Hall. Assist 3 dehydrated senior pilgrims.',
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
      instruction:
        'Coordinate with Temple Police to remove temporary vendor encroachment on East Gate steps.',
      zoneId: 'sector-b',
      zoneName: 'Sector B (Temple Quad)',
      priority: 'MEDIUM',
      status: 'IN_ACTION',
      createdAt: '12 mins ago',
    },
  ]);

  const [notifications, setNotifications] = useState<
    NotificationItem[]
  >([
    {
      id: 'notif-1',
      title: 'VARI-Net Online',
      message:
        'Ground intelligence engine monitoring 5 pilgrimage zones in Pandharpur.',
      type: 'INFO',
      timestamp: 'Just now',
      roleTarget: 'ALL',
    },
  ]);

  // Load local facility data
  useEffect(() => {
    let cancelled = false;

    const loadFacilities = async () => {
      try {
        const facilityData = await apiService.getFacilities();

        if (cancelled) return;

        setFacilities(facilityData);
      } catch (error) {
        if (cancelled) return;

        console.error('Facility synchronization failed:', error);

        setNotifications(previous => [
          {
            id: generateUniqueId('notif'),
            title: 'Facility synchronization failed',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load facilities',
            type: 'WARNING',
            timestamp: 'Just now',
            roleTarget: 'ALL',
          },
          ...previous,
        ]);
      }
    };

    loadFacilities();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load incidents from FastAPI
  useEffect(() => {
    let cancelled = false;

    const loadIncidents = async () => {
      try {
        const incidentData = await apiService.getIncidents();

        if (cancelled) return;

        setIncidents(incidentData);
      } catch (error) {
        if (cancelled) return;

        console.error('Incident synchronization failed:', error);

        setNotifications(previous => [
          {
            id: generateUniqueId('notif'),
            title: 'Incident synchronization failed',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to load incidents',
            type: 'WARNING',
            timestamp: 'Just now',
            roleTarget: 'police',
          },
          ...previous,
        ]);
      }
    };

    loadIncidents();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedZone =
    zones.find(zone => zone.id === selectedZoneId) ?? zones[0]!;

  const activeRecommendation =
    recommendations.find(
      recommendation =>
        recommendation.status === 'PENDING_APPROVAL' ||
        recommendation.status === 'APPROVED'
    ) ?? recommendations[0]!;

  const approveRecommendation = useCallback((id: string) => {
    setRecommendations(previous =>
      previous.map(recommendation => {
        if (recommendation.id !== id) return recommendation;

        return {
          ...recommendation,
          status: 'APPROVED',
          approvedBy: 'Superintendent of Police & District Collector',
          approvedAt: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      })
    );

    setRoutes(previous =>
      previous.map(route => {
        if (route.id === 'route-main') {
          return {
            ...route,
            status: 'BLOCKED',
            activeDiverted: true,
          };
        }

        if (route.id === 'route-bypass-2') {
          return {
            ...route,
            status: 'RECOMMENDED_SAFE',
            activeDiverted: true,
          };
        }

        return route;
      })
    );

    setZones(previous =>
      previous.map(zone => {
        if (zone.id !== 'sector-c') return zone;

        return {
          ...zone,
          status: 'DIVERTED',
          activeUnits: {
            police: 30,
            volunteers: 63,
            ambulances: 4,
          },
        };
      })
    );

    setVolunteerTasks(previous => [
      {
        id: generateUniqueId('task'),
        volunteerId: 'VOL-402',
        title: 'EXECUTE: Divert Crowd to Bypass 2 at Shivaji Chowk',
        instruction:
          'Setup directional signage, open Bypass 2 gate barricade, and guide oncoming Warkari Dindis.',
        zoneId: 'sector-c',
        zoneName: 'Sector C (Palkhi Marg)',
        priority: 'CRITICAL',
        status: 'ASSIGNED',
        createdAt: 'Just now',
      },
      ...previous,
    ]);

    setNotifications(previous => [
      {
        id: generateUniqueId('notif'),
        title: 'Action Approved: Flow Diversion Active',
        message:
          'Police Command approved Bypass 2 diversion. Automated task dispatch sent to 18 volunteers.',
        type: 'SUCCESS',
        timestamp: 'Just now',
        roleTarget: 'ALL',
      },
      ...previous,
    ]);
  }, []);

  const rejectRecommendation = useCallback((id: string) => {
    setRecommendations(previous =>
      previous.map(recommendation =>
        recommendation.id === id
          ? { ...recommendation, status: 'REJECTED' }
          : recommendation
      )
    );

    setNotifications(previous => [
      {
        id: generateUniqueId('notif'),
        title: 'Action Rejected by Human Authority',
        message:
          'Command center declined the automated recommendation. Standard monitoring continues.',
        type: 'WARNING',
        timestamp: 'Just now',
        roleTarget: 'police',
      },
      ...previous,
    ]);
  }, []);

  const acknowledgeIncident = useCallback(async (id: string) => {
    try {
      const updated = await apiService.updateIncident(id, {
        status: 'ACKNOWLEDGED',
      });

      setIncidents(previous =>
        previous.map(incident =>
          incident.id === id ? updated : incident
        )
      );
    } catch (error) {
      console.error('Unable to acknowledge incident:', error);
    }
  }, []);

  const assignIncidentUnits = useCallback(
    async (id: string, units: string[]) => {
      try {
        const updated = await apiService.updateIncident(id, {
          status: 'IN_PROGRESS',
          assignedUnits: units,
        });

        setIncidents(previous =>
          previous.map(incident =>
            incident.id === id ? updated : incident
          )
        );

        setNotifications(previous => [
          {
            id: generateUniqueId('notif'),
            title: 'Units Dispatched',
            message: `Assigned ${units.join(', ')} to incident #${id}.`,
            type: 'INFO',
            timestamp: 'Just now',
            roleTarget: 'ALL',
          },
          ...previous,
        ]);
      } catch (error) {
        console.error('Unable to assign incident:', error);
      }
    },
    []
  );

  const resolveIncident = useCallback(async (id: string) => {
    try {
      const updated = await apiService.updateIncident(id, {
        status: 'RESOLVED',
      });

      setIncidents(previous =>
        previous.map(incident =>
          incident.id === id ? updated : incident
        )
      );
    } catch (error) {
      console.error('Unable to resolve incident:', error);
    }
  }, []);

  const reportIncident = useCallback(
    async (data: {
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
      const zone = zones.find(item => item.id === data.zoneId);

      try {
        const created = await apiService.createIncident({
          type: data.type,
          title: data.title,
          description: data.description,
          zoneId: data.zoneId,
          zoneName: zone
            ? `${zone.code} — ${zone.name}`
            : data.zoneId,
          priority: data.priority,
          reportedBy:
            currentRole === 'volunteer'
              ? 'Field Volunteer VOL-402'
              : 'Citizen Pilgrim App',
          reportedRole:
            currentRole === 'volunteer' ? 'VOLUNTEER' : 'PILGRIM',
          locationDetails: data.locationDetails,
          coordinates: data.coordinates ?? { x: 420, y: 490 },
          evidenceUrl: data.photoUrl,
          audioNote: data.audioRecorded
            ? 'Voice report recorded'
            : undefined,
        });

        setIncidents(previous => [created, ...previous]);

        setNotifications(previous => [
          {
            id: generateUniqueId('notif'),
            title: `New Incident: ${data.title}`,
            message: `${data.priority} priority report saved in ${
              zone?.code ?? data.zoneId
            }.`,
            type:
              data.priority === 'CRITICAL' || data.priority === 'HIGH'
                ? 'ALERT'
                : 'WARNING',
            timestamp: 'Just now',
            roleTarget: 'police',
          },
          ...previous,
        ]);
      } catch (error) {
        console.error('Unable to submit incident:', error);

        setNotifications(previous => [
          {
            id: generateUniqueId('notif'),
            title: 'Incident submission failed',
            message:
              error instanceof Error
                ? error.message
                : 'Unable to save incident',
            type: 'WARNING',
            timestamp: 'Just now',
            roleTarget: currentRole,
          },
          ...previous,
        ]);
      }
    },
    [zones, currentRole]
  );

  const updateVolunteerTaskStatus = useCallback(
    (
      taskId: string,
      status: VolunteerTask['status'],
      evidenceNotes?: string,
      evidencePhoto?: string
    ) => {
      setVolunteerTasks(previous =>
        previous.map(task =>
          task.id === taskId
            ? {
                ...task,
                status,
                evidenceNotes: evidenceNotes ?? task.evidenceNotes,
                evidencePhoto: evidencePhoto ?? task.evidencePhoto,
              }
            : task
        )
      );

      if (status === 'COMPLETED') {
        setNotifications(previous => [
          {
            id: generateUniqueId('notif'),
            title: 'Task Completed by Volunteer',
            message: `Task #${taskId} verified with evidence and closed on ground.`,
            type: 'SUCCESS',
            timestamp: 'Just now',
            roleTarget: 'ALL',
          },
          ...previous,
        ]);
      }
    },
    []
  );

  const triggerPilgrimSos = useCallback(
    (sosType: string, details?: string) => {
      const newIncident: Incident = {
        id: generateUniqueId('sos'),
        type:
          sosType === 'Medical'
            ? 'MEDICAL_EMERGENCY'
            : sosType === 'Lost Person'
              ? 'LOST_PERSON'
              : 'STAMPEDE_RISK',
        title: `SOS: ${sosType} Assistance Requested`,
        description:
          details ??
          'Urgent pilgrim distress signal sent from mobile app with real-time GPS beacon.',
        zoneId: 'sector-c',
        zoneName: 'Sector C (Palkhi Marg)',
        priority: 'CRITICAL',
        status: 'NEW',
        reportedBy: 'Pilgrim Mobile App',
        reportedRole: 'PILGRIM',
        timestamp: 'Just now',
        locationDetails: 'Palkhi Marg near Shivaji Chowk',
        coordinates: { x: 430, y: 510 },
      };

      setIncidents(previous => [newIncident, ...previous]);

      setNotifications(previous => [
        {
          id: generateUniqueId('notif'),
          title: `EMERGENCY SOS: ${sosType}`,
          message:
            'Pilgrim distress signal transmitted to nearest QRT and ambulance unit.',
          type: 'ALERT',
          timestamp: 'Just now',
          roleTarget: 'ALL',
        },
        ...previous,
      ]);
    },
    []
  );

  const dismissNotification = useCallback((id: string) => {
    setNotifications(previous =>
      previous.filter(notification => notification.id !== id)
    );
  }, []);

  const divertRouteManually = useCallback(
    (routeId: string, activate: boolean) => {
      setRoutes(previous =>
        previous.map(route =>
          route.id === routeId
            ? {
                ...route,
                activeDiverted: activate,
                status: activate ? 'BLOCKED' : 'CONGESTED',
              }
            : route
        )
      );
    },
    []
  );

  const updateZoneRisk = useCallback(
    (
      zoneId: string,
      riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
      riskScore?: number
    ) => {
      setZones(previous =>
        previous.map(zone => {
          if (zone.id !== zoneId) return zone;

          const calculatedScore =
            riskScore ??
            (riskLevel === 'CRITICAL'
              ? 88
              : riskLevel === 'HIGH'
                ? 74
                : riskLevel === 'MEDIUM'
                  ? 48
                  : 22);

          return {
            ...zone,
            riskLevel,
            riskScore: calculatedScore,
          };
        })
      );
    },
    []
  );

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
    throw new Error(
      'useOperations must be used within an OperationsProvider'
    );
  }

  return context;
};