import { LoginCredentials, User, UserRole } from './types';

const AUTH_STORAGE_KEY = 'varinet_session_user';

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

/**
 * Mock Auth Service
 * Ready for future FastAPI backend integration (e.g. POST /api/v1/auth/login)
 */
export const authService = {
  /**
   * Authenticate user with provided credentials
   */
  async login(credentials: LoginCredentials): Promise<User> {
    // Simulate brief network latency for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 250));

    const cleanName = credentials.name?.trim();
    const cleanId = credentials.userId?.trim();
    const cleanPin = credentials.pin?.trim();
    const role = credentials.role;

    if (!cleanName) {
      throw new Error('Please enter your Full Name.');
    }
    if (!cleanId) {
      throw new Error('Please enter your User ID or Badge Number.');
    }
    if (!cleanPin) {
      throw new Error('Please enter your Password or Security PIN.');
    }
    if (cleanPin.length < 3) {
      throw new Error('Password or PIN must be at least 3 characters.');
    }
    if (!role || !ROLE_CONFIG[role]) {
      throw new Error('Please select a valid role before continuing.');
    }

    const user: User = {
      id: cleanId.toUpperCase(),
      name: cleanName,
      role: role,
    };

    // Store in browser session/local storage for MVP persistence
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Ignore storage errors if disabled
    }

    return user;
  },

  /**
   * Log out the current user session
   */
  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore
    }
  },

  /**
   * Get currently active session user
   */
  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored) as User;
      if (parsed && parsed.id && parsed.name && parsed.role && ROLE_CONFIG[parsed.role]) {
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Check if active session exists
   */
  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  },

  /**
   * Helper to get route for a given role
   */
  getRolePath(role: UserRole): string {
    return ROLE_CONFIG[role]?.path || '/login';
  },
};
