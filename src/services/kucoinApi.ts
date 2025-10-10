import axios, { type AxiosInstance } from 'axios'
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
} from '@/types/kucoin'

class KuCoinBrokerAPI {
  private client: AxiosInstance
  private baseURL: string

  constructor() {
    // Use the backend API URL instead of KuCoin API directly
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1/kucoin`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response.data, // Return just the data
      (error) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please log in again.')
          // Optionally redirect to login page
          window.location.href = '/login'
        }
        throw new Error(error.response?.data?.message || error.message || 'API request failed')
      }
    )
  }

  // Check if broker credentials are properly configured (now checks backend)
  async isBrokerConfigured(): Promise<boolean> {
    try {
      const credentials = await this.getBrokerCredentials()
      return credentials.isConfigured
    } catch {
      return false
    }
  }

  async getBrokerCredentials() {
    const response = await this.client.get('/broker/credentials')
    return response
  }

  async getBrokerInfo(params: GetBrokerInfoRequest): Promise<BrokerInfo> {
    const response = await this.client.get('/broker/info', { params })
    return response
  }

  async createSubAccount(data: CreateSubAccountRequest): Promise<SubAccount> {
    const response = await this.client.post('/sub-accounts', data)
    return response
  }

  async getSubAccounts(params?: GetSubAccountsRequest): Promise<PaginatedResponse<SubAccount>> {
    const response = await this.client.get('/sub-accounts', { params })
    return response
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyInfo> {
    const response = await this.client.post('/api-keys', data)
    return response
  }

  async getApiKeys(params: GetApiKeysRequest): Promise<ApiKeyInfo[]> {
    const response = await this.client.get('/api-keys', { params })
    return response
  }

  async modifyApiKey(data: ModifyApiKeyRequest): Promise<ApiKeyInfo> {
    const response = await this.client.post('/api-keys/modify', data)
    return response
  }

  async deleteApiKey(uid: string, apiKey: string): Promise<boolean> {
    const response = await this.client.delete('/api-keys', {
      params: { uid, apiKey }
    })
    return response
  }

  async transfer(data: TransferRequest): Promise<TransferResponse> {
    const response = await this.client.post('/transfer', data)
    return response
  }

  async getTransferHistory(params: GetTransferHistoryRequest): Promise<TransferDetail> {
    const response = await this.client.get('/transfer/history', { params })
    return response
  }

  async getDepositList(params?: GetDepositListRequest): Promise<DepositRecord[]> {
    const response = await this.client.get('/deposits', { params })
    return response
  }

  async getDepositDetail(params: GetDepositDetailRequest): Promise<DepositDetail> {
    const response = await this.client.get('/deposits/detail', { params })
    return response
  }

  async getWithdrawDetail(params: GetWithdrawDetailRequest): Promise<WithdrawalDetail> {
    const response = await this.client.get('/withdrawals/detail', { params })
    return response
  }

  async downloadBrokerRebate(params: RebateDownloadRequest): Promise<string> {
    const response = await this.client.get('/rebate/download', { params })
    return response
  }

  async createTradingPair(data: CreateTradingPairRequest): Promise<TradingPair> {
    const response = await this.client.post('/trading-pairs', data)
    return response
  }

  // Legacy method for backward compatibility - now just returns the configured status
  refreshCredentials() {
    // This method is no longer needed since credentials are handled by the backend
    // Keeping it for backward compatibility in case any components still call it
    console.warn('refreshCredentials() is deprecated. Credentials are now managed by the backend.')
  }
}

export const kucoinApi = new KuCoinBrokerAPI()
export default kucoinApi