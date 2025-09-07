import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import CryptoJS from 'crypto-js'
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
  RebateDownloadRequest
} from '@/types/kucoin'

class KuCoinBrokerAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api-broker.kucoin.com',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private generateSignature(timestamp: string, method: string, endpoint: string, body: string, secret: string): string {
    const str = timestamp + method.toUpperCase() + endpoint + body
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(str, secret))
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config) => {
        const apiKey = localStorage.getItem('kucoin_api_key')
        const apiSecret = localStorage.getItem('kucoin_api_secret')
        const passphrase = localStorage.getItem('kucoin_api_passphrase')

        if (apiKey && apiSecret && passphrase) {
          const timestamp = Date.now().toString()
          const method = (config.method || 'get').toUpperCase()
          const endpoint = config.url || ''
          
          // Handle query parameters for GET requests
          let fullEndpoint = endpoint
          if (config.params && Object.keys(config.params).length > 0) {
            const searchParams = new URLSearchParams(config.params)
            fullEndpoint = `${endpoint}?${searchParams.toString()}`
          }
          
          const body = config.data ? JSON.stringify(config.data) : ''
          const signature = this.generateSignature(timestamp, method, fullEndpoint, body, apiSecret)
          
          // Encrypt the passphrase with the secret
          const encryptedPassphrase = CryptoJS.enc.Base64.stringify(
            CryptoJS.HmacSHA256(passphrase, apiSecret)
          )

          config.headers['KC-API-KEY'] = apiKey
          config.headers['KC-API-SIGN'] = signature
          config.headers['KC-API-TIMESTAMP'] = timestamp
          config.headers['KC-API-PASSPHRASE'] = encryptedPassphrase
          config.headers['KC-API-KEY-VERSION'] = '2'
        }

        return config
      },
      (error) => Promise.reject(error)
    )

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          console.error('Authentication failed. Please check your API credentials.')
        }
        return Promise.reject(error)
      }
    )
  }

  async getBrokerInfo(params: GetBrokerInfoRequest): Promise<BrokerInfo> {
    const response = await this.client.get<ApiResponse<BrokerInfo>>('/api/v1/broker/nd/info', {
      params
    })
    return response.data.data
  }

  async createSubAccount(data: CreateSubAccountRequest): Promise<SubAccount> {
    const response = await this.client.post<ApiResponse<SubAccount>>('/api/v1/broker/nd/account', data)
    return response.data.data
  }

  async getSubAccounts(params?: GetSubAccountsRequest): Promise<PaginatedResponse<SubAccount>> {
    const response = await this.client.get<ApiResponse<PaginatedResponse<SubAccount>>>(
      '/api/v1/broker/nd/account',
      { params }
    )
    return response.data.data
  }

  async createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyInfo> {
    const response = await this.client.post<ApiResponse<ApiKeyInfo>>(
      '/api/v1/broker/nd/account/apikey',
      data
    )
    return response.data.data
  }

  async getApiKeys(params: GetApiKeysRequest): Promise<ApiKeyInfo[]> {
    const response = await this.client.get<ApiResponse<ApiKeyInfo[]>>(
      '/api/v1/broker/nd/account/apikey',
      { params }
    )
    return response.data.data
  }

  async modifyApiKey(data: ModifyApiKeyRequest): Promise<ApiKeyInfo> {
    const response = await this.client.post<ApiResponse<ApiKeyInfo>>(
      '/api/v1/broker/nd/account/update-apikey',
      data
    )
    return response.data.data
  }

  async deleteApiKey(uid: string, apiKey: string): Promise<boolean> {
    const response = await this.client.delete<ApiResponse<boolean>>(
      '/api/v1/broker/nd/account/apikey',
      {
        params: { uid, apiKey }
      }
    )
    return response.data.data
  }

  async transfer(data: TransferRequest): Promise<TransferResponse> {
    const response = await this.client.post<ApiResponse<TransferResponse>>(
      '/api/v1/broker/nd/transfer',
      data
    )
    return response.data.data
  }

  async getTransferHistory(params: GetTransferHistoryRequest): Promise<TransferDetail> {
    const response = await this.client.get<ApiResponse<TransferDetail>>(
      '/api/v3/broker/nd/transfer/detail',
      { params }
    )
    return response.data.data
  }

  async getDepositList(params?: GetDepositListRequest): Promise<DepositRecord[]> {
    const response = await this.client.get<ApiResponse<DepositRecord[]>>(
      '/api/v1/asset/ndbroker/deposit/list',
      { params }
    )
    return response.data.data
  }

  async getDepositDetail(params: GetDepositDetailRequest): Promise<DepositDetail> {
    const response = await this.client.get<ApiResponse<DepositDetail>>(
      '/api/v3/broker/nd/deposit/detail',
      { params }
    )
    return response.data.data
  }

  async getWithdrawDetail(params: GetWithdrawDetailRequest): Promise<WithdrawalDetail> {
    const response = await this.client.get<ApiResponse<WithdrawalDetail>>(
      '/api/v3/broker/nd/withdraw/detail',
      { params }
    )
    return response.data.data
  }

  async downloadBrokerRebate(params: RebateDownloadRequest): Promise<string> {
    const response = await this.client.get<ApiResponse<string>>(
      '/api/v1/broker/nd/rebate/download',
      { params }
    )
    return response.data.data
  }
}

export const kucoinApi = new KuCoinBrokerAPI()
export default kucoinApi