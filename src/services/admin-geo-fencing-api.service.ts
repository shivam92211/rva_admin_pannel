import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

// ==================== Interfaces ====================

export interface GeoFencingRule {
  id: string;
  countryCode: string;
  countryName: string;
  isAllowed: boolean;
  blockReason: string | null;
  isActive: boolean;
  priority: number;
  exemptedIps: string[];
  exemptedUserIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CreateGeoFencingRuleDto {
  countryCode: string;
  countryName: string;
  isAllowed: boolean;
  blockReason?: string;
  priority?: number;
  exemptedIps?: string[];
  exemptedUserIds?: string[];
}

export interface UpdateGeoFencingRuleDto {
  countryName?: string;
  isAllowed?: boolean;
  blockReason?: string;
  isActive?: boolean;
  priority?: number;
  exemptedIps?: string[];
  exemptedUserIds?: string[];
}

export interface GeoFencingRuleResponse {
  success: boolean;
  message?: string;
  data?: GeoFencingRule;
}

export interface GeoFencingRulesListResponse {
  success: boolean;
  data: GeoFencingRule[];
}

export interface GeoFencingLog {
  id: string;
  ipAddress: string;
  countryCode: string | null;
  countryName: string | null;
  city: string | null;
  isAllowed: boolean;
  userId: string | null;
  requestPath: string;
  requestMethod: string;
  userAgent: string | null;
  blockReason: string | null;
  createdAt: string;
}

export interface GeoFencingLogsListResponse {
  success: boolean;
  data: GeoFencingLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GetLogsParams {
  page?: number;
  limit?: number;
  countryCode?: string;
  isAllowed?: boolean;
}

export interface GeoFencingStats {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  blockRate: string;
  topBlockedCountries: Array<{
    countryCode: string;
    countryName: string;
    count: number;
  }>;
}

export interface GeoFencingStatsResponse {
  totalRequests: number;
  allowedRequests: number;
  blockedRequests: number;
  blockRate: string;
  topBlockedCountries: Array<{
    countryCode: string;
    countryName: string;
    count: number;
  }>;
}

export interface GetStatsParams {
  startDate?: string;
  endDate?: string;
}

// ==================== Admin Geo-Fencing API Service ====================

class AdminGeoFencingAPI {
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

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // ==================== Geo-Fencing Rules Management ====================

  /**
   * Get all geo-fencing rules
   * @returns List of all rules
   */
  async getAllRules(): Promise<GeoFencingRulesListResponse> {
    const response = await this.client.get<GeoFencingRulesListResponse>(
      '/api/v1/admin/geo-fencing/rules'
    );
    return response.data;
  }

  /**
   * Create new geo-fencing rule
   * @param data Rule data
   * @returns Created rule
   */
  async createRule(data: CreateGeoFencingRuleDto): Promise<GeoFencingRuleResponse> {
    const response = await this.client.post<GeoFencingRuleResponse>(
      '/api/v1/admin/geo-fencing/rules',
      data
    );
    return response.data;
  }

  /**
   * Update geo-fencing rule
   * @param id Rule ID
   * @param data Update data
   * @returns Updated rule
   */
  async updateRule(id: string, data: UpdateGeoFencingRuleDto): Promise<GeoFencingRuleResponse> {
    const response = await this.client.put<GeoFencingRuleResponse>(
      `/api/v1/admin/geo-fencing/rules/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete geo-fencing rule
   * @param id Rule ID
   * @returns Delete response
   */
  async deleteRule(id: string): Promise<GeoFencingRuleResponse> {
    const response = await this.client.delete<GeoFencingRuleResponse>(
      `/api/v1/admin/geo-fencing/rules/${id}`
    );
    return response.data;
  }

  // ==================== Geo-Fencing Logs ====================

  /**
   * Get geo-fencing access logs with pagination and filters
   * @param params Query parameters
   * @returns Paginated logs
   */
  async getLogs(params?: GetLogsParams): Promise<GeoFencingLogsListResponse> {
    const response = await this.client.get<GeoFencingLogsListResponse>(
      '/api/v1/admin/geo-fencing/logs',
      { params }
    );
    return response.data;
  }

  /**
   * Get geo-fencing statistics
   * @param params Date range parameters
   * @returns Statistics
   */
  async getStats(params?: GetStatsParams): Promise<GeoFencingStatsResponse> {
    const response = await this.client.get<GeoFencingStatsResponse>(
      '/api/v1/admin/geo-fencing/stats',
      { params }
    );
    return response.data;
  }

  // ==================== Helper Methods ====================

  /**
   * Get all allowed countries
   * @returns List of allowed country rules
   */
  async getAllowedCountries(): Promise<GeoFencingRule[]> {
    const response = await this.getAllRules();
    return response.data.filter(rule => rule.isAllowed && rule.isActive);
  }

  /**
   * Get all blocked countries
   * @returns List of blocked country rules
   */
  async getBlockedCountries(): Promise<GeoFencingRule[]> {
    const response = await this.getAllRules();
    return response.data.filter(rule => !rule.isAllowed && rule.isActive);
  }

  /**
   * Get all active rules
   * @returns List of active rules
   */
  async getActiveRules(): Promise<GeoFencingRule[]> {
    const response = await this.getAllRules();
    return response.data.filter(rule => rule.isActive);
  }

  /**
   * Get all inactive rules
   * @returns List of inactive rules
   */
  async getInactiveRules(): Promise<GeoFencingRule[]> {
    const response = await this.getAllRules();
    return response.data.filter(rule => !rule.isActive);
  }

  /**
   * Get blocked access attempts (logs)
   * @param params Pagination parameters
   * @returns Blocked access logs
   */
  async getBlockedAttempts(params?: Omit<GetLogsParams, 'isAllowed'>): Promise<GeoFencingLogsListResponse> {
    return this.getLogs({ ...params, isAllowed: false });
  }

  /**
   * Get allowed access logs
   * @param params Pagination parameters
   * @returns Allowed access logs
   */
  async getAllowedAttempts(params?: Omit<GetLogsParams, 'isAllowed'>): Promise<GeoFencingLogsListResponse> {
    return this.getLogs({ ...params, isAllowed: true });
  }

  /**
   * Get logs for a specific country
   * @param countryCode ISO country code (e.g., 'US', 'IN')
   * @param params Additional pagination parameters
   * @returns Country-specific logs
   */
  async getLogsByCountry(
    countryCode: string,
    params?: Omit<GetLogsParams, 'countryCode'>
  ): Promise<GeoFencingLogsListResponse> {
    return this.getLogs({ ...params, countryCode });
  }

  /**
   * Block a country (create or update rule to block)
   * @param countryCode ISO country code
   * @param countryName Full country name
   * @param blockReason Reason for blocking
   * @returns Created/Updated rule
   */
  async blockCountry(
    countryCode: string,
    countryName: string,
    blockReason?: string
  ): Promise<GeoFencingRuleResponse> {
    return this.createRule({
      countryCode: countryCode.toUpperCase(),
      countryName,
      isAllowed: false,
      blockReason: blockReason || 'Blocked by administrator',
    });
  }

  /**
   * Allow a country (create or update rule to allow)
   * @param countryCode ISO country code
   * @param countryName Full country name
   * @returns Created/Updated rule
   */
  async allowCountry(
    countryCode: string,
    countryName: string
  ): Promise<GeoFencingRuleResponse> {
    return this.createRule({
      countryCode: countryCode.toUpperCase(),
      countryName,
      isAllowed: true,
    });
  }

  /**
   * Toggle rule active status
   * @param id Rule ID
   * @param isActive New active status
   * @returns Updated rule
   */
  async toggleRuleStatus(id: string, isActive: boolean): Promise<GeoFencingRuleResponse> {
    return this.updateRule(id, { isActive });
  }

  /**
   * Add IP to exemption list
   * @param id Rule ID
   * @param ip IP address to exempt
   * @param currentExemptedIps Current list of exempted IPs
   * @returns Updated rule
   */
  async addExemptedIp(
    id: string,
    ip: string,
    currentExemptedIps: string[]
  ): Promise<GeoFencingRuleResponse> {
    const exemptedIps = [...new Set([...currentExemptedIps, ip])];
    return this.updateRule(id, { exemptedIps });
  }

  /**
   * Remove IP from exemption list
   * @param id Rule ID
   * @param ip IP address to remove
   * @param currentExemptedIps Current list of exempted IPs
   * @returns Updated rule
   */
  async removeExemptedIp(
    id: string,
    ip: string,
    currentExemptedIps: string[]
  ): Promise<GeoFencingRuleResponse> {
    const exemptedIps = currentExemptedIps.filter(exemptedIp => exemptedIp !== ip);
    return this.updateRule(id, { exemptedIps });
  }

  /**
   * Add user to exemption list
   * @param id Rule ID
   * @param userId User ID to exempt
   * @param currentExemptedUserIds Current list of exempted user IDs
   * @returns Updated rule
   */
  async addExemptedUser(
    id: string,
    userId: string,
    currentExemptedUserIds: string[]
  ): Promise<GeoFencingRuleResponse> {
    const exemptedUserIds = [...new Set([...currentExemptedUserIds, userId])];
    return this.updateRule(id, { exemptedUserIds });
  }

  /**
   * Remove user from exemption list
   * @param id Rule ID
   * @param userId User ID to remove
   * @param currentExemptedUserIds Current list of exempted user IDs
   * @returns Updated rule
   */
  async removeExemptedUser(
    id: string,
    userId: string,
    currentExemptedUserIds: string[]
  ): Promise<GeoFencingRuleResponse> {
    const exemptedUserIds = currentExemptedUserIds.filter(
      exemptedUserId => exemptedUserId !== userId
    );
    return this.updateRule(id, { exemptedUserIds });
  }

  /**
   * Get statistics for a specific date range
   * @param startDate Start date (ISO string)
   * @param endDate End date (ISO string)
   * @returns Statistics for the date range
   */
  async getStatsForDateRange(startDate: string, endDate: string): Promise<GeoFencingStatsResponse> {
    return this.getStats({ startDate, endDate });
  }

  /**
   * Get statistics for today
   * @returns Today's statistics
   */
  async getTodayStats(): Promise<GeoFencingStatsResponse> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = today.toISOString();

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const endDate = tomorrow.toISOString();

    return this.getStats({ startDate, endDate });
  }

  /**
   * Get statistics for the last N days
   * @param days Number of days
   * @returns Statistics for the period
   */
  async getLastNDaysStats(days: number): Promise<GeoFencingStatsResponse> {
    const endDate = new Date().toISOString();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getStats({ startDate: startDate.toISOString(), endDate });
  }

  /**
   * Validate country code format (ISO 3166-1 alpha-2)
   * @param countryCode Country code to validate
   * @returns True if valid format
   */
  validateCountryCode(countryCode: string): boolean {
    return /^[A-Z]{2}$/.test(countryCode);
  }

  /**
   * Validate IP address format
   * @param ip IP address to validate
   * @returns True if valid IPv4 or IPv6 format
   */
  validateIpAddress(ip: string): boolean {
    // IPv4 pattern
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    // IPv6 pattern (simplified)
    const ipv6Pattern = /^([0-9a-fA-F]{0,4}:){7}[0-9a-fA-F]{0,4}$/;

    return ipv4Pattern.test(ip) || ipv6Pattern.test(ip);
  }

  /**
   * Format block rate for display
   * @param stats Statistics object
   * @returns Formatted block rate
   */
  formatBlockRate(stats: GeoFencingStats): string {
    return stats.blockRate;
  }

  /**
   * Get summary counts from statistics
   * @param stats Statistics object
   * @returns Summary object
   */
  getStatsSummary(stats: GeoFencingStats) {
    return {
      total: stats.totalRequests,
      allowed: stats.allowedRequests,
      blocked: stats.blockedRequests,
      blockRate: parseFloat(stats.blockRate),
      topBlockedCount: stats.topBlockedCountries.length,
    };
  }
}

export const adminGeoFencingApi = new AdminGeoFencingAPI();
export default adminGeoFencingApi;
