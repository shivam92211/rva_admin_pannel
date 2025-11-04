import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

// ==================== Interfaces ====================

export enum FeeType {
  SPOT_TRADE = 'SPOT_TRADE',
  PERPS_TRADE = 'PERPS_TRADE',
  WITHDRAWAL = 'WITHDRAWAL',
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

export interface PlatformFeeTier {
  id: string;
  feeType: FeeType;
  name: string;
  description: string | null;
  minVolume: string; // Decimal as string
  maxVolume: string | null; // Decimal as string, null = unlimited
  feeRate: string; // Decimal as string (e.g., "0.002" for 0.2%)
  currency: string | null;
  minFeeAmount: string | null;
  maxFeeAmount: string | null;
  flatFeeAmount: string | null;
  isActive: boolean;
  tierOrder: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface CreateFeeTierDto {
  feeType: FeeType;
  name: string;
  description?: string;
  minVolume: number;
  maxVolume?: number | null;
  feeRate: number; // Decimal (e.g., 0.002 for 0.2%)
  currency?: string;
  minFeeAmount?: number;
  maxFeeAmount?: number;
  flatFeeAmount?: number;
  tierOrder?: number;
}

export interface UpdateFeeTierDto {
  name?: string;
  description?: string;
  minVolume?: number;
  maxVolume?: number | null;
  feeRate?: number;
  currency?: string;
  minFeeAmount?: number;
  maxFeeAmount?: number;
  flatFeeAmount?: number;
  isActive?: boolean;
  tierOrder?: number;
}

export interface FeeTierResponse {
  success: boolean;
  message?: string;
  data?: PlatformFeeTier;
}

export interface FeeTiersListResponse {
  success: boolean;
  data: PlatformFeeTier[];
  pagination?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface GetFeeTiersParams {
  feeType?: FeeType;
  isActive?: boolean;
  currency?: string;
}

export interface FeeCalculationResult {
  feeAmount: number;
  feeRate: number;
  feePercentage: number;
  appliedTier?: {
    id: string;
    name: string;
    feeType: FeeType;
    currency: string | null;
    minVolume: number;
    maxVolume: number | null;
    feeRate: number;
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

  // ==================== Fee Tier Management ====================

  /**
   * Get all platform fee tiers
   * @param params Query parameters for filtering
   * @returns List of fee tiers
   */
  async getAllFeeTiers(params?: GetFeeTiersParams): Promise<FeeTiersListResponse> {
    const response = await this.client.get<FeeTiersListResponse>(
      '/api/v1/admin/fees',
      { params }
    );
    return response.data;
  }

  /**
   * Get platform fee tier by ID
   * @param id Fee Tier ID
   * @returns Fee tier details
   */
  async getFeeTierById(id: string): Promise<FeeTierResponse> {
    const response = await this.client.get<FeeTierResponse>(
      `/api/v1/admin/fees/${id}`
    );
    return response.data;
  }

  /**
   * Create new platform fee tier
   * @param data Fee tier data
   * @returns Created fee tier
   */
  async createFeeTier(data: CreateFeeTierDto): Promise<FeeTierResponse> {
    const response = await this.client.post<FeeTierResponse>(
      '/api/v1/admin/fees',
      data
    );
    return response.data;
  }

  /**
   * Update platform fee tier
   * @param id Fee Tier ID
   * @param data Update data
   * @returns Updated fee tier
   */
  async updateFeeTier(id: string, data: UpdateFeeTierDto): Promise<FeeTierResponse> {
    const response = await this.client.put<FeeTierResponse>(
      `/api/v1/admin/fees/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Delete platform fee tier
   * @param id Fee Tier ID
   * @returns Delete response
   */
  async deleteFeeTier(id: string): Promise<FeeTierResponse> {
    const response = await this.client.delete<FeeTierResponse>(
      `/api/v1/admin/fees/${id}`
    );
    return response.data;
  }

  /**
   * Get fee tiers by type
   * @param feeType Fee type
   * @param currency Optional currency filter
   * @returns List of fee tiers for the specified type
   */
  async getTiersByFeeType(feeType: FeeType, currency?: string): Promise<FeeTiersListResponse> {
    const params = currency ? { currency } : undefined;
    const response = await this.client.get<FeeTiersListResponse>(
      `/api/v1/admin/fees/tiers/${feeType}`,
      { params }
    );
    return response.data;
  }

  // ==================== Fee Calculation & Testing ====================

  /**
   * Calculate spot trade fee for a given amount
   * @param params Calculation parameters
   * @returns Fee calculation result
   */
  async calculateSpotTradeFee(params: CalculateFeeParams): Promise<FeeCalculationResponse> {
    const response = await this.client.get<FeeCalculationResponse>(
      '/api/v1/admin/fees/calculate/spot-trade',
      { params }
    );
    return response.data;
  }

  /**
   * Calculate perps trade fee for a given amount
   * @param params Calculation parameters
   * @returns Fee calculation result
   */
  async calculatePerpsTradeFee(params: CalculateFeeParams): Promise<FeeCalculationResponse> {
    const response = await this.client.get<FeeCalculationResponse>(
      '/api/v1/admin/fees/calculate/perps-trade',
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
   * Get all spot trade fee tiers
   * @returns List of spot trade fee tiers
   */
  async getSpotTradeFees(): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ feeType: FeeType.SPOT_TRADE });
  }

  /**
   * Get all perps trade fee tiers
   * @returns List of perps trade fee tiers
   */
  async getPerpsTradeFees(): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ feeType: FeeType.PERPS_TRADE });
  }

  /**
   * Get all withdrawal fee tiers
   * @returns List of withdrawal fee tiers
   */
  async getWithdrawalFees(): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ feeType: FeeType.WITHDRAWAL });
  }

  /**
   * Get all deposit fee tiers
   * @returns List of deposit fee tiers
   */
  async getDepositFees(): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ feeType: FeeType.DEPOSIT });
  }

  /**
   * Get all transfer fee tiers
   * @returns List of transfer fee tiers
   */
  async getTransferFees(): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ feeType: FeeType.TRANSFER });
  }

  /**
   * Get all active fee tiers
   * @returns List of active fee tiers
   */
  async getActiveFees(): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ isActive: true });
  }

  /**
   * Get fee tiers for a specific currency
   * @param currency Currency code (e.g., 'BTC', 'ETH')
   * @returns List of fee tiers for the currency
   */
  async getFeesByCurrency(currency: string): Promise<FeeTiersListResponse> {
    return this.getAllFeeTiers({ currency });
  }

  // ==================== Utility Methods ====================

  /**
   * Convert fee rate decimal to percentage
   * @param feeRate Fee rate as decimal (e.g., 0.002)
   * @returns Percentage value (e.g., 0.2)
   */
  feeRateToPercentage(feeRate: number): number {
    return feeRate * 100;
  }

  /**
   * Convert percentage to fee rate decimal
   * @param percentage Percentage value (e.g., 0.2)
   * @returns Fee rate as decimal (e.g., 0.002)
   */
  percentageToFeeRate(percentage: number): number {
    return percentage / 100;
  }

  /**
   * Format fee tier for display
   * @param tier Platform fee tier
   * @returns Formatted fee tier string
   */
  formatFeeTierDisplay(tier: PlatformFeeTier): string {
    if (tier.flatFeeAmount) {
      return `${tier.flatFeeAmount} ${tier.currency || ''}`.trim();
    }
    const percentage = this.feeRateToPercentage(parseFloat(tier.feeRate));
    return `${percentage}%`;
  }

  /**
   * Format volume range for display
   * @param tier Platform fee tier
   * @returns Formatted range string (e.g., "$0 - $100", "$1000+")
   */
  formatVolumeRange(tier: PlatformFeeTier): string {
    const minVolume = parseFloat(tier.minVolume);
    const maxVolume = tier.maxVolume ? parseFloat(tier.maxVolume) : null;

    if (maxVolume === null) {
      return `$${minVolume.toLocaleString()}+`;
    }

    return `$${minVolume.toLocaleString()} - $${maxVolume.toLocaleString()}`;
  }

  /**
   * Get tier description with range and fee
   * @param tier Platform fee tier
   * @returns Description string
   */
  getTierDescription(tier: PlatformFeeTier): string {
    const range = this.formatVolumeRange(tier);
    const fee = this.formatFeeTierDisplay(tier);
    return `${range} → ${fee}`;
  }

  /**
   * Validate fee tier data
   * @param data Fee tier data
   * @returns Validation errors or null if valid
   */
  validateFeeTierData(data: CreateFeeTierDto | UpdateFeeTierDto): string[] {
    const errors: string[] = [];

    if ('feeRate' in data && data.feeRate !== undefined) {
      if (data.feeRate < 0 || data.feeRate > 1) {
        errors.push('Fee rate must be between 0 and 1 (e.g., 0.002 for 0.2%)');
      }
    }

    if ('minVolume' in data && data.minVolume !== undefined) {
      if (data.minVolume < 0) {
        errors.push('Minimum volume cannot be negative');
      }
    }

    if (data.minFeeAmount !== undefined && data.maxFeeAmount !== undefined) {
      if (data.minFeeAmount && data.maxFeeAmount && data.minFeeAmount > data.maxFeeAmount) {
        errors.push('Minimum fee amount cannot be greater than maximum fee amount');
      }
    }

    if ('maxVolume' in data && data.maxVolume !== undefined && data.maxVolume !== null) {
      if ('minVolume' in data && data.minVolume !== undefined && data.maxVolume <= data.minVolume) {
        errors.push('Maximum volume must be greater than minimum volume');
      }
    }

    if ('name' in data && data.name !== undefined) {
      if (data.name.length < 2 || data.name.length > 200) {
        errors.push('Name must be between 2 and 200 characters');
      }
    }

    return errors;
  }

  /**
   * Calculate fee amount locally (client-side estimation)
   * @param amount Transaction amount
   * @param feeRate Fee rate as decimal
   * @param minFee Optional minimum fee
   * @param maxFee Optional maximum fee
   * @returns Calculated fee amount
   */
  calculateFeeAmount(
    amount: number,
    feeRate: number,
    minFee?: number,
    maxFee?: number
  ): number {
    let feeAmount = amount * feeRate;

    if (minFee !== undefined && feeAmount < minFee) {
      feeAmount = minFee;
    }

    if (maxFee !== undefined && feeAmount > maxFee) {
      feeAmount = maxFee;
    }

    return feeAmount;
  }

  /**
   * Find applicable tier for a given amount (client-side)
   * @param tiers List of fee tiers (must be sorted by minVolume)
   * @param amount Transaction amount
   * @returns Applicable tier or null
   */
  findApplicableTier(tiers: PlatformFeeTier[], amount: number): PlatformFeeTier | null {
    for (const tier of tiers) {
      const minVolume = parseFloat(tier.minVolume);
      const maxVolume = tier.maxVolume ? parseFloat(tier.maxVolume) : null;

      if (amount >= minVolume && (maxVolume === null || amount < maxVolume)) {
        return tier;
      }
    }

    return null;
  }

  /**
   * Sort tiers by volume range
   * @param tiers List of fee tiers
   * @returns Sorted tiers
   */
  sortTiersByVolume(tiers: PlatformFeeTier[]): PlatformFeeTier[] {
    return [...tiers].sort((a, b) => {
      const aMin = parseFloat(a.minVolume);
      const bMin = parseFloat(b.minVolume);
      return aMin - bMin;
    });
  }
}

export const adminFeesApi = new AdminFeesAPI();
export default adminFeesApi;
