import {
  Zone,
  Incident,
  AIRecommendation,
  Facility,
  VolunteerTask,
} from '../types';

import {
  INITIAL_ZONES,
  INITIAL_FACILITIES,
  INITIAL_RECOMMENDATIONS,
} from '../data/initialData';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

/**
 * Service layer for all frontend API calls.
 * Incidents are connected to FastAPI.
 * Zones, facilities, recommendations, and tasks currently use local MVP data.
 */
class ApiService {
  private zones: Zone[] = [...INITIAL_ZONES];
  private facilities: Facility[] = [...INITIAL_FACILITIES];
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

  // GET /api/zones/risk
  async getZonesRisk(): Promise<Zone[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.zones));
  }

  // GET /api/incidents
  async getIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/api/incidents`);
    return parseApiResponse<Incident[]>(response);
  }

  // GET /api/facilities
  async getFacilities(): Promise<Facility[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.facilities));
  }

  // POST /api/incidents
  async createIncident(
    incidentData: Omit<Incident, 'id' | 'timestamp' | 'status'>
  ): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incidentData),
    });

    return parseApiResponse<Incident>(response);
  }

  // PATCH /api/incidents/{incidentId}
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
        },
        body: JSON.stringify(update),
      }
    );

    return parseApiResponse<Incident>(response);
  }

  // GET /api/recommendations/next
  async getNextRecommendation(): Promise<AIRecommendation | null> {
    await this.delay(80);

    const active = this.recommendations.find(
      recommendation =>
        recommendation.status === 'PENDING_APPROVAL' ||
        recommendation.status === 'APPROVED'
    );

    return active ? JSON.parse(JSON.stringify(active)) : null;
  }

  // POST /api/recommendations/{id}/approve
  async approveRecommendation(
    id: string,
    approverName = 'SP / District Collector'
  ): Promise<AIRecommendation> {
    await this.delay(200);

    const recommendation = this.recommendations.find(
      item => item.id === id
    );

    if (!recommendation) {
      throw new Error(`Recommendation ${id} not found`);
    }

    recommendation.status = 'APPROVED';
    recommendation.approvedBy = approverName;
    recommendation.approvedAt = new Date().toLocaleTimeString();

    return JSON.parse(JSON.stringify(recommendation));
  }

  // POST /api/tasks/{id}/complete
  async completeTask(
    taskId: string,
    evidenceNotes?: string,
    evidencePhoto?: string
  ): Promise<VolunteerTask> {
    await this.delay(150);

    const task = this.tasks.find(item => item.id === taskId);

    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    task.status = 'COMPLETED';
    task.evidenceNotes = evidenceNotes;
    task.evidencePhoto = evidencePhoto;

    return JSON.parse(JSON.stringify(task));
  }

  // PATCH /api/incidents/{incidentId}
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
      },
      body: JSON.stringify(update),
    }
  );

  return parseApiResponse<Incident>(response);
}

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new ApiService();