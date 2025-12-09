import { create } from 'zustand';
import { AuthService, Admin, LoginCredentials } from '../services/auth';

interface AuthState {
  isAuthenticated: boolean;
  admin: Admin | null;
  isLoading: boolean;
  error: string | null;
  requires2FA: boolean;
  temp2FAToken: string | null;
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
  temp2FAToken: null,

  login: async (credentials: LoginCredentials, recaptchaToken?: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials, recaptchaToken);

      // Check if 2FA is required
      if ('requires2FA' in response && response.requires2FA) {
        console.log('authStore.login: 2FA required, storing temp token');
        const tempToken = response.refresh_token;
        console.log('authStore.login: temp token:', tempToken);

        // Store in both state and localStorage for persistence
        localStorage.setItem('temp_2fa_token', tempToken);
        console.log('authStore.login: Stored in localStorage:', localStorage.getItem('temp_2fa_token'));

        set({
          isLoading: false,
          requires2FA: true,
          temp2FAToken: tempToken,
          error: null,
        });
        return;
      }

      // Normal login (no 2FA required) - response is LoginResponse here
      const loginResponse = response as import('../services/auth').LoginResponse;
      set({
        isAuthenticated: true,
        admin: loginResponse.admin,
        isLoading: false,
        error: null,
        requires2FA: false,
        temp2FAToken: null,
      });
      window.location.reload();
    } catch (error: any) {
      set({
        isAuthenticated: false,
        admin: null,
        isLoading: false,
        error: error.message,
        requires2FA: false,
        temp2FAToken: null,
      });
      throw error;
    }
  },

  verify2FA: async (code: string) => {
    console.log('authStore.verify2FA called with code:', code);
    const { temp2FAToken } = get();
    console.log('authStore.verify2FA: temp2FAToken from state:', temp2FAToken);
    console.log('authStore.verify2FA: temp2FAToken from localStorage:', localStorage.getItem('temp_2fa_token'));

    // Get temp token from state or localStorage
    const tempToken = temp2FAToken || localStorage.getItem('temp_2fa_token');

    if (!tempToken) {
      const error = 'No 2FA token found. Please login again.';
      console.error('authStore.verify2FA:', error);
      set({
        isLoading: false,
        error: error,
      });
      throw new Error(error);
    }

    set({ isLoading: true, error: null });
    try {
      console.log('Calling authService.verify2FALogin with token...');
      const response = await authService.verify2FALogin(code, tempToken);
      console.log('2FA verification response received:', response);

      // Clear temp token from both state and localStorage
      localStorage.removeItem('temp_2fa_token');

      set({
        isAuthenticated: true,
        admin: response.admin,
        isLoading: false,
        error: null,
        requires2FA: false,
        temp2FAToken: null,
      });
      console.log('Reloading window...');
      window.location.reload();
    } catch (error: any) {
      console.error('authStore.verify2FA error:', error);
      set({
        isLoading: false,
        error: error.message,
      });
      throw error;
    }
  },

  clear2FAState: () => {
    // Clear temp token from localStorage when canceling
    localStorage.removeItem('temp_2fa_token');
    set({
      requires2FA: false,
      temp2FAToken: null,
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