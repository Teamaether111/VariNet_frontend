export type UserRole =
  | 'pilgrim'
  | 'volunteer'
  | 'police'
  | 'temple-authority';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type IncidentType = 
  | 'HEAT_EXHAUSTION' 
  | 'CROWD_BOTTLENECK' 
  | 'LOST_PERSON' 
  | 'STAMPEDE_RISK' 
  | 'WATER_SHORTAGE' 
  | 'TRAFFIC_BLOCK' 
  | 'MEDICAL_EMERGENCY';

export type IncidentStatus = 'NEW' | 'ACKNOWLEDGED' | 'IN_PROGRESS' | 'RESOLVED';

export type IncidentPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ZoneWeather {
  temp: number; // in °C
  feelsLike: number;
  humidity: number; // in %
  rainProbability: number; // in %
  windSpeed: number; // in km/h
  condition: 'Sunny' | 'Humid & Overcast' | 'Hot & Dry' | 'Scattered Showers';
  heatRisk: 'Low' | 'Moderate' | 'High' | 'Extreme';
  airQualityIndex?: number;
}

export interface Zone {
  id: string; // e.g. 'sector-a', 'sector-b', 'sector-c'
  code: string; // 'Sector A', 'Sector B', 'Sector C', 'Sector D', 'Sector E'
  name: string; // e.g., 'Chandrabhaga Holy Ghats'
  description: string;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  predictedIssue: string;
  confidence: number; // 0-100
  crowdCount: number;
  crowdDensity: number; // people per sq meter (e.g. 1.2 to 5.8)
  maxSafeCapacity: number;
  coordinates: { x: number; y: number; width: number; height: number }; // Relative SVG canvas coords
  weather: ZoneWeather;
  status: 'NORMAL' | 'MONITORING' | 'INTERVENTION_REQUIRED' | 'DIVERTED';
  activeUnits: {
    police: number;
    volunteers: number;
    ambulances: number;
  };
}

export interface Incident {
  id: string;
  type: IncidentType;
  title: string;
  description: string;
  zoneId: string;
  zoneName: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  reportedBy: string; // e.g., 'Vol-104 (Ramesh K.)' or 'CCTV Analytics' or 'Pilgrim SOS'
  reportedRole: 'AI_DETECTION' | 'VOLUNTEER' | 'PILGRIM' | 'POLICE';
  timestamp: string;
  locationDetails: string;
  coordinates: { x: number; y: number };
  assignedTo?: string;
  assignedUnits?: string[];
  evidenceUrl?: string;
  audioNote?: string;
  resolvedAt?: string;
}

export type RecommendationStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXECUTING' | 'COMPLETED';

export interface AIRecommendation {
  id: string;
  title: string;
  recommendedAction: string;
  targetZone: string;
  targetZoneId: string;
  reason: string;
  expectedImpact: string;
  confidence: number; // 0-100
  status: RecommendationStatus;
  timestamp: string;
  suggestedResources: {
    divertRouteName?: string;
    volunteerReallocation?: number;
    policeReallocation?: number;
    ambulanceDeploy?: number;
    waterTankerDispatch?: number;
  };
  approvedBy?: string;
  approvedAt?: string;
  estimatedResolutionMinutes: number;
  preventedIncidentEstimate: string;
}

export interface Facility {
  id: string;
  name: string;
  type: 'WATER' | 'MEDICAL' | 'TOILET' | 'POLICE_BOOTH' | 'SHELTER' | 'PARKING' | 'PRASAD_CAMP' | 'TEMPLE';
  zoneId: string;
  coordinates: { x: number; y: number };
  status: 'OPEN' | 'BUSY' | 'FULL' | 'MAINTENANCE';
  capacityPct: number; // 0-100%
  description: string;
  distanceMeters?: number;
}

export interface VolunteerTask {
  id: string;
  volunteerId: string;
  title: string;
  instruction: string;
  zoneId: string;
  zoneName: string;
  priority: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ASSIGNED' | 'NAVIGATING' | 'IN_ACTION' | 'EVIDENCE_UPLOADED' | 'COMPLETED';
  incidentId?: string;
  createdAt: string;
  evidencePhoto?: string;
  evidenceNotes?: string;
  location?: string;
  description?: string;
  estimatedMinutes?: number;
}

export interface RouteOption {
  id: string;
  name: string;
  code: string;
  from: string;
  to: string;
  status: 'CLEAR' | 'MODERATE' | 'CONGESTED' | 'BLOCKED' | 'RECOMMENDED_SAFE';
  distanceKm: number;
  estimatedTimeMin: number;
  crowdLevel: RiskLevel;
  pathPoints: Array<{ x: number; y: number }>;
  isAlternate: boolean;
  activeDiverted?: boolean;
}

export interface TempleQueueStatus {
  darshanWaitTimeMinutes: number;
  sanctumThroughputPerHour: number; // e.g. 4,200 pilgrims / hr
  totalInQueue: number;
  holdingEnclosures: Array<{
    name: string;
    currentOccupancy: number;
    maxCapacity: number;
    status: 'NORMAL' | 'FILLING' | 'CRITICAL';
  }>;
  vipGateStatus: 'FLOWING' | 'RESTRICTED' | 'PAUSED';
  annachhatraMealsServedToday: number;
}

export interface MapLayerState {
  // Static
  routes: boolean;
  alternateRoutes: boolean;
  roads: boolean;
  medicalCamps: boolean;
  policeBooths: boolean;
  toilets: boolean;
  waterPoints: boolean;
  shelters: boolean;
  parking: boolean;
  // Dynamic
  crowdHeatmap: boolean;
  incidents: boolean;
  volunteers: boolean;
  policeUnits: boolean;
  ambulances: boolean;
  traffic: boolean;
  weatherOverlay: boolean;
  // AI Layers
  riskZones: boolean;
  predictedCongestion: boolean;
  safeRoutes: boolean;
  recommendedInterventions: boolean;
}
