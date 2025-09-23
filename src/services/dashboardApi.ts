import axios, { type AxiosInstance } from 'axios'
import { userApi } from './userApi'
import { kycSubmissionApi } from './kycSubmissionApi'
import { DummyDataService } from './dummyData'

export interface DashboardStats {
  totalUsers: number
  totalKycSubmissions: number
  totalSubAccounts: number
  totalDeposits: number
  totalWithdrawals: number
  totalRebates: string
  todayCommission: string
  yesterdayCommission: string
  pendingKyc: number
  activeSubAccounts: number
  lockedSubAccounts: number
}

export interface ChartData {
  date: string
  users: number
  deposits: number
  withdrawals: number
  commissions: number
}

export interface RevenueData {
  month: string
  commissions: number
  rebates: number
}

class DashboardAPI {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3000',
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Load all data in parallel
      const [usersData, kycData, subAccountsData, depositsData, brokerInfo] = await Promise.all([
        userApi.getUsers({ limit: 1 }).catch(() => ({ users: [], pagination: { totalCount: 0 } })),
        kycSubmissionApi.getKycSubmissions({ limit: 1 }).catch(() => ({ kycSubmissions: [], pagination: { totalCount: 0 } })),
        DummyDataService.getSubAccounts({ pageSize: 50 }),
        DummyDataService.getDepositList(),
        DummyDataService.getBrokerInfo({ beginTime: '', endTime: '', bizType: 1 })
      ])

      // Get pending KYC count
      const pendingKycData = await kycSubmissionApi.getKycSubmissions({
        limit: 1,
        status: 'pending'
      }).catch(() => ({ kycSubmissions: [], pagination: { totalCount: 0 } }))

      // Calculate active and locked sub accounts
      const activeSubAccounts = subAccountsData.items.filter(acc => acc.status === 'normal').length
      const lockedSubAccounts = subAccountsData.items.filter(acc => acc.status === 'locked').length

      return {
        totalUsers: usersData.pagination.totalCount,
        totalKycSubmissions: kycData.pagination.totalCount,
        totalSubAccounts: subAccountsData.totalNum,
        totalDeposits: depositsData.filter(d => d.status === 'SUCCESS').length,
        totalWithdrawals: Math.floor(depositsData.length * 0.7), // Mock calculation
        totalRebates: brokerInfo.totalRebate,
        todayCommission: brokerInfo.todayCommission,
        yesterdayCommission: brokerInfo.yesterdayCommission,
        pendingKyc: pendingKycData.pagination.totalCount,
        activeSubAccounts,
        lockedSubAccounts
      }
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
      throw error
    }
  }

  async getActivityChartData(): Promise<ChartData[]> {
    // Generate mock data for the last 7 days
    const chartData: ChartData[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)

      chartData.push({
        date: date.toISOString().split('T')[0],
        users: Math.floor(Math.random() * 50) + 10,
        deposits: Math.floor(Math.random() * 20) + 5,
        withdrawals: Math.floor(Math.random() * 15) + 2,
        commissions: Math.floor(Math.random() * 500) + 100
      })
    }

    return chartData
  }

  async getRevenueChartData(): Promise<RevenueData[]> {
    // Generate mock data for the last 6 months
    const revenueData: RevenueData[] = []
    const today = new Date()

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthName = months[date.getMonth()]

      revenueData.push({
        month: monthName,
        commissions: Math.floor(Math.random() * 5000) + 2000,
        rebates: Math.floor(Math.random() * 2500) + 1000
      })
    }

    return revenueData
  }

  async getTopPerformingSubAccounts(): Promise<any[]> {
    try {
      const subAccountsData = await DummyDataService.getSubAccounts({ pageSize: 10 })

      // Add mock performance data
      return subAccountsData.items.map(account => ({
        ...account,
        totalVolume: (Math.random() * 100000 + 10000).toFixed(2),
        totalCommission: (Math.random() * 1000 + 100).toFixed(2),
        status: account.status
      })).slice(0, 5) // Top 5
    } catch (error) {
      console.error('Failed to load top performing sub accounts:', error)
      return []
    }
  }
}

export const dashboardApi = new DashboardAPI()
export default dashboardApi