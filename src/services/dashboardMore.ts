import axios, { type AxiosInstance } from 'axios';
import { AuthService } from './auth';

// ==================== INTERFACES ==================== //

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Basic Dashboard Stats
export interface DashboardStats {
  totalUsers: number;
  totalKycSubmissions: number;
  pendingKyc: number;
  totalDeposits: number;
  totalDepositAmount: string;
  totalWithdrawals: number;
  totalWithdrawalAmount: string;
  ordersPlaced: number;
  ordersPlacedValue: string;
  ordersExecuted: number;
  ordersExecutedValue: string;
}

export interface ActivityChartData {
  date: string;
  users: number;
  deposits: number;
  withdrawals: number;
  spotOrdersPlaced: number;
  spotOrdersExecuted: number;
}

// Financial Analytics Interfaces
export interface PlatformRevenueData {
  date: string;
  tradingFees: number;
  withdrawalFees: number;
  totalRevenue: number;
}

export interface AssetUnderManagementData {
  date: string;
  totalUsdValue: number;
  userCount: number;
  avgPerUser: number;
}

export interface DepositWithdrawalFlowData {
  date: string;
  deposits: number;
  withdrawals: number;
  netFlow: number;
  depositVolume: number;
  withdrawalVolume: number;
}

export interface TopTradingPairData {
  symbol: string;
  volume: number;
  trades: number;
  avgTradeSize: number;
  percentageOfTotal: number;
}

export interface RevenueSummary {
  tradingRevenue: number;
  withdrawalRevenue: number;
  totalRevenue: number;
  period: string;
}

// User Behavior Interfaces
export interface UserGrowthFunnelData {
  stage: string;
  count: number;
  percentage: number;
  conversionRate?: number;
}

export interface UserRetentionData {
  date: string;
  dailyActive: number;
  weeklyActive: number;
  monthlyActive: number;
}

export interface LoginHeatmapData {
  hour: number;
  day: number;
  count: number;
  intensity: number;
}

export interface GeographicDistributionData {
  country: string;
  userCount: number;
  percentage: number;
  activeUsers: number;
}

export interface UserEngagementData {
  date: string;
  newUsers: number;
  returningUsers: number;
  totalLogins: number;
  avgSessionDuration?: number;
}

export interface UserBehaviorSummary {
  totalUsers: number;
  activeUsers: number;
  recentActiveUsers: number;
  newUsersLast30Days: number;
  userRetentionRate: number;
}

// KYC Compliance Interfaces
export interface KycPipelineData {
  status: string;
  count: number;
  percentage: number;
  avgProcessingTime?: number;
}

export interface KycApprovalRateData {
  date: string;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
  approvalRate: number;
  rejectionRate: number;
}

export interface KycRiskDashboardData {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  count: number;
  percentage: number;
  reasons: { reason: string; count: number; }[];
}

export interface KycProcessingTimelineData {
  submissionDate: string;
  avgProcessingHours: number;
  submissionCount: number;
  slaCompliance: number;
}

export interface KycRejectionReasonsData {
  reason: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface KycComplianceSummary {
  totalSubmissions: number;
  approvedSubmissions: number;
  pendingSubmissions: number;
  rejectedSubmissions: number;
  approvalRate: number;
  rejectionRate: number;
  avgProcessingHours: number;
}

// Trading Analytics Interfaces
export interface OrderExecutionRateData {
  date: string;
  totalOrders: number;
  executedOrders: number;
  executionRate: number;
  avgExecutionTime?: number;
}

export interface TradingVolumeHeatmapData {
  hour: number;
  day: number;
  volume: number;
  trades: number;
  intensity: number;
}

export interface FailedTransactionData {
  date: string;
  failedOrders: number;
  totalOrders: number;
  failureRate: number;
  topFailureReasons: { reason: string; count: number; }[];
}

export interface OrderTypeDistributionData {
  orderType: string;
  count: number;
  percentage: number;
  avgValue: number;
}

export interface TradingPairPerformanceData {
  symbol: string;
  volume24h: number;
  trades24h: number;
  priceChange?: number;
  avgSpread?: number;
  marketShare: number;
}

export interface OrderBookHealthData {
  totalTradingPairs: number;
  healthyPairs: number;
  healthScore: number;
  avgSpread: number;
  liquidityLevel: string;
}

export interface TradingAnalyticsSummary {
  totalOrders24h: number;
  executedOrders24h: number;
  failedOrders24h: number;
  totalVolume24h: number;
  executionRate: number;
  failureRate: number;
}

// Security Risk Interfaces
export interface SuspiciousActivityData {
  date: string;
  suspiciousLogins: number;
  largeTradingActivity: number;
  unusualWithdrawals: number;
  totalFlags: number;
  riskScore: number;
}

export interface WithdrawalRiskData {
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  count: number;
  totalAmount: number;
  percentage: number;
  factors: string[];
}

export interface FailedLoginData {
  date: string;
  failedAttempts: number;
  uniqueIPs: number;
  blockedIPs: number;
  topTargetedEmails: { email: string; attempts: number; }[];
}

export interface AccountStatusData {
  status: string;
  count: number;
  percentage: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface SecurityAlertsData {
  alertType: string;
  count: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  lastOccurrence: Date;
  resolved: number;
  pending: number;
}

export interface SecurityRiskSummary {
  frozenAccounts: number;
  unverifiedUsers: number;
  largeWithdrawals24h: number;
  pendingWithdrawals: number;
  overallRiskScore: number;
  riskLevel: string;
}

// System Performance Interfaces
export interface ApiResponseTimeData {
  endpoint: string;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  requestCount: number;
  errorRate: number;
}

export interface NotificationDeliveryData {
  channel: 'email' | 'sms' | 'push' | 'inapp';
  sent: number;
  delivered: number;
  failed: number;
  deliveryRate: number;
  avgDeliveryTime?: number;
}

export interface AdminActivityData {
  date: string;
  adminId: string;
  adminName: string;
  actionsCount: number;
  topActions: { action: string; count: number; }[];
}

export interface SystemHealthData {
  metric: string;
  value: number;
  status: 'Good' | 'Warning' | 'Critical';
  threshold: number;
  unit: string;
}

export interface DatabasePerformanceData {
  date: string;
  avgQueryTime: number;
  slowQueries: number;
  connectionCount: number;
  errorRate: number;
}

export interface SystemPerformanceSummary {
  uptimePercentage: number;
  avgResponseTime: number;
  errorRate: number;
  notificationDeliveryRate: number;
  activeAdmins: number;
  systemStatus: string;
}

// Asset Portfolio Interfaces
export interface TopAssetsData {
  currency: string;
  totalHoldings: number;
  userCount: number;
  avgHoldingPerUser: number;
  percentageOfTotal: number;
  priceChange24h?: number;
}

export interface PortfolioDiversityData {
  diversityScore: number;
  userCount: number;
  diversityLevel: 'Low' | 'Medium' | 'High';
  topConcentrations: { currency: string; percentage: number; }[];
}

export interface AssetHoldingTrendsData {
  date: string;
  totalUsdWorth: number;
  userCount: number;
  avgPortfolioSize: number;
  topAssets: { currency: string; value: number; }[];
}

export interface WhaleActivityData {
  date: string;
  whaleCount: number;
  whaleVolume: number;
  whalePercentage: number;
  largestHolding: number;
  topMovements: { userId: string; currency: string; amount: number; type: 'deposit' | 'withdrawal'; }[];
}

export interface AssetDistributionData {
  currency: string;
  holdingRanges: {
    range: string;
    userCount: number;
    totalValue: number;
  }[];
}

export interface PortfolioPerformanceSummary {
  totalPortfolios: number;
  totalValue: number;
  avgPortfolioSize: number;
  whaleCount: number;
  diversityScore: number;
}

// ==================== ADMIN DASHBOARD API SERVICE ==================== //

class AdminDashboardAPI {
  private client: AxiosInstance;

  private getToken = () => {
    const authService = AuthService.getInstance();
    return authService.getToken();
  };

  constructor() {
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL ||
      (typeof window !== 'undefined' ? `${window.location.origin}/api/v1/dashboard` : '/api/v1/dashboard');

    this.client = axios.create({
      baseURL: baseURL,
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Add request interceptor to include fresh token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, handle logout
          localStorage.removeItem('adminToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/admin/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== BASIC DASHBOARD DATA ==================== //

  /**
   * Get basic dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await this.client.get<DashboardStats>('/stats');
    return response.data;
  }

  /**
   * Get activity chart data (7-day activity)
   */
  async getActivityChartData(): Promise<ActivityChartData[]> {
    const response = await this.client.get<ActivityChartData[]>('/activity');
    return response.data;
  }

  // ==================== FINANCIAL ANALYTICS ==================== //

  /**
   * Get platform revenue chart data
   */
  async getPlatformRevenueChart(days: number = 30): Promise<PlatformRevenueData[]> {
    const response = await this.client.get<PlatformRevenueData[]>('/financial/revenue-chart', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get assets under management chart data
   */
  async getAssetsUnderManagementChart(days: number = 30): Promise<AssetUnderManagementData[]> {
    const response = await this.client.get<AssetUnderManagementData[]>('/financial/aum-chart', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get deposit vs withdrawal flow data
   */
  async getDepositWithdrawalFlowChart(days: number = 30): Promise<DepositWithdrawalFlowData[]> {
    const response = await this.client.get<DepositWithdrawalFlowData[]>('/financial/deposit-withdrawal-flow', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get top trading pairs performance data
   */
  async getTopTradingPairsChart(days: number = 7, limit: number = 10): Promise<TopTradingPairData[]> {
    const response = await this.client.get<TopTradingPairData[]>('/financial/top-trading-pairs', {
      params: { days, limit }
    });
    return response.data;
  }

  /**
   * Get revenue summary
   */
  async getRevenueSummary(): Promise<RevenueSummary> {
    const response = await this.client.get<RevenueSummary>('/financial/revenue-summary');
    return response.data;
  }

  // ==================== USER BEHAVIOR ANALYTICS ==================== //

  /**
   * Get user growth funnel data
   */
  async getUserGrowthFunnel(): Promise<UserGrowthFunnelData[]> {
    const response = await this.client.get<UserGrowthFunnelData[]>('/user-behavior/growth-funnel');
    return response.data;
  }

  /**
   * Get user retention chart data
   */
  async getUserRetentionChart(days: number = 30): Promise<UserRetentionData[]> {
    const response = await this.client.get<UserRetentionData[]>('/user-behavior/retention-chart', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get login heatmap data
   */
  async getLoginHeatmapData(days: number = 30): Promise<LoginHeatmapData[]> {
    const response = await this.client.get<LoginHeatmapData[]>('/user-behavior/login-heatmap', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get geographic distribution data
   */
  async getGeographicDistribution(): Promise<GeographicDistributionData[]> {
    const response = await this.client.get<GeographicDistributionData[]>('/user-behavior/geographic-distribution');
    return response.data;
  }

  /**
   * Get user engagement chart data
   */
  async getUserEngagementChart(days: number = 30): Promise<UserEngagementData[]> {
    const response = await this.client.get<UserEngagementData[]>('/user-behavior/engagement-chart', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get user behavior summary
   */
  async getUserBehaviorSummary(): Promise<UserBehaviorSummary> {
    const response = await this.client.get<UserBehaviorSummary>('/user-behavior/summary');
    return response.data;
  }

  // ==================== KYC COMPLIANCE ==================== //

  /**
   * Get KYC pipeline data
   */
  async getKycPipelineData(): Promise<KycPipelineData[]> {
    const response = await this.client.get<KycPipelineData[]>('/kyc/pipeline-data');
    return response.data;
  }

  /**
   * Get KYC approval rate chart data
   */
  async getKycApprovalRateChart(days: number = 30): Promise<KycApprovalRateData[]> {
    const response = await this.client.get<KycApprovalRateData[]>('/kyc/approval-rate-chart', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get KYC risk dashboard data
   */
  async getKycRiskDashboard(): Promise<KycRiskDashboardData[]> {
    const response = await this.client.get<KycRiskDashboardData[]>('/kyc/risk-dashboard');
    return response.data;
  }

  /**
   * Get KYC processing timeline data
   */
  async getKycProcessingTimeline(days: number = 30): Promise<KycProcessingTimelineData[]> {
    const response = await this.client.get<KycProcessingTimelineData[]>('/kyc/processing-timeline', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get KYC rejection reasons data
   */
  async getKycRejectionReasons(days: number = 30): Promise<KycRejectionReasonsData[]> {
    const response = await this.client.get<KycRejectionReasonsData[]>('/kyc/rejection-reasons', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get KYC compliance summary
   */
  async getKycComplianceSummary(): Promise<KycComplianceSummary> {
    const response = await this.client.get<KycComplianceSummary>('/kyc/compliance-summary');
    return response.data;
  }

  // ==================== TRADING ANALYTICS ==================== //

  /**
   * Get order execution rate chart data
   */
  async getOrderExecutionRateChart(days: number = 30): Promise<OrderExecutionRateData[]> {
    const response = await this.client.get<OrderExecutionRateData[]>('/trading/execution-rate-chart', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get trading volume heatmap data
   */
  async getTradingVolumeHeatmap(days: number = 30): Promise<TradingVolumeHeatmapData[]> {
    const response = await this.client.get<TradingVolumeHeatmapData[]>('/trading/volume-heatmap', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get failed transaction chart data
   */
  async getFailedTransactionChart(days: number = 30): Promise<FailedTransactionData[]> {
    const response = await this.client.get<FailedTransactionData[]>('/trading/failed-transactions', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get order type distribution data
   */
  async getOrderTypeDistribution(days: number = 30): Promise<OrderTypeDistributionData[]> {
    const response = await this.client.get<OrderTypeDistributionData[]>('/trading/order-type-distribution', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get trading pair performance data
   */
  async getTradingPairPerformance(limit: number = 15): Promise<TradingPairPerformanceData[]> {
    const response = await this.client.get<TradingPairPerformanceData[]>('/trading/pair-performance', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get order book health data
   */
  async getOrderBookHealth(): Promise<OrderBookHealthData> {
    const response = await this.client.get<OrderBookHealthData>('/trading/orderbook-health');
    return response.data;
  }

  /**
   * Get trading analytics summary
   */
  async getTradingAnalyticsSummary(): Promise<TradingAnalyticsSummary> {
    const response = await this.client.get<TradingAnalyticsSummary>('/trading/analytics-summary');
    return response.data;
  }

  // ==================== SECURITY & RISK MANAGEMENT ==================== //

  /**
   * Get suspicious activity chart data
   */
  async getSuspiciousActivityChart(days: number = 30): Promise<SuspiciousActivityData[]> {
    const response = await this.client.get<SuspiciousActivityData[]>('/security/suspicious-activity', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get withdrawal risk assessment data
   */
  async getWithdrawalRiskAssessment(days: number = 30): Promise<WithdrawalRiskData[]> {
    const response = await this.client.get<WithdrawalRiskData[]>('/security/withdrawal-risk', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get failed login chart data
   */
  async getFailedLoginChart(days: number = 30): Promise<FailedLoginData[]> {
    const response = await this.client.get<FailedLoginData[]>('/security/failed-logins', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get account status distribution data
   */
  async getAccountStatusDistribution(days: number = 30): Promise<AccountStatusData[]> {
    const response = await this.client.get<AccountStatusData[]>('/security/account-status', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get security alerts data
   */
  async getSecurityAlerts(): Promise<SecurityAlertsData[]> {
    const response = await this.client.get<SecurityAlertsData[]>('/security/alerts');
    return response.data;
  }

  /**
   * Get security risk summary
   */
  async getSecurityRiskSummary(): Promise<SecurityRiskSummary> {
    const response = await this.client.get<SecurityRiskSummary>('/security/risk-summary');
    return response.data;
  }

  // ==================== SYSTEM PERFORMANCE ==================== //

  /**
   * Get API response time metrics
   */
  async getApiResponseTimeMetrics(): Promise<ApiResponseTimeData[]> {
    const response = await this.client.get<ApiResponseTimeData[]>('/system/api-response-times');
    return response.data;
  }

  /**
   * Get notification delivery stats
   */
  async getNotificationDeliveryStats(days: number = 7): Promise<NotificationDeliveryData[]> {
    const response = await this.client.get<NotificationDeliveryData[]>('/system/notification-delivery', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get admin activity chart data
   */
  async getAdminActivityChart(days: number = 7): Promise<AdminActivityData[]> {
    const response = await this.client.get<AdminActivityData[]>('/system/admin-activity', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get system health metrics
   */
  async getSystemHealthMetrics(): Promise<SystemHealthData[]> {
    const response = await this.client.get<SystemHealthData[]>('/system/health-metrics');
    return response.data;
  }

  /**
   * Get database performance chart data
   */
  async getDatabasePerformanceChart(days: number = 7): Promise<DatabasePerformanceData[]> {
    const response = await this.client.get<DatabasePerformanceData[]>('/system/database-performance', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get system performance summary
   */
  async getSystemPerformanceSummary(): Promise<SystemPerformanceSummary> {
    const response = await this.client.get<SystemPerformanceSummary>('/system/performance-summary');
    return response.data;
  }

  // ==================== ASSET & PORTFOLIO ANALYTICS ==================== //

  /**
   * Get top assets by holdings data
   */
  async getTopAssetsByHoldings(limit: number = 15): Promise<TopAssetsData[]> {
    const response = await this.client.get<TopAssetsData[]>('/assets/top-assets', {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Get portfolio diversity analysis data
   */
  async getPortfolioDiversityAnalysis(): Promise<PortfolioDiversityData[]> {
    const response = await this.client.get<PortfolioDiversityData[]>('/assets/portfolio-diversity');
    return response.data;
  }

  /**
   * Get asset holding trends data
   */
  async getAssetHoldingTrends(days: number = 30): Promise<AssetHoldingTrendsData[]> {
    const response = await this.client.get<AssetHoldingTrendsData[]>('/assets/holding-trends', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get whale activity chart data
   */
  async getWhaleActivityChart(days: number = 30): Promise<WhaleActivityData[]> {
    const response = await this.client.get<WhaleActivityData[]>('/assets/whale-activity', {
      params: { days }
    });
    return response.data;
  }

  /**
   * Get asset distribution analysis data
   */
  async getAssetDistributionAnalysis(): Promise<AssetDistributionData[]> {
    const response = await this.client.get<AssetDistributionData[]>('/assets/distribution-analysis');
    return response.data;
  }

  /**
   * Get portfolio performance summary
   */
  async getPortfolioPerformanceSummary(): Promise<PortfolioPerformanceSummary> {
    const response = await this.client.get<PortfolioPerformanceSummary>('/assets/portfolio-summary');
    return response.data;
  }

  // ==================== UTILITY METHODS ==================== //

  /**
   * Check if dashboard service is healthy
   */
  async isServiceHealthy(): Promise<boolean> {
    try {
      await this.getDashboardStats();
      return true;
    } catch (error) {
      console.error('Dashboard service health check failed:', error);
      return false;
    }
  }

  /**
   * Get comprehensive dashboard overview
   */
  async getDashboardOverview(): Promise<{
    basicStats: DashboardStats;
    revenueSummary: RevenueSummary;
    userBehaviorSummary: UserBehaviorSummary;
    kycSummary: KycComplianceSummary;
    tradingSummary: TradingAnalyticsSummary;
    securitySummary: SecurityRiskSummary;
    systemSummary: SystemPerformanceSummary;
    portfolioSummary: PortfolioPerformanceSummary;
  }> {
    const [
      basicStats,
      revenueSummary,
      userBehaviorSummary,
      kycSummary,
      tradingSummary,
      securitySummary,
      systemSummary,
      portfolioSummary,
    ] = await Promise.all([
      this.getDashboardStats(),
      this.getRevenueSummary(),
      this.getUserBehaviorSummary(),
      this.getKycComplianceSummary(),
      this.getTradingAnalyticsSummary(),
      this.getSecurityRiskSummary(),
      this.getSystemPerformanceSummary(),
      this.getPortfolioPerformanceSummary(),
    ]);

    return {
      basicStats,
      revenueSummary,
      userBehaviorSummary,
      kycSummary,
      tradingSummary,
      securitySummary,
      systemSummary,
      portfolioSummary,
    };
  }

  /**
   * Refresh all chart data for a comprehensive dashboard update
   */
  async refreshAllChartData(days: number = 30): Promise<{
    financialCharts: {
      revenue: PlatformRevenueData[];
      aum: AssetUnderManagementData[];
      depositWithdrawal: DepositWithdrawalFlowData[];
      topTradingPairs: TopTradingPairData[];
    };
    userBehaviorCharts: {
      funnel: UserGrowthFunnelData[];
      retention: UserRetentionData[];
      heatmap: LoginHeatmapData[];
      geographic: GeographicDistributionData[];
      engagement: UserEngagementData[];
    };
    kycCharts: {
      pipeline: KycPipelineData[];
      approvalRate: KycApprovalRateData[];
      riskDashboard: KycRiskDashboardData[];
      timeline: KycProcessingTimelineData[];
      rejectionReasons: KycRejectionReasonsData[];
    };
    tradingCharts: {
      executionRate: OrderExecutionRateData[];
      volumeHeatmap: TradingVolumeHeatmapData[];
      failedTransactions: FailedTransactionData[];
      orderTypes: OrderTypeDistributionData[];
      pairPerformance: TradingPairPerformanceData[];
    };
    securityCharts: {
      suspiciousActivity: SuspiciousActivityData[];
      withdrawalRisk: WithdrawalRiskData[];
      failedLogins: FailedLoginData[];
      accountStatus: AccountStatusData[];
      alerts: SecurityAlertsData[];
    };
    systemCharts: {
      apiResponseTimes: ApiResponseTimeData[];
      notificationDelivery: NotificationDeliveryData[];
      adminActivity: AdminActivityData[];
      healthMetrics: SystemHealthData[];
      databasePerformance: DatabasePerformanceData[];
    };
    assetCharts: {
      topAssets: TopAssetsData[];
      diversity: PortfolioDiversityData[];
      holdingTrends: AssetHoldingTrendsData[];
      whaleActivity: WhaleActivityData[];
      distribution: AssetDistributionData[];
    };
  }> {
    const [
      // Financial charts
      revenue,
      aum,
      depositWithdrawal,
      topTradingPairs,
      // User behavior charts
      funnel,
      retention,
      heatmap,
      geographic,
      engagement,
      // KYC charts
      pipeline,
      approvalRate,
      riskDashboard,
      timeline,
      rejectionReasons,
      // Trading charts
      executionRate,
      volumeHeatmap,
      failedTransactions,
      orderTypes,
      pairPerformance,
      // Security charts
      suspiciousActivity,
      withdrawalRisk,
      failedLogins,
      accountStatus,
      alerts,
      // System charts
      apiResponseTimes,
      notificationDelivery,
      adminActivity,
      healthMetrics,
      databasePerformance,
      // Asset charts
      topAssets,
      diversity,
      holdingTrends,
      whaleActivity,
      distribution,
    ] = await Promise.all([
      // Financial
      this.getPlatformRevenueChart(days),
      this.getAssetsUnderManagementChart(days),
      this.getDepositWithdrawalFlowChart(days),
      this.getTopTradingPairsChart(7, 10),
      // User behavior
      this.getUserGrowthFunnel(),
      this.getUserRetentionChart(days),
      this.getLoginHeatmapData(days),
      this.getGeographicDistribution(),
      this.getUserEngagementChart(days),
      // KYC
      this.getKycPipelineData(),
      this.getKycApprovalRateChart(days),
      this.getKycRiskDashboard(),
      this.getKycProcessingTimeline(days),
      this.getKycRejectionReasons(days),
      // Trading
      this.getOrderExecutionRateChart(days),
      this.getTradingVolumeHeatmap(days),
      this.getFailedTransactionChart(days),
      this.getOrderTypeDistribution(days),
      this.getTradingPairPerformance(15),
      // Security
      this.getSuspiciousActivityChart(days),
      this.getWithdrawalRiskAssessment(days),
      this.getFailedLoginChart(days),
      this.getAccountStatusDistribution(days),
      this.getSecurityAlerts(),
      // System
      this.getApiResponseTimeMetrics(),
      this.getNotificationDeliveryStats(7),
      this.getAdminActivityChart(7),
      this.getSystemHealthMetrics(),
      this.getDatabasePerformanceChart(7),
      // Assets
      this.getTopAssetsByHoldings(15),
      this.getPortfolioDiversityAnalysis(),
      this.getAssetHoldingTrends(days),
      this.getWhaleActivityChart(days),
      this.getAssetDistributionAnalysis(),
    ]);

    return {
      financialCharts: {
        revenue,
        aum,
        depositWithdrawal,
        topTradingPairs,
      },
      userBehaviorCharts: {
        funnel,
        retention,
        heatmap,
        geographic,
        engagement,
      },
      kycCharts: {
        pipeline,
        approvalRate,
        riskDashboard,
        timeline,
        rejectionReasons,
      },
      tradingCharts: {
        executionRate,
        volumeHeatmap,
        failedTransactions,
        orderTypes,
        pairPerformance,
      },
      securityCharts: {
        suspiciousActivity,
        withdrawalRisk,
        failedLogins,
        accountStatus,
        alerts,
      },
      systemCharts: {
        apiResponseTimes,
        notificationDelivery,
        adminActivity,
        healthMetrics,
        databasePerformance,
      },
      assetCharts: {
        topAssets,
        diversity,
        holdingTrends,
        whaleActivity,
        distribution,
      },
    };
  }
}

// ==================== SINGLETON EXPORT ==================== //

export const adminDashboardApi = new AdminDashboardAPI();
export default adminDashboardApi;

// ==================== REACT HOOKS (OPTIONAL) ==================== //

/**
 * Hook for using the admin dashboard API
 */
export const useAdminDashboardApi = () => {
  return adminDashboardApi;
};

/**
 * Hook for dashboard stats with built-in state management
 */
export const useDashboardStats = () => {
  return {
    api: adminDashboardApi,
    // Add React state management here if needed
  };
};