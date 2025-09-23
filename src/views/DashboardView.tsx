import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileCheck, Building2, ArrowUpDown, ArrowUpRight, ArrowDownLeft, Coins, TrendingUp, AlertCircle } from 'lucide-react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { dashboardApi, type DashboardStats, type ChartData, type RevenueData } from '@/services/dashboardApi'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const DashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activityData, setActivityData] = useState<ChartData[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)

      // Load all data in parallel
      const [dashboardStats, activityChartData, revenueChartData] = await Promise.all([
        dashboardApi.getDashboardStats(),
        dashboardApi.getActivityChartData(),
        dashboardApi.getRevenueChartData()
      ])

      setStats(dashboardStats)
      setActivityData(activityChartData)
      setRevenueData(revenueChartData)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      description: 'Registered users'
    },
    {
      title: 'KYC Submissions',
      value: stats.totalKycSubmissions.toLocaleString(),
      icon: FileCheck,
      description: 'Total submissions',
      subValue: `${stats.pendingKyc} pending`
    },
    {
      title: 'Sub Accounts',
      value: stats.totalSubAccounts.toLocaleString(),
      icon: Building2,
      description: 'Total sub accounts',
      subValue: `${stats.activeSubAccounts} active, ${stats.lockedSubAccounts} locked`
    },
    {
      title: 'Deposits',
      value: stats.totalDeposits.toLocaleString(),
      icon: ArrowDownLeft,
      description: 'Successful deposits',
      color: 'text-green-600'
    },
    {
      title: 'Withdrawals',
      value: stats.totalWithdrawals.toLocaleString(),
      icon: ArrowUpRight,
      description: 'Completed withdrawals',
      color: 'text-red-600'
    },
    {
      title: 'Total Rebates',
      value: `$${stats.totalRebates}`,
      icon: Coins,
      description: 'Total rebates earned',
      color: 'text-blue-600'
    },
    {
      title: "Today's Commission",
      value: `$${stats.todayCommission}`,
      icon: TrendingUp,
      description: 'Commission earned today',
      color: 'text-purple-600',
      subValue: `Yesterday: $${stats.yesterdayCommission}`
    }
  ] : []

  // Chart configurations
  const activityChartConfig = {
    data: {
      labels: activityData.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'New Users',
          data: activityData.map(d => d.users),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Deposits',
          data: activityData.map(d => d.deposits),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Withdrawals',
          data: activityData.map(d => d.withdrawals),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  }

  const revenueChartConfig = {
    data: {
      labels: revenueData.map(d => d.month),
      datasets: [
        {
          label: 'Commissions',
          data: revenueData.map(d => d.commissions),
          backgroundColor: 'rgba(147, 51, 234, 0.8)',
        },
        {
          label: 'Rebates',
          data: revenueData.map(d => d.rebates),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Overview of your RVA platform statistics"
      />
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">

        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const IconComponent = card.icon
            return (
              <Card key={index} className="">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  <IconComponent className={`h-4 w-4 ${card.color || 'text-muted-foreground'}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="h-7 bg-muted animate-pulse rounded" />
                    ) : (
                      card.value
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                  {card.subValue && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.subValue}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Recent platform activity (Last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : activityData.length > 0 ? (
                <div className="h-64">
                  <Line {...activityChartConfig} />
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No activity data available
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Commission and rebate trends (Last 6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : revenueData.length > 0 ? (
                <div className="h-64">
                  <Bar {...revenueChartConfig} />
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No revenue data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardView