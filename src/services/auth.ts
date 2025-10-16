import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;

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
  adminId: string;
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

      // Check if 2FA is required
      if ('requires2FA' in response.data && response.data.requires2FA) {
        return response.data;
      }

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

  async verify2FALogin(adminId: string, code: string): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/api/v1/auth/login-2fa`,
        { adminId, code },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

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
        const response = await axios.post<{ access_token: string }>(
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

  // Initialize axios interceptor for automatic token refresh on 401
  setupAxiosInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

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