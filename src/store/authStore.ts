import { create } from 'zustand';
import { AuthService, Admin, LoginCredentials } from '../services/auth';

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  checkSession: () => void;
  clearError: () => void;
}

const authService = AuthService.getInstance();

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: authService.isAuthenticated(),
  admin: authService.getAdmin(),
  isLoading: false,
  error: null,

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      set({
        isAuthenticated: true,
        admin: response.admin,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isAuthenticated: false,
        admin: null,
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({
        isAuthenticated: false,
        admin: null,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isAuthenticated: false,
        admin: null,
        isLoading: false,
        error: error.message,
      });
    }
  },

  verifyAuth: async () => {
    if (!authService.getToken()) {
      set({ isAuthenticated: false, admin: null });
      return;
    }

    set({ isLoading: true });
    try {
      const isValid = await authService.verifyToken();
      if (isValid) {
        set({
          isAuthenticated: true,
          admin: authService.getAdmin(),
          isLoading: false,
        });
      } else {
        set({
          isAuthenticated: false,
          admin: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        admin: null,
        isLoading: false,
      });
    }
  },

  checkSession: () => {
    if (authService.isSessionExpired()) {
      get().logout();
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));