import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

// ==================== Interfaces ====================

export enum FeeType {
  TRADE_FEE = 'TRADE_FEE',
  WITHDRAWAL_FEE = 'WITHDRAWAL_FEE',
  DEPOSIT_FEE = 'DEPOSIT_FEE',
  TRANSFER_FEE = 'TRANSFER_FEE',
  OTHER = 'OTHER',
}

export interface PlatformFee {
  id: string;
  feeType: FeeType;
  name: string;
  description: string | null;
  feeBps: number;
  currency: string | null;
  minFeeAmount: string | null;
  maxFeeAmount: string | null;
  flatFeeAmount: string | null;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CreatePlatformFeeDto {
  feeType: FeeType;
  name: string;
  description?: string;
  feeBps: number;
  currency?: string;
  minFeeAmount?: number;
  maxFeeAmount?: number;
  flatFeeAmount?: number;
  priority?: number;
}

export interface UpdatePlatformFeeDto {
  name?: string;
  description?: string;
  feeBps?: number;
  currency?: string;
  minFeeAmount?: number;
  maxFeeAmount?: number;
  flatFeeAmount?: number;
  isActive?: boolean;
  priority?: number;
}

export interface PlatformFeeResponse {
  success: boolean;
  message?: string;
  data?: PlatformFee;
}

export interface PlatformFeesListResponse {
  success: boolean;
  data: PlatformFee[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GetFeesParams {
  feeType?: FeeType;
  isActive?: boolean;
  currency?: string;
}

export interface FeeCalculationResult {
  feeAmount: number;
  feeBps: number;
  feePercentage: number;
  appliedFeeConfig?: {
    id: string;
    name: string;
    feeType: FeeType;
    currency: string | null;
  };
}

export interface FeeCalculationResponse {
  success: boolean;
  data: FeeCalculationResult;
}

export interface CalculateFeeParams {
  amount: number;
  currency?: string;
}

// ==================== Admin Fees API Service ====================

class AdminFeesAPI {
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

  // ==================== Fee Management ====================

  /**
   * Get all platform fees
   * @param params Query parameters for filtering
   * @returns List of fees
   */
  async getAllFees(params?: GetFeesParams): Promise<PlatformFeesListResponse> {
    const response = await this.client.get<PlatformFeesListResponse>(
      '/api/v1/admin/fees',
      { params }
    );
    return response.data;
  }

  /**
   * Get platform fee by ID
   * @param id Fee ID
   * @returns Fee details
   */
  async getFeeById(id: string): Promise<PlatformFeeResponse> {
    const response = await this.client.get<PlatformFeeResponse>(
      `/api/v1/admin/fees/${id}`
    );
    return response.data;
  }

  /**
   * Create new platform fee
   * @param data Fee data
   * @returns Created fee
   */
  async createFee(data: CreatePlatformFeeDto): Promise<PlatformFeeResponse> {
    const response = await this.client.post<PlatformFeeResponse>(
      '/api/v1/admin/fees',
      data
    );
    return response.data;
  }

  /**
   * Update platform fee
   * @param id Fee ID
   * @param data Update data
   * @returns Updated fee
   */
  async updateFee(id: string, data: UpdatePlatformFeeDto): Promise<PlatformFeeResponse> {
    const response = await this.client.put<PlatformFeeResponse>(
      `/api/v1/admin/fees/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete platform fee
   * @param id Fee ID
   * @returns Delete response
   */
  async deleteFee(id: string): Promise<PlatformFeeResponse> {
    const response = await this.client.delete<PlatformFeeResponse>(
      `/api/v1/admin/fees/${id}`
    );
    return response.data;
  }

  // ==================== Fee Calculation & Testing ====================

  /**
   * Calculate trade fee for a given amount
   * @param params Calculation parameters
   * @returns Fee calculation result
   */
  async calculateTradeFee(params: CalculateFeeParams): Promise<FeeCalculationResponse> {
    const response = await this.client.get<FeeCalculationResponse>(
      '/api/v1/admin/fees/calculate/trade',
      { params }
    );
    return response.data;
  }

  /**
   * Calculate withdrawal fee for a given amount
   * @param params Calculation parameters
   * @returns Fee calculation result
   */
  async calculateWithdrawalFee(params: CalculateFeeParams): Promise<FeeCalculationResponse> {
    const response = await this.client.get<FeeCalculationResponse>(
      '/api/v1/admin/fees/calculate/withdrawal',
      { params }
    );
    return response.data;
  }

  // ==================== Helper Methods ====================

  /**
   * Get all trade fees
   * @returns List of trade fees
   */
  async getTradeFees(): Promise<PlatformFeesListResponse> {
    return this.getAllFees({ feeType: FeeType.TRADE_FEE });
  }

  /**
   * Get all withdrawal fees
   * @returns List of withdrawal fees
   */
  async getWithdrawalFees(): Promise<PlatformFeesListResponse> {
    return this.getAllFees({ feeType: FeeType.WITHDRAWAL_FEE });
  }

  /**
   * Get all deposit fees
   * @returns List of deposit fees
   */
  async getDepositFees(): Promise<PlatformFeesListResponse> {
    return this.getAllFees({ feeType: FeeType.DEPOSIT_FEE });
  }

  /**
   * Get all transfer fees
   * @returns List of transfer fees
   */
  async getTransferFees(): Promise<PlatformFeesListResponse> {
    return this.getAllFees({ feeType: FeeType.TRANSFER_FEE });
  }

  /**
   * Get all active fees
   * @returns List of active fees
   */
  async getActiveFees(): Promise<PlatformFeesListResponse> {
    return this.getAllFees({ isActive: true });
  }

  /**
   * Get fees for a specific currency
   * @param currency Currency code (e.g., 'BTC', 'ETH')
   * @returns List of fees for the currency
   */
  async getFeesByCurrency(currency: string): Promise<PlatformFeesListResponse> {
    return this.getAllFees({ currency });
  }

  /**
   * Convert basis points to percentage
   * @param bps Basis points
   * @returns Percentage value
   */
  bpsToPercentage(bps: number): number {
    return bps / 100;
  }

  /**
   * Convert percentage to basis points
   * @param percentage Percentage value
   * @returns Basis points
   */
  percentageToBps(percentage: number): number {
    return Math.round(percentage * 100);
  }

  /**
   * Format fee for display
   * @param fee Platform fee
   * @returns Formatted fee string
   */
  formatFeeDisplay(fee: PlatformFee): string {
    if (fee.flatFeeAmount) {
      return `${fee.flatFeeAmount} ${fee.currency || ''}`.trim();
    }
    const percentage = this.bpsToPercentage(fee.feeBps);
    return `${percentage}%`;
  }

  /**
   * Validate fee configuration
   * @param data Fee data
   * @returns Validation errors or null if valid
   */
  validateFeeData(data: CreatePlatformFeeDto | UpdatePlatformFeeDto): string[] {
    const errors: string[] = [];

    if ('feeBps' in data && data.feeBps !== undefined) {
      if (data.feeBps < 0 || data.feeBps > 10000) {
        errors.push('Fee in basis points must be between 0 and 10000');
      }
    }

    if (data.minFeeAmount !== undefined && data.maxFeeAmount !== undefined) {
      if (data.minFeeAmount && data.maxFeeAmount && data.minFeeAmount > data.maxFeeAmount) {
        errors.push('Minimum fee amount cannot be greater than maximum fee amount');
      }
    }

    if ('name' in data && data.name !== undefined) {
      if (data.name.length < 2 || data.name.length > 200) {
        errors.push('Name must be between 2 and 200 characters');
      }
    }

    return errors;
  }
}

export const adminFeesApi = new AdminFeesAPI();
export default adminFeesApi;
