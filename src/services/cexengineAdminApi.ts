/**
 * CEX Engine Admin Client Service for ViteJS Admin Panel
 * 
 * This service provides a TypeScript client for managing trading pairs
 * and system configurations in your ViteJS admin panel.
 */

export interface CreateTradingPairDto {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  minOrderSize: string;
  minOrderValue: string;
  maxOrderSize?: string;
  maxOrderValue?: string;
  tickSize: string;
  lotSize: string;
  makerFeeRate: string;
  takerFeeRate: string;
  status?: TradingPairsStatus;
  isMarketOrderEnabled?: boolean;
  isLimitOrderEnabled?: boolean;
  isStopOrderEnabled?: boolean;
  isIcebergOrderEnabled?: boolean;
  isHiddenOrderEnabled?: boolean;
  description?: string;
  tags?: string[];
}

export interface UpdateTradingPairDto {
  minOrderSize?: string;
  minOrderValue?: string;
  maxOrderSize?: string;
  maxOrderValue?: string;
  tickSize?: string;
  lotSize?: string;
  makerFeeRate?: string;
  takerFeeRate?: string;
  status?: TradingPairsStatus;
  isMarketOrderEnabled?: boolean;
  isLimitOrderEnabled?: boolean;
  isStopOrderEnabled?: boolean;
  isIcebergOrderEnabled?: boolean;
  isHiddenOrderEnabled?: boolean;
  description?: string;
  tags?: string[];
}

export interface TradingPairResponseDto {
  id: string;
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  baseAssetPrecision: number;
  quoteAssetPrecision: number;
  minOrderSize: string;
  minOrderValue: string;
  maxOrderSize?: string;
  maxOrderValue?: string;
  tickSize: string;
  lotSize: string;
  makerFeeRate: string;
  takerFeeRate: string;
  status: string;
  isMarketOrderEnabled: boolean;
  isLimitOrderEnabled: boolean;
  isStopOrderEnabled: boolean;
  isIcebergOrderEnabled: boolean;
  isHiddenOrderEnabled: boolean;
  imageUrl?: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export enum TradingPairsStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface EngineStatusResponse {
  status: string;
  uptime: number;
  version: string;
  connectedUsers: number;
  activeMarkets: number;
  systemHealth: {
    database: boolean;
    redis: boolean;
    websocket: boolean;
    orderMatching: boolean;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    percentage: number;
    cores: number;
  };
}

export interface TradingPairFilters {
  status?: TradingPairsStatus;
  baseAsset?: string;
  quoteAsset?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category: string;
  isEditable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateSystemConfigDto {
  value: string;
  description?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class CexEngineAdminClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_API_ENGINE_URL || ""}/api/v1/cex/admin`;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Get authentication headers
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return response.blob() as unknown as T;
  }

  /**
   * Make API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Trading Pair Management Methods

  /**
   * Create a new trading pair
   */
  async createTradingPair(
    data: CreateTradingPairDto,
    image?: File
  ): Promise<TradingPairResponseDto> {
    if (image) {
      // Use FormData endpoint when image is provided
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add image
      formData.append('image', image);

      return this.request<TradingPairResponseDto>('/trading-pairs-img', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
          Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
        },
      });
    } else {
      // Use JSON endpoint when no image is provided
      return this.request<TradingPairResponseDto>('/trading-pairs', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    }
  }

  /**
   * Update an existing trading pair
   */
  async updateTradingPair(
    symbol: string,
    data: UpdateTradingPairDto,
    image?: File
  ): Promise<TradingPairResponseDto> {
    if (image) {
      // Use FormData endpoint when image is provided (assuming you have /trading-pairs-img/:symbol)
      const formData = new FormData();

      // Add all fields to form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Add image
      formData.append('image', image);

      return this.request<TradingPairResponseDto>(`/trading-pairs-img/${symbol}`, {
        method: 'PUT',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary for FormData
          Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
        },
      });
    } else {
      // Use JSON endpoint when no image is provided
      return this.request<TradingPairResponseDto>(`/trading-pairs/${symbol}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    }
  }

  /**
   * Delete a trading pair
   */
  async deleteTradingPair(symbol: string): Promise<void> {
    return this.request<void>(`/trading-pairs/${symbol}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all trading pairs with optional filters
   */
  async getTradingPairs(
    filters?: TradingPairFilters
  ): Promise<TradingPairResponseDto[]> {
    const searchParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString() ? `?${searchParams}` : '';
    return this.request<TradingPairResponseDto[]>(`/trading-pairs${query}`);
  }

  /**
   * Get a specific trading pair by symbol
   */
  async getTradingPair(symbol: string): Promise<TradingPairResponseDto> {
    return this.request<TradingPairResponseDto>(`/trading-pairs/${symbol}`);
  }

  // Market Management Methods

  /**
   * Suspend trading for a market
   */
  async suspendMarket(symbol: string): Promise<TradingPairResponseDto> {
    return this.request<TradingPairResponseDto>(`/markets/${symbol}/suspend`, {
      method: 'POST',
    });
  }

  /**
   * Activate trading for a market
   */
  async activateMarket(symbol: string): Promise<TradingPairResponseDto> {
    return this.request<TradingPairResponseDto>(`/markets/${symbol}/activate`, {
      method: 'POST',
    });
  }

  /**
   * Deactivate trading for a market
   */
  async deactivateMarket(symbol: string): Promise<TradingPairResponseDto> {
    return this.request<TradingPairResponseDto>(`/markets/${symbol}/deactivate`, {
      method: 'POST',
    });
  }

  // Engine Status and Monitoring Methods

  /**
   * Get engine status and health information
   */
  async getEngineStatus(): Promise<EngineStatusResponse> {
    return this.request<EngineStatusResponse>('/engine/status');
  }

  // System Configuration Methods

  /**
   * Get all system configurations
   */
  async getSystemConfigs(category?: string): Promise<SystemConfig[]> {
    const query = category ? `?category=${category}` : '';
    return this.request<SystemConfig[]>(`/system/configs${query}`);
  }

  /**
   * Update a system configuration
   */
  async updateSystemConfig(
    key: string,
    data: UpdateSystemConfigDto
  ): Promise<SystemConfig> {
    return this.request<SystemConfig>(`/system/configs/${key}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Utility Methods

  /**
   * Get available base assets
   */
  async getAvailableBaseAssets(): Promise<string[]> {
    return this.request<string[]>('/assets/base');
  }

  /**
   * Get available quote assets
   */
  async getAvailableQuoteAssets(): Promise<string[]> {
    return this.request<string[]>('/assets/quote');
  }

  /**
   * Bulk update trading pairs status
   */
  async bulkUpdateTradingPairsStatus(
    symbols: string[],
    status: TradingPairsStatus
  ): Promise<TradingPairResponseDto[]> {
    return this.request<TradingPairResponseDto[]>('/trading-pairs/bulk/status', {
      method: 'PUT',
      body: JSON.stringify({ symbols, status }),
    });
  }

  /**
   * Export trading pairs configuration
   */
  async exportTradingPairs(): Promise<Blob> {
    return this.request<Blob>('/trading-pairs/export');
  }

  /**
   * Import trading pairs configuration
   */
  async importTradingPairs(file: File): Promise<{ imported: number; errors: string[]; }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ imported: number; errors: string[]; }>('/trading-pairs/import', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        Authorization: this.authToken ? `Bearer ${this.authToken}` : '',
      },
    });
  }

  // Validation Utilities

  /**
   * Validate trading pair symbol format
   */
  validateTradingPairSymbol(symbol: string): boolean {
    const symbolRegex = /^[A-Z0-9]+-[A-Z0-9]+$/;
    return symbolRegex.test(symbol);
  }

  /**
   * Format decimal value for API
   */
  formatDecimal(value: number, precision: number = 8): string {
    return value.toFixed(precision);
  }

  /**
   * Parse decimal string to number
   */
  parseDecimal(value: string): number {
    return parseFloat(value);
  }
}

// Export a default instance for convenience
export const cexAdminClient = new CexEngineAdminClient();

// Export everything for custom usage
export default CexEngineAdminClient;