import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT' | 'READONLY';
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  failedAttempts: number;
  lockedUntil: string | null;
  profilePicture: string | null;
  phone: string | null;
  department: string | null;
  isGoogle2FAEnabled: boolean;
  createdBy: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

export interface AdminListResponse {
  admins: Admin[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminOperationResponse {
  success: boolean;
  message: string;
  admin?: Admin;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export interface AdminLogsResponse {
  logs: AdminLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateAdminDto {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MODERATOR' | 'SUPPORT' | 'READONLY';
  permissions?: string[];
  phone?: string;
  department?: string;
  profilePicture?: string;
}

export interface UpdateAdminDto {
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'MODERATOR' | 'SUPPORT' | 'READONLY';
  permissions?: string[];
  phone?: string;
  department?: string;
  profilePicture?: string;
  isActive?: boolean;
}

export interface UpdatePasswordDto {
  newPassword: string;
}

export interface BlockAdminDto {
  reason?: string;
}

export interface DeleteAdminDto {
  reason?: string;
}

export interface GetAdminsParams {
  page?: number;
  limit?: number;
  includeDeleted?: boolean;
}

export interface GetAdminLogsParams {
  adminId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

class AdminManagementAPI {
  private client: AxiosInstance;

  private getToken = () => {
    const authService = AuthService.getInstance();
    return authService.getToken();
  };

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL!,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to dynamically set authorization header
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a new admin
   */
  async createAdmin(data: CreateAdminDto): Promise<AdminOperationResponse> {
    const response = await this.client.post<AdminOperationResponse>(
      '/api/v1/admin/management/create',
      data
    );
    return response.data;
  }

  /**
   * Update an existing admin
   */
  async updateAdmin(adminId: string, data: UpdateAdminDto): Promise<AdminOperationResponse> {
    const response = await this.client.put<AdminOperationResponse>(
      `/api/v1/admin/management/${adminId}`,
      data
    );
    return response.data;
  }

  /**
   * Update admin password
   */
  async updatePassword(adminId: string, data: UpdatePasswordDto): Promise<AdminOperationResponse> {
    const response = await this.client.put<AdminOperationResponse>(
      `/api/v1/admin/management/${adminId}/password`,
      data
    );
    return response.data;
  }

  /**
   * Block an admin
   */
  async blockAdmin(adminId: string, data?: BlockAdminDto): Promise<AdminOperationResponse> {
    const response = await this.client.post<AdminOperationResponse>(
      `/api/v1/admin/management/${adminId}/block`,
      data || {}
    );
    return response.data;
  }

  /**
   * Unblock an admin
   */
  async unblockAdmin(adminId: string): Promise<AdminOperationResponse> {
    const response = await this.client.post<AdminOperationResponse>(
      `/api/v1/admin/management/${adminId}/unblock`
    );
    return response.data;
  }

  /**
   * Delete an admin (soft delete)
   */
  async deleteAdmin(adminId: string, data?: DeleteAdminDto): Promise<AdminOperationResponse> {
    const response = await this.client.delete<AdminOperationResponse>(
      `/api/v1/admin/management/${adminId}`,
      {
        data: data || {},
      }
    );
    return response.data;
  }

  /**
   * Get all admins with pagination
   */
  async getAllAdmins(params?: GetAdminsParams): Promise<AdminListResponse> {
    const response = await this.client.get<AdminListResponse>('/api/v1/admin/management/list', {
      params,
    });
    return response.data;
  }

  /**
   * Get active admins only
   */
  async getActiveAdmins(params?: Pick<GetAdminsParams, 'page' | 'limit'>): Promise<AdminListResponse> {
    const response = await this.client.get<AdminListResponse>('/api/v1/admin/management/active', {
      params,
    });
    return response.data;
  }

  /**
   * Get admin by ID
   */
  async getAdminById(adminId: string): Promise<Admin> {
    const response = await this.client.get<Admin>(`/api/v1/admin/management/${adminId}`);
    return response.data;
  }

  /**
   * Get admin logs with filters
   */
  async getAdminLogs(params?: GetAdminLogsParams): Promise<AdminLogsResponse> {
    const response = await this.client.get<AdminLogsResponse>('/api/v1/admin/management/logs/all', {
      params,
    });
    return response.data;
  }

  /**
   * Get action history for a specific admin
   */
  async getAdminActionHistory(
    adminId: string,
    params?: Pick<GetAdminLogsParams, 'page' | 'limit'>
  ): Promise<AdminLogsResponse> {
    const response = await this.client.get<AdminLogsResponse>(
      `/api/v1/admin/management/logs/${adminId}/history`,
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get recent admin management actions
   */
  async getRecentAdminManagementActions(limit?: number): Promise<AdminLog[]> {
    const response = await this.client.get<AdminLog[]>('/api/v1/admin/management/logs/recent', {
      params: { limit },
    });
    return response.data;
  }
}

export const adminManagementApi = new AdminManagementAPI();
export default adminManagementApi;
