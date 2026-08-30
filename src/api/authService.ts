import type { User, UserRole } from "../types";

/**
 * Credentials sent to the FastAPI login endpoint.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Expected response from the FastAPI login endpoint.
 *
 * The optional alternatives allow the frontend to work with common
 * FastAPI response formats such as "access_token" or "token".
 */
interface LoginResponse {
  access_token?: string;
  token?: string;
  token_type?: string;
  user?: User;

  // These fields support a backend that returns user data directly.
  user_id?: number | string;
  id?: number | string;
  full_name?: string;
  name?: string;
  email?: string;
  role?: UserRole;
  department_id?: number | string | null;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "access_token";
const USER_KEY = "user";

/**
 * Safely reads an error message returned by the backend.
 */
async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const data = (await response.json()) as {
      detail?: string;
      message?: string;
    };

    return data.detail ?? data.message ?? fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

/**
 * Creates a User object when the backend returns user fields directly
 * instead of returning them inside a "user" property.
 */
function extractUser(data: LoginResponse): User | null {
  if (data.user) {
    return data.user;
  }

  if (!data.email || !data.role) {
    return null;
  }

  return {
    id: data.id ?? data.user_id ?? "",
    name: data.full_name ?? data.name ?? data.email,
    email: data.email,
    role: data.role,
    departmentId: data.department_id ?? null,
  } as User;
}
export const authService = {
  /**
   * Logs in through the FastAPI backend and stores the token and user.
   */
  async login(credentials: LoginCredentials): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Login failed. Please check your email and password.",
      );

      throw new Error(message);
    }

    const data = (await response.json()) as LoginResponse;
    const accessToken = data.access_token ?? data.token;

    if (!accessToken) {
      throw new Error("The backend did not return an access token.");
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

    let user = extractUser(data);

    /*
     * If login returns only a token, request the currently logged-in user.
     */
    if (!user) {
      try {
        user = await this.fetchCurrentUser();
      } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        throw error;
      }
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Retrieves the authenticated user from the backend.
   *
   * Change "/api/auth/me" here only if your FastAPI endpoint uses
   * a different route.
   */
  async fetchCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers: this.getAuthorizationHeaders(),
    });

    if (!response.ok) {
      const message = await getErrorMessage(
        response,
        "Unable to retrieve the current user.",
      );

      throw new Error(message);
    }

    const user = (await response.json()) as User;

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return user;
  },

  /**
   * Logs out locally.
   *
   * This intentionally does not require a backend logout endpoint because
   * JWT access tokens are normally removed from the browser during logout.
   */
  async logout(): Promise<void> {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Returns the stored user or null when no valid user is stored.
   */
  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as User;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  /**
   * Returns the currently stored access token.
   */
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Checks whether an access token exists.
   */
  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },

  /**
   * Provides headers for authenticated API requests.
   *
   * This method fixes:
   * Property 'getAuthorizationHeaders' does not exist.
   */
  getAuthorizationHeaders(): Record<string, string> {
    const token = this.getAccessToken();

    if (!token) {
      return {
        "Content-Type": "application/json",
      };
    }

    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  },

  /**
   * Returns the correct dashboard route for each VARI-Net role.
   */
  getRolePath(role: UserRole): string {
    const normalizedRole = String(role)
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

    const rolePaths: Record<string, string> = {
      pilgrim: "/pilgrim",
      volunteer: "/volunteer",
      police: "/police",
      policeofficer: "/police",
      medical: "/medical",
      medicalofficer: "/medical",
      sanitation: "/sanitation",
      sanitationofficer: "/sanitation",
      templetrust: "/temple",
      traffic: "/traffic",
      trafficofficer: "/traffic",
      ngo: "/ngo",
      collector: "/collector",
      districtcollector: "/collector",
      admin: "/admin",
      administrator: "/admin",
    };

    return rolePaths[normalizedRole] ?? "/";
  },
};

export default authService;