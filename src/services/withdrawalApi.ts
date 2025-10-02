import axios, { type AxiosInstance } from 'axios'

export interface Withdrawal {
  id: string
  userId: string
  beneficiaryId: string | null
  amount: string
  fee: string
  totalAmount: string
  toAddress: string
  memo: string | null
  status: string
  txHash: string | null
  emailVerified: boolean
  google2FAVerified: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    username: string
    firstName: string | null
    lastName: string | null
  }
  beneficiary?: {
    id: string
    name: string
    address: string
    memo: string | null
    chain: string
    currency: string
  } | null
}

export interface KucoinWithdrawalHistory {
  id: string
  userId: string
  currency: string
  chain: string
  status: string
  address: string
  memo: string | null
  isInner: boolean
  amount: string
  fee: string
  walletTxId: string | null
  createdAt: string | number
  updatedAt: string | number
  remark: string | null
  withdrawalId: string | null
  internalWithdrawalId: string | null
  syncedAt: string
  lastScanTimestamp: string | number | null
  user?: {
    id: string
    email: string
    username: string
    firstName: string | null
    lastName: string | null
  }
}

export interface PaginatedWithdrawalsResponse {
  withdrawals: Withdrawal[]
  pagination: {
    currentPage: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface PaginatedKucoinWithdrawalHistoryResponse {
  withdrawals: KucoinWithdrawalHistory[]
  pagination: {
    currentPage: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface GetWithdrawalsParams {
  page?: number
  limit?: number
  status?: string
  userId?: string
}

class WithdrawalAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async getWithdrawals(params?: GetWithdrawalsParams): Promise<PaginatedWithdrawalsResponse> {
    const response = await this.client.get('/withdrawals', {
      params
    })
    return response.data
  }

  async getWithdrawalById(id: string): Promise<Withdrawal> {
    const response = await this.client.get<Withdrawal>(`/withdrawals/${id}`)
    return response.data
  }

  async getKucoinWithdrawalHistory(params?: GetWithdrawalsParams): Promise<PaginatedKucoinWithdrawalHistoryResponse> {
    const response = await this.client.get('/withdrawals/history', {
      params
    })
    return response.data
  }

  async getKucoinWithdrawalHistoryById(id: string): Promise<KucoinWithdrawalHistory> {
    const response = await this.client.get<KucoinWithdrawalHistory>(`/withdrawals/history/${id}`)
    return response.data
  }
}

export const withdrawalApi = new WithdrawalAPI()
export default withdrawalApi
