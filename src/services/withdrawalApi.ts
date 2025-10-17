import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

export interface Withdrawal {
  id: string;
  userId: string;
  beneficiaryId: string | null;
  amount: string;
  fee: string;
  totalAmount: string;
  toAddress: string;
  memo: string | null;
  status: string;
  txHash: string | null;
  emailVerified: boolean;
  google2FAVerified: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  beneficiary?: {
    id: string;
    name: string;
    address: string;
    memo: string | null;
    chain: string;
    currency: string;
  } | null;
}

export interface KucoinWithdrawalHistory {
  id: string;
  userId: string;
  currency: string;
  chain: string;
  status: string;
  address: string;
  memo: string | null;
  isInner: boolean;
  amount: string;
  fee: string;
  walletTxId: string | null;
  createdAt: string;
  updatedAt: string;
  remark: string | null;
  withdrawalId: string | null;
  internalWithdrawalId: string | null;
  syncedAt: string;
  lastScanTimestamp: string | number | null;
  user?: {
    id: string;
    email: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
}

export interface PaginatedWithdrawalsResponse {
  withdrawals: Withdrawal[];
  pagination: {
    currentPage: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface PaginatedKucoinWithdrawalHistoryResponse {
  withdrawals: KucoinWithdrawalHistory[];
  pagination: {
    currentPage: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GetWithdrawalsParams {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
}

class WithdrawalAPI {
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
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  async getWithdrawals(params?: GetWithdrawalsParams): Promise<PaginatedWithdrawalsResponse> {
    const response = await this.client.get('/api/v1/withdrawals', {
      params
    });
    return response.data;
  }

  async getWithdrawalById(id: string): Promise<Withdrawal> {
    const response = await this.client.get<Withdrawal>(`/api/v1/withdrawals/${id}`);
    return response.data;
  }

  async getKucoinWithdrawalHistory(params?: GetWithdrawalsParams): Promise<PaginatedKucoinWithdrawalHistoryResponse> {
    const response = await this.client.get('/api/v1/withdrawals/history', {
      params
    });
    return response.data;
  }

  async getKucoinWithdrawalHistoryById(id: string): Promise<KucoinWithdrawalHistory> {
    const response = await this.client.get<KucoinWithdrawalHistory>(`/api/v1/withdrawals/history/${id}`);
    return response.data;
  }

  async triggerWithdrawalForId(id: string): Promise<{ message: string; }> {
    const response = await this.client.post<{ message: string; }>(`/api/v1/withdrawals/${id}/process`);
    return response.data;
  }
}

export const withdrawalApi = new WithdrawalAPI();
export default withdrawalApi;
