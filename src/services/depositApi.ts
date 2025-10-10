import axios, { type AxiosInstance } from 'axios'

export interface DepositAddress {
  address: string
  memo: string | null
  chainName: string
  contractAddress: string | null
  balance: string
  isActive: boolean
}

export interface Deposit {
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
  arrears: boolean
  kucoinDepositId: string | null
  syncedAt: string
  lastScanTimestamp: string | number | null
  user?: {
    id: string
    email: string
    username: string
    firstName: string | null
    lastName: string | null
  }
  depositAddress?: DepositAddress
}

export interface PaginatedDepositsResponse {
  deposits: Deposit[]
  pagination: {
    currentPage: number
    limit: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export interface GetDepositsParams {
  page?: number
  limit?: number
  status?: string
  userId?: string
}

class DepositAPI {
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

  async getDeposits(params?: GetDepositsParams): Promise<PaginatedDepositsResponse> {
    const response = await this.client.get('/api/v1/deposits', {
      params
    })
    return response.data
  }

  async getDepositById(id: string): Promise<Deposit> {
    const response = await this.client.get<Deposit>(`/api/v1/deposits/${id}`)
    return response.data
  }
}

export const depositApi = new DepositAPI()
export default depositApi
