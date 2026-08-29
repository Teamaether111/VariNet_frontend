import { Zone, Incident, AIRecommendation, Facility, VolunteerTask } from '../types';
import { INITIAL_ZONES, INITIAL_INCIDENTS, INITIAL_RECOMMENDATIONS } from '../data/initialData';
import { generateUniqueId } from '../utils/idGenerator';

/**
 * Service Layer adhering to the API contract.
 * Ready for drop-in FastAPI backend integration without changing frontend UI.
 */
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
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

class ApiService {
  private zones: Zone[] = [...INITIAL_ZONES];
  private incidents: Incident[] = [...INITIAL_INCIDENTS];
  private recommendations: AIRecommendation[] = [...INITIAL_RECOMMENDATIONS];
  private tasks: VolunteerTask[] = [
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
  ];

  // GET /api/zones/risk
  async getZonesRisk(): Promise<Zone[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.zones));
  }

  // GET /api/incidents
  async getIncidents(): Promise<Incident[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.incidents));
  }

  // GET /api/facilities
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
    query.set(
      'facility_type',
      filters.facilityType
    );
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

  // GET /api/recommendations/next
  async getNextRecommendation(): Promise<AIRecommendation | null> {
    await this.delay(80);
    const active = this.recommendations.find(r => r.status === 'PENDING_APPROVAL' || r.status === 'APPROVED');
    return active ? JSON.parse(JSON.stringify(active)) : null;
  }

  // POST /api/incidents
  async createIncident(incidentData: Omit<Incident, 'id' | 'timestamp' | 'status'>): Promise<Incident> {
    await this.delay(150);
    const newIncident: Incident = {
      ...incidentData,
      id: generateUniqueId('inc'),
      timestamp: 'Just now',
      status: 'NEW',
    };
    this.incidents.unshift(newIncident);
    return newIncident;
  }

  // POST /api/recommendations/{id}/approve
  async approveRecommendation(id: string, approverName: string = 'SP / District Collector'): Promise<AIRecommendation> {
    await this.delay(200);
    const rec = this.recommendations.find(r => r.id === id);
    if (!rec) throw new Error(`Recommendation ${id} not found`);
    rec.status = 'APPROVED';
    rec.approvedBy = approverName;
    rec.approvedAt = new Date().toLocaleTimeString();
    return JSON.parse(JSON.stringify(rec));
  }

  // POST /api/tasks/{id}/complete
  async completeTask(taskId: string, evidenceNotes?: string, evidencePhoto?: string): Promise<VolunteerTask> {
    await this.delay(150);
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);
    task.status = 'COMPLETED';
    task.evidenceNotes = evidenceNotes;
    task.evidencePhoto = evidencePhoto;
    return JSON.parse(JSON.stringify(task));
  }

  // Helper delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const apiService = new ApiService();
