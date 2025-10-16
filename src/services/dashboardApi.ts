import axios, { type AxiosInstance } from 'axios';
import { DummyDataService } from './dummyData';
import { AuthService } from './auth';

export interface DashboardStats {
  totalUsers: number;
  totalKycSubmissions: number;
  totalDeposits: number;
  totalDepositAmount: string;
  totalWithdrawals: number;
  totalWithdrawalAmount: string;
  pendingKyc: number;
  ordersPlaced: number;
  ordersPlacedValue: string;
  ordersExecuted: number;
  ordersExecutedValue: string;
}

export interface ChartData {
  date: string;
  users: number;
  deposits: number;
  withdrawals: number;
  spotOrdersPlaced: number;
  spotOrdersExecuted: number;
}

export interface RevenueData {
  month: string;
  commissions: number;
  rebates: number;
}

class DashboardAPI {
  private client: AxiosInstance;
  private getToken = () => {
    const authService = AuthService.getInstance();
    return authService.getToken();
  };

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.getToken()}`
      }
    });
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.client.get('/api/v1/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      throw error;
    }
  }

  async getActivityChartData(): Promise<ChartData[]> {
    try {
      const response = await this.client.get('/api/v1/dashboard/activity');
      return response.data;
    } catch (error) {
      console.error('Failed to load activity chart data:', error);
      throw error;
    }
  }

  async getRevenueChartData(): Promise<RevenueData[]> {
    // Generate mock data for the last 6 months
    const revenueData: RevenueData[] = [];
    const today = new Date();

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = months[date.getMonth()];

      revenueData.push({
        month: monthName,
        commissions: Math.floor(Math.random() * 5000) + 2000,
        rebates: Math.floor(Math.random() * 2500) + 1000
      });
    }

    return revenueData;
  }

  async getTopPerformingSubAccounts(): Promise<any[]> {
    try {
      const subAccountsData = await DummyDataService.getSubAccounts({ pageSize: 10 });

      // Add mock performance data
      return subAccountsData.items.map(account => ({
        ...account,
        totalVolume: (Math.random() * 100000 + 10000).toFixed(2),
        totalCommission: (Math.random() * 1000 + 100).toFixed(2),
        // @ts-ignore
        status: account.status
      })).slice(0, 5); // Top 5
    } catch (error) {
      console.error('Failed to load top performing sub accounts:', error);
      return [];
    }
  }
}

export const dashboardApi = new DashboardAPI();
export default dashboardApi;