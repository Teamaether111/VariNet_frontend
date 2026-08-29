import { LoginCredentials, User, UserRole } from './types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000';

const AUTH_USER_KEY = 'varinet_session_user';
const AUTH_TOKEN_KEY = 'varinet_access_token';

interface LoginResponse {
  token: string;
  user: User;
}

export const ROLE_CONFIG: Record<
  UserRole,
  {
    name: string;
    path: string;
    defaultPrefix: string;
    badgeColor: string;
    description: string;
  }
> = {
  pilgrim: {
    name: 'Pilgrim',
    path: '/pilgrim',
    defaultPrefix: 'WARKARI',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Live safe route navigation, water points & emergency SOS',
  },
  volunteer: {
    name: 'Volunteer Field Ops',
    path: '/volunteer',
    defaultPrefix: 'VOL',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    description: 'Ground dispatch tasks, crowd guidance & incident reporting',
  },
  police: {
    name: 'Police Command',
    path: '/police',
    defaultPrefix: 'POL',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
    description: 'Incident triage, AI intervention approval & GIS command',
  },
  'temple-authority': {
    name: 'Temple Authority',
    path: '/temple-authority',
    defaultPrefix: 'TMP',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
    description: 'Sanctum throughput, queue holding & VIP protocol',
  },
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    const cleanName = credentials.name?.trim();
    const cleanId = credentials.userId?.trim();
    const cleanPin = credentials.pin?.trim();
    const role = credentials.role;

    if (!cleanName) {
      throw new Error('Please enter your Full Name.');
    }

    if (!cleanId) {
      throw new Error('Please enter your User ID.');
    }

    if (!cleanPin) {
      throw new Error('Please enter your password.');
    }

    if (!role || !ROLE_CONFIG[role]) {
      throw new Error('Please select a valid role.');
    }

    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: cleanId,
          name: cleanName,
          pin: cleanPin,
          role,
        }),
      });
    } catch {
      throw new Error(
        'Cannot connect to the backend. Please ensure FastAPI is running on port 8000.'
      );
    }

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.detail || 'Authentication failed.');
    }

    const loginResponse = body as LoginResponse;

    if (!loginResponse.token || !loginResponse.user) {
      throw new Error('Invalid login response received from the backend.');
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(loginResponse.user));
    localStorage.setItem(AUTH_TOKEN_KEY, loginResponse.token);

    return loginResponse.user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);

      if (!stored) {
        return null;
      }

      const user = JSON.parse(stored) as User;

      if (!user.id || !user.name || !user.role || !ROLE_CONFIG[user.role]) {
        return null;
      }

      return user;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getAuthorizationHeaders(): Record<string, string> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async validateSession(): Promise<User | null> {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        await authService.logout();
        return null;
      }

      const user = (await response.json()) as User;

      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(
      localStorage.getItem(AUTH_TOKEN_KEY) && authService.getCurrentUser()
    );
  },

  getRolePath(role: UserRole): string {
    return ROLE_CONFIG[role]?.path || '/login';
  },
};