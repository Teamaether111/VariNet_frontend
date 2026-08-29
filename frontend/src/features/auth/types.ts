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

export interface LoginCredentials {
  name: string;
  userId: string;
  pin: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  clearError: () => void;
}
