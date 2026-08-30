import { authService } from '../features/auth/authService';

import type {
  AIRecommendation,
  Facility,
  Incident,
  TempleQueuePredictionInput,
  TempleQueuePredictionResult,
  VolunteerTask,
  Zone,
} from '../types';

import {
  INITIAL_FACILITIES,
  INITIAL_RECOMMENDATIONS,
  INITIAL_ZONES,
} from '../data/initialData';


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000';

export type QueueAlertStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'RESOLVED';

export interface QueueAlert {
  alert_id: number;
  prediction_id: number;
  zone_id: string;
  alert_level: 'MODERATE' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  explanation: string;
  recommended_action: string;
  status: QueueAlertStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  predicted_wait_minutes?: number;
  prediction_date?: string;
  hour?: number;
  location?: string;
  waiting_people?: number;
  gates_open?: number;
  crowd_density?: number;
}

export interface QueueAlertListResponse {
  count: number;
  items: QueueAlert[];
}


async function parseApiResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.detail ??
        data?.message ??
        `Request failed with status ${response.status}`,
    );
  }
  return data as T;
}


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
        'Setup hydration outpost opposite Dnyaneshwar Hall. Assist dehydrated senior pilgrims.',
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
        'Coordinate with Temple Police to clear the East Gate steps.',
      zoneId: 'sector-b',
      zoneName: 'Sector B (Temple Quad)',
      priority: 'MEDIUM',
      status: 'IN_ACTION',
      createdAt: '12 mins ago',
    },
  ];

  async getZonesRisk(): Promise<Zone[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.zones)) as Zone[];
  }

  async getIncidents(): Promise<Incident[]> {
    const response = await fetch(`${API_BASE_URL}/api/incidents`);
    return parseApiResponse<Incident[]>(response);
  }

  async getFacilities(): Promise<Facility[]> {
    await this.delay(80);
    return JSON.parse(JSON.stringify(this.facilities)) as Facility[];
  }

  async createIncident(
    incidentData: Omit<Incident, 'id' | 'timestamp' | 'status'>,
  ): Promise<Incident> {
    const response = await fetch(`${API_BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthorizationHeaders(),
      },
      body: JSON.stringify(incidentData),
    });
    return parseApiResponse<Incident>(response);
  }

  async updateIncident(
    incidentId: string,
    update: {
      status: Incident['status'];
      assignedUnits?: string[];
    },
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
      },
    );
    return parseApiResponse<Incident>(response);
  }

  async getNextRecommendation(): Promise<AIRecommendation | null> {
    await this.delay(80);
    const active = this.recommendations.find(
      recommendation =>
        recommendation.status === 'PENDING_APPROVAL' ||
        recommendation.status === 'APPROVED',
    );
    return active
      ? (JSON.parse(JSON.stringify(active)) as AIRecommendation)
      : null;
  }

  async approveRecommendation(
    id: string,
    approverName = 'SP / District Collector',
  ): Promise<AIRecommendation> {
    await this.delay(200);
    const recommendation = this.recommendations.find(item => item.id === id);
    if (!recommendation) {
      throw new Error(`Recommendation ${id} not found`);
    }
    recommendation.status = 'APPROVED';
    recommendation.approvedBy = approverName;
    recommendation.approvedAt = new Date().toLocaleTimeString();
    return JSON.parse(JSON.stringify(recommendation)) as AIRecommendation;
  }

  async predictTempleQueue(
    input: TempleQueuePredictionInput,
  ): Promise<TempleQueuePredictionResult> {
    const response = await fetch(
      `${API_BASE_URL}/api/temple-queue/predict`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthorizationHeaders(),
        },
        body: JSON.stringify(input),
      },
    );
    return parseApiResponse<TempleQueuePredictionResult>(response);
  }

  async getTempleQueueAlerts(
    status?: QueueAlertStatus | 'ALL',
    zoneId?: string,
    limit = 50,
  ): Promise<QueueAlertListResponse> {
    const query = new URLSearchParams({ limit: String(limit) });
    if (status && status !== 'ALL') {
      query.set('status', status);
    }
    if (zoneId?.trim()) {
      query.set('zone_id', zoneId.trim());
    }

    const response = await fetch(
      `${API_BASE_URL}/api/temple-queue/alerts?${query.toString()}`,
      {
        headers: authService.getAuthorizationHeaders(),
      },
    );
    return parseApiResponse<QueueAlertListResponse>(response);
  }

  async reviewTempleQueueAlert(
    alertId: number,
    status: Exclude<QueueAlertStatus, 'PENDING'>,
  ): Promise<QueueAlert> {
    const response = await fetch(
      `${API_BASE_URL}/api/temple-queue/alerts/${alertId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthorizationHeaders(),
        },
        body: JSON.stringify({ status }),
      },
    );
    return parseApiResponse<QueueAlert>(response);
  }

  async completeTask(
    taskId: string,
    evidenceNotes?: string,
    evidencePhoto?: string,
  ): Promise<VolunteerTask> {
    await this.delay(150);
    const task = this.tasks.find(item => item.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    task.status = 'COMPLETED';
    task.evidenceNotes = evidenceNotes;
    task.evidencePhoto = evidencePhoto;
    return JSON.parse(JSON.stringify(task)) as VolunteerTask;
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise(resolve => window.setTimeout(resolve, milliseconds));
  }
}


export const apiService = new ApiService();
