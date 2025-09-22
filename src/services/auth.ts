import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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
  admin: Admin;
}

export class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private admin: Admin | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    const adminData = localStorage.getItem('admin_data');
    this.admin = adminData ? JSON.parse(adminData) : null;
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        credentials,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      const { access_token, admin } = response.data;

      // Store token and admin data
      this.token = access_token;
      this.admin = admin;
      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('admin_data', JSON.stringify(admin));
      localStorage.setItem('login_time', Date.now().toString());

      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
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
      this.admin = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('admin_data');
      localStorage.removeItem('login_time');
      delete axios.defaults.headers.common['Authorization'];
    }
  }

  async verifyToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
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

  // Check if session has expired (6 hours)
  isSessionExpired(): boolean {
    const loginTime = localStorage.getItem('login_time');
    if (!loginTime) {
      return true;
    }

    const sixHours = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
    const now = Date.now();
    const sessionTime = parseInt(loginTime, 10);

    return (now - sessionTime) > sixHours;
  }

  // Initialize axios interceptor for automatic logout on 401
  setupAxiosInterceptors(): void {
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );

    // Add token to all requests
    axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        config.withCredentials = true;
        config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
}