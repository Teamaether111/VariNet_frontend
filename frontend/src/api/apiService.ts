import {
  Zone,
  Incident,
  AIRecommendation,
  Facility,
  VolunteerTask,
} from '../types';
import {
  INITIAL_ZONES,
  INITIAL_INCIDENTS,
  INITIAL_RECOMMENDATIONS,
} from '../data/initialData';
import { generateUniqueId } from '../utils/idGenerator';
import { authService } from '../features/auth/authService';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

async function parseApiResponse<T>(
  response: Response
): Promise<T> {
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;

    try {
      const errorBody = await response.json();

      if (errorBody?.detail) {
        message = errorBody.detail;
      }
    } catch {
      // Keep default message if backend does not return JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

class ApiService {
  private zones: Zone[] = [...INITIAL_ZONES];

  private incidents: Incident[] = [
    ...INITIAL_INCIDENTS,
  ];

  private recommendations: AIRecommendation[] = [
    ...INITIAL_RECOMMENDATIONS,
  ];

  private tasks: VolunteerTask[] = [
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
  ];

  // GET /api/zones/risk — public for now
  async getZonesRisk(): Promise<Zone[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.zones));
  }

  // GET /api/incidents — public for now
  async getIncidents(): Promise<Incident[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.incidents));
  }

  // GET /api/facilities — public
  async getFacilities(filters?: {
    zoneId?: string;
    facilityType?: Facility['type'];
    status?: Facility['status'];
  }): Promise<Facility[]> {
    const query = new URLSearchParams();

    if (filters?.zoneId) {
      query.set('zone_id', filters.zoneId);
    }

    if (filters?.facilityType) {
      query.set('facility_type', filters.facilityType);
    }

    if (filters?.status) {
      query.set('status', filters.status);
    }

    const queryString = query.toString();

    const url = queryString
      ? `${API_BASE_URL}/api/facilities?${queryString}`
      : `${API_BASE_URL}/api/facilities`;

    const response = await fetch(url);

    return parseApiResponse<Facility[]>(response);
  }

  // GET /api/recommendations/next — public for now
  async getNextRecommendation(): Promise<AIRecommendation | null> {
    await this.delay(80);

    const active = this.recommendations.find(
      (recommendation) =>
        recommendation.status === 'PENDING_APPROVAL' ||
        recommendation.status === 'APPROVED'
    );

    return active
      ? JSON.parse(JSON.stringify(active))
      : null;
  }

  // POST /api/incidents — protected
  async createIncident(
    incidentData: Omit<
      Incident,
      'id' | 'timestamp' | 'status'
    >
  ): Promise<Incident> {
    const response = await fetch(
      `${API_BASE_URL}/api/incidents`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthorizationHeaders(),
        },
        body: JSON.stringify(incidentData),
      }
    );

    return parseApiResponse<Incident>(response);
  }

  // PATCH /api/incidents/{id} — protected
  async updateIncident(
    incidentId: string,
    update: {
      status: Incident['status'];
      assignedUnits?: string[];
    }
  ): Promise<Incident> {
    const response = await fetch(
      `${API_BASE_URL}/api/incidents/${incidentId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthorizationHeaders(),
        },
        body: JSON.stringify(update),
      }
    );

    return parseApiResponse<Incident>(response);
  }

  // POST /api/recommendations/{id}/approve — protected
  async approveRecommendation(
    id: string,
    approverName = 'SP / District Collector'
  ): Promise<AIRecommendation> {
    const response = await fetch(
      `${API_BASE_URL}/api/recommendations/${id}/approve`,
      {
        method: 'POST',
        headers: {
          ...authService.getAuthorizationHeaders(),
        },
        body: JSON.stringify({
          approverName,
        }),
      }
    );

    return parseApiResponse<AIRecommendation>(response);
  }

  // POST /api/tasks/{id}/complete — protected
  async completeTask(
    taskId: string,
    evidenceNotes?: string,
    evidencePhoto?: string
  ): Promise<VolunteerTask> {
    const response = await fetch(
      `${API_BASE_URL}/api/tasks/${taskId}/complete`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthorizationHeaders(),
        },
        body: JSON.stringify({
          evidenceNotes,
          evidencePhoto,
        }),
      }
    );

    return parseApiResponse<VolunteerTask>(response);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const apiService = new ApiService();