import axios, { type AxiosInstance } from 'axios';
import type {
  ApiResponse,
  BrokerInfo,
  SubAccount,
  PaginatedResponse,
  ApiKeyInfo,
  CreateSubAccountRequest,
  CreateApiKeyRequest,
  ModifyApiKeyRequest,
  TransferRequest,
  TransferResponse,
  TransferDetail,
  DepositRecord,
  DepositDetail,
  WithdrawalDetail,
  GetBrokerInfoRequest,
  GetSubAccountsRequest,
  GetApiKeysRequest,
  GetDepositListRequest,
  GetDepositDetailRequest,
  GetWithdrawDetailRequest,
  GetTransferHistoryRequest,
  RebateDownloadRequest,
  CreateTradingPairRequest,
  TradingPair
} from '@/types/kucoin';
import { AuthService } from './auth';

class KuCoinBrokerAPI {
  private client: AxiosInstance;
  private baseURL: string;

  private getToken = () => {
    const authService = AuthService.getInstance();
    return authService.getToken();
  };

  constructor() {
    // Use the backend API URL instead of KuCoin API directly
    this.baseURL = import.meta.env.VITE_API_BASE_URL!;

    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1/kucoin`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`
      },
      withCredentials: true
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data, // Return just the data
      (error) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please log in again.');
          // Optionally redirect to login page
          window.location.href = '/login';
        }
        throw new Error(error.response?.data?.message || error.message || 'API request failed');
      }
    );
  }

  // Check if broker credentials are properly configured (now checks backend)
  async isBrokerConfigured(): Promise<boolean> {
    try {
      const credentials = await this.getBrokerCredentials();
      return credentials.isConfigured;
    } catch {
      return false;
    }
  }

  async getBrokerCredentials() {
    const response = await this.client.get<any>('/broker/credentials');
    return response.data;
  }

  async getBrokerInfo(params: GetBrokerInfoRequest): Promise<BrokerInfo> {
    const response = await this.client.get<any>('/broker/info', { params });
    return response.data;
  }

  async createSubAccount(data: CreateSubAccountRequest): Promise<SubAccount> {
    const response = await this.client.post<any>('/sub-accounts', data);
    return response.data;
  }

  async getSubAccounts(params?: GetSubAccountsRequest): Promise<PaginatedResponse<SubAccount>> {
    const response = await this.client.get<any>('/sub-accounts', { params });
    return response.data;
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyInfo> {
    const response = await this.client.post<any>('/api-keys', data);
    return response.data;
  }

  async getApiKeys(params: GetApiKeysRequest): Promise<ApiKeyInfo[]> {
    const response = await this.client.get<any>('/api-keys', { params });
    return response.data;
  }

  async modifyApiKey(data: ModifyApiKeyRequest): Promise<ApiKeyInfo> {
    const response = await this.client.post<any>('/api-keys/modify', data);
    return response.data;
  }

  async deleteApiKey(uid: string, apiKey: string): Promise<boolean> {
    const response = await this.client.delete<any>('/api-keys', {
      params: { uid, apiKey }
    });
    return response.data;
  }

  async transfer(data: TransferRequest): Promise<TransferResponse> {
    const response = await this.client.post<any>('/transfer', data);
    return response.data;
  }

  async getTransferHistory(params: GetTransferHistoryRequest): Promise<TransferDetail> {
    const response = await this.client.get<any>('/transfer/history', { params });
    return response.data;
  }

  async getDepositList(params?: GetDepositListRequest): Promise<DepositRecord[]> {
    const response = await this.client.get<any>('/deposits', { params });
    return response.data;
  }

  async getDepositDetail(params: GetDepositDetailRequest): Promise<DepositDetail> {
    const response = await this.client.get<any>('/deposits/detail', { params });
    return response.data;
  }

  async getWithdrawDetail(params: GetWithdrawDetailRequest): Promise<WithdrawalDetail> {
    const response = await this.client.get<any>('/withdrawals/detail', { params });
    return response.data;
  }

  async downloadBrokerRebate(params: RebateDownloadRequest): Promise<string> {
    const response = await this.client.get<any>('/rebate/download', { params });
    return response.data;
  }

  async createTradingPair(data: CreateTradingPairRequest): Promise<TradingPair> {
    const response = await this.client.post<any>('/trading-pairs', data);
    return response.data;
  }

  // Legacy method for backward compatibility - now just returns the configured status
  refreshCredentials() {
    // This method is no longer needed since credentials are handled by the backend
    // Keeping it for backward compatibility in case any components still call it
    console.warn('refreshCredentials() is deprecated. Credentials are now managed by the backend.');
  }
}

export const kucoinApi = new KuCoinBrokerAPI();
export default kucoinApi;