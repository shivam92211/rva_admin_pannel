import axios from 'axios';
import { SetterOrUpdater } from 'recoil';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;

// Global snackbar setter function
let globalSnackbarSetter: SetterOrUpdater<{ msg: string, type?: "info" | "error" | "warn" | "success"; } | null> | null = null;

export const setGlobalSnackbarSetter = (setter: SetterOrUpdater<{ msg: string, type?: "info" | "error" | "warn" | "success"; } | null>) => {
  globalSnackbarSetter = setter;
};

export const showGlobalSnackbar = (msg: string, type: "info" | "error" | "warn" | "success" = "error") => {
  if (globalSnackbarSetter) {
    globalSnackbarSetter({ msg, type });
  }
};

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  profilePicture: string | null;
  phone: string | null;
  department: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  admin: Admin;
}

export interface TwoFactorRequiredResponse {
  requires2FA: true;
  refresh_token: string;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private admin: Admin | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    this.refreshToken = localStorage.getItem('refresh_token');
    const adminData = localStorage.getItem('admin_data');
    this.admin = adminData ? JSON.parse(adminData) : null;
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials, recaptchaToken?: string): Promise<LoginResponse | TwoFactorRequiredResponse> {
    try {
      const payload: any = { ...credentials };
      if (recaptchaToken) {
        payload.recaptchaToken = recaptchaToken;
      }

      console.log('Login: Making login request...');
      const response = await axios.post<LoginResponse | TwoFactorRequiredResponse>(
        `${API_BASE_URL}/api/v1/auth/portal-auth-gate-7a3b9f`,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('Login: Response received:', response.data);
      console.log('Login: Has requires2FA?', 'requires2FA' in response.data);
      console.log('Login: requires2FA value:', (response.data as any).requires2FA);

      // Check if 2FA is required
      if ('requires2FA' in response.data && response.data.requires2FA) {
        console.log('Login: 2FA is required, returning response to store');
        console.log('Login: refresh_token from response:', response.data.refresh_token);
        return response.data;
      }

      console.log('Login: 2FA not required, proceeding with normal login');

      const { access_token, refresh_token, admin } = response.data as LoginResponse;

      // Store token and admin data
      this.token = access_token;
      this.refreshToken = refresh_token;
      this.admin = admin;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('admin_data', JSON.stringify(admin));
      localStorage.setItem('login_time', Date.now().toString());
      localStorage.setItem('last_activity', Date.now().toString());

      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return response.data as LoginResponse;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async verify2FALogin(code: string, tempRefreshToken: string): Promise<LoginResponse> {
    try {
      console.log('verify2FALogin called with code:', code);
      console.log('verify2FALogin: tempRefreshToken provided:', !!tempRefreshToken);

      if (!tempRefreshToken) {
        throw new Error('No temporary token found. Please login again.');
      }

      console.log('Making 2FA verification request...');
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/v1/auth/portal-auth-gate-2fa`,
        { refresh_token: tempRefreshToken, code },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log('2FA verification successful');
      const { access_token, refresh_token, admin } = response.data;

      // Store token and admin data
      this.token = access_token;
      this.refreshToken = refresh_token;
      this.admin = admin;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('admin_data', JSON.stringify(admin));
      localStorage.setItem('login_time', Date.now().toString());
      localStorage.setItem('last_activity', Date.now().toString());

      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return response.data;
    } catch (error: any) {
      console.error('2FA verification error:', error);
      console.error('Error response:', error.response?.data);
      throw new Error(error.response?.data?.message || '2FA verification failed');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/api/v1/auth/logout`, {}, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Clear local storage and reset state
      this.token = null;
      this.refreshToken = null;
      this.admin = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('admin_data');
      localStorage.removeItem('login_time');
      localStorage.removeItem('last_activity');
      localStorage.removeItem('temp_2fa_token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/auth/verify`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        }
      });

      if (response.data.valid) {
        this.admin = response.data.admin;
        localStorage.setItem('admin_data', JSON.stringify(response.data.admin));
        return true;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      await this.logout();
    }

    return false;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.admin;
  }

  getToken(): string | null {
    return this.token;
  }

  getAdmin(): Admin | null {
    return this.admin;
  }

  // Update last activity timestamp
  updateLastActivity(): void {
    localStorage.setItem('last_activity', Date.now().toString());
  }

  // Check if session has expired (5 minutes of inactivity)
  isSessionExpired(): boolean {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) {
      return true;
    }

    const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
    const now = Date.now();
    const lastActivityTime = parseInt(lastActivity, 10);

    return (now - lastActivityTime) > fiveMinutes;
  }

  // Refresh the access token using refresh token
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    // If already refreshing, return the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const response = await axios.post<{ access_token: string; }>(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: this.refreshToken },
          {
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        const { access_token } = response.data;
        this.token = access_token;
        localStorage.setItem('auth_token', access_token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

        return access_token;
      } catch (error) {
        // Refresh failed, logout the user
        await this.logout();
        window.location.href = '/login';
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // Generate 2FA secret and QR code for setup
  async generate2FA(): Promise<{ secret: string; qrCodeUrl: string; }> {
    try {
      const response = await axios.post<{ secret: string; qrCodeUrl: string; }>(
        `${API_BASE_URL}/api/v1/auth/2fa/generate`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to generate 2FA secret');
    }
  }

  // Enable 2FA after verifying the initial code
  async enable2FA(code: string): Promise<{ success: boolean; }> {
    try {
      const response = await axios.post<{ success: boolean; }>(
        `${API_BASE_URL}/api/v1/auth/2fa/enable`,
        { code },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enable 2FA');
    }
  }

  // Disable 2FA
  async disable2FA(): Promise<{ success: boolean; }> {
    try {
      const response = await axios.post<{ success: boolean; }>(
        `${API_BASE_URL}/api/v1/auth/2fa/disable`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to disable 2FA');
    }
  }

  // Verify 2FA code (for testing purposes)
  async verify2FACode(code: string): Promise<{ valid: boolean; }> {
    try {
      const response = await axios.post<{ valid: boolean; }>(
        `${API_BASE_URL}/api/v1/auth/2fa/verify`,
        { code },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to verify 2FA code');
    }
  } 

  // Initialize axios interceptor for automatic token refresh on 401
  setupAxiosInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 429 Too Many Requests
        if (error.response?.status === 429) {
          const message = error.response?.data?.message || 'Too many requests. Please slow down and try again.';
          showGlobalSnackbar(message, 'error');
          return Promise.reject(error);
        }

        // Handle 500 Internal Server Error
        if (error.response?.status === 500) {
          const message = 'Internal server error. Please try again later.';
          showGlobalSnackbar(message, 'error');
          return Promise.reject(error);
        }

        // Handle 503 Service Unavailable
        if (error.response?.status === 503) {
          const message = 'Service temporarily unavailable. Please try again later.';
          showGlobalSnackbar(message, 'error');
          return Promise.reject(error);
        }

        // If 401 error and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Try to refresh the token
            const newToken = await this.refreshAccessToken();

            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    // Add token to all requests and update last activity
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          // Update last activity on every request
          this.updateLastActivity();
        }
        config.withCredentials = true;
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
}