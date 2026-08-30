export type UserRole =
  | "pilgrim"
  | "volunteer"
  | "police"
  | "temple-authority";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface TempleQueuePredictionInput {
  hour: number;
  zoneId: string;
  location: string;
  routeType: string;
  waitingPeople: number;
  darshanStatus: string;
  gatesOpen: number;
  crowdCount: number;
  crowdDensity: number;
  isPeakDay: boolean | string;

  // Optional additional fields used by the queue prediction form/API.
  date?: string;
  templeId?: string;
  gateId?: string;
  incomingRate?: number;
  exitingRate?: number;
  temperatureC?: number;
  rainfallMm?: number;

  // Allows additional MVP fields without TypeScript errors.
  [key: string]: unknown;
}

export interface TempleQueuePredictionResult {
  prediction_id: number;
  predicted_wait_minutes: number;

  predicted_wait_label:
    | "LOW"
    | "MODERATE"
    | "HIGH"
    | "CRITICAL";

  day_of_week: number;
  created_at: string;

  alert_created: boolean;
  alert_id: number | null;
  explanation: string | null;
  recommended_action: string | null;
}

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type IncidentType =
  | "HEAT_EXHAUSTION"
  | "CROWD_BOTTLENECK"
  | "LOST_PERSON"
  | "STAMPEDE_RISK"
  | "WATER_SHORTAGE"
  | "TRAFFIC_BLOCK"
  | "MEDICAL_EMERGENCY";

export type IncidentStatus =
  | "NEW"
  | "ACKNOWLEDGED"
  | "IN_PROGRESS"
  | "RESOLVED";

export type IncidentPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface ZoneWeather {
  temp: number;
  feelsLike: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  condition:
    | "Sunny"
    | "Humid & Overcast"
    | "Hot & Dry"
    | "Scattered Showers";
  heatRisk: "Low" | "Moderate" | "High" | "Extreme";
  airQualityIndex?: number;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  description: string;
  riskScore: number;
  riskLevel: RiskLevel;
  predictedIssue: string;
  confidence: number;
  crowdCount: number;
  crowdDensity: number;
  maxSafeCapacity: number;
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  weather: ZoneWeather;
  status:
    | "NORMAL"
    | "MONITORING"
    | "INTERVENTION_REQUIRED"
    | "DIVERTED";
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
  reportedBy: string;
  reportedRole: "AI_DETECTION" | "VOLUNTEER" | "PILGRIM" | "POLICE";
  timestamp: string;
  locationDetails: string;
  coordinates: {
    x: number;
    y: number;
  };
  assignedTo?: string;
  assignedUnits?: string[];
  evidenceUrl?: string;
  audioNote?: string;
  resolvedAt?: string;
}

export type RecommendationStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "EXECUTING"
  | "COMPLETED";

export interface AIRecommendation {
  id: string;
  title: string;
  recommendedAction: string;
  targetZone: string;
  targetZoneId: string;
  reason: string;
  expectedImpact: string;
  confidence: number;
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
  type:
    | "WATER"
    | "MEDICAL"
    | "TOILET"
    | "POLICE_BOOTH"
    | "SHELTER"
    | "PARKING"
    | "PRASAD_CAMP"
    | "TEMPLE";
  zoneId: string;
  coordinates: {
    x: number;
    y: number;
  };
  status: "OPEN" | "BUSY" | "FULL" | "MAINTENANCE";
  capacityPct: number;
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
  priority: "MEDIUM" | "HIGH" | "CRITICAL";
  status:
    | "ASSIGNED"
    | "NAVIGATING"
    | "IN_ACTION"
    | "EVIDENCE_UPLOADED"
    | "COMPLETED";
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
  status:
    | "CLEAR"
    | "MODERATE"
    | "CONGESTED"
    | "BLOCKED"
    | "RECOMMENDED_SAFE";
  distanceKm: number;
  estimatedTimeMin: number;
  crowdLevel: RiskLevel;
  pathPoints: Array<{
    x: number;
    y: number;
  }>;
  isAlternate: boolean;
  activeDiverted?: boolean;
}

export interface TempleQueueStatus {
  darshanWaitTimeMinutes: number;
  sanctumThroughputPerHour: number;
  totalInQueue: number;
  holdingEnclosures: Array<{
    name: string;
    currentOccupancy: number;
    maxCapacity: number;
    status: "NORMAL" | "FILLING" | "CRITICAL";
  }>;
  vipGateStatus: "FLOWING" | "RESTRICTED" | "PAUSED";
  annachhatraMealsServedToday: number;
}

export interface MapLayerState {
  // Static layers
  routes: boolean;
  alternateRoutes: boolean;
  roads: boolean;
  medicalCamps: boolean;
  policeBooths: boolean;
  toilets: boolean;
  waterPoints: boolean;
  shelters: boolean;
  parking: boolean;

  // Dynamic layers
  crowdHeatmap: boolean;
  incidents: boolean;
  volunteers: boolean;
  policeUnits: boolean;
  ambulances: boolean;
  traffic: boolean;
  weatherOverlay: boolean;

  // AI layers
  riskZones: boolean;
  predictedCongestion: boolean;
  safeRoutes: boolean;
  recommendedInterventions: boolean;
}