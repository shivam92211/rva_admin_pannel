import { create } from 'zustand';
import { AuthService, Admin, LoginCredentials } from '../services/auth';

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  requires2FA: boolean;
  pendingAdminId: string | null;
  login: (credentials: LoginCredentials, recaptchaToken?: string) => Promise<void>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  verifyAuth: () => Promise<void>;
  checkSession: () => void;
  clearError: () => void;
  clear2FAState: () => void;
}

const authService = AuthService.getInstance();

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: authService.isAuthenticated(),
  admin: authService.getAdmin(),
  isLoading: false,
  error: null,
  requires2FA: false,
  pendingAdminId: null,

  login: async (credentials: LoginCredentials, recaptchaToken?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials, recaptchaToken);

      // Check if 2FA is required
      if ('requires2FA' in response && response.requires2FA) {
        set({
          isLoading: false,
          requires2FA: true,
          pendingAdminId: response.adminId,
          error: null,
        });
        return;
      }

      // Normal login (no 2FA required)
      set({
        isAuthenticated: true,
        admin: response.admin,
        isLoading: false,
        error: null,
        requires2FA: false,
        pendingAdminId: null,
      });
    } catch (error: any) {
      set({
        isAuthenticated: false,
        admin: null,
        isLoading: false,
        error: error.message,
        requires2FA: false,
        pendingAdminId: null,
      });
      throw error;
    }
  },

  verify2FA: async (code: string) => {
    const { pendingAdminId } = get();
    if (!pendingAdminId) {
      set({ error: 'No pending 2FA verification' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authService.verify2FALogin(pendingAdminId, code);
      set({
        isAuthenticated: true,
        admin: response.admin,
        isLoading: false,
        error: null,
        requires2FA: false,
        pendingAdminId: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  clear2FAState: () => {
    set({
      requires2FA: false,
      pendingAdminId: null,
      error: null,
    });
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