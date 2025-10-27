import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileCheck, ArrowUpRight, ArrowDownLeft, ShoppingCart, CheckCircle } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { dashboardApi, type DashboardStats, type ChartData } from '@/services/dashboardApi';
import RefreshButton from '@/components/common/RefreshButton';
import { useSnackbarMsg } from '@/hooks/snackbar';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DashboardView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityData, setActivityData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load all data in parallel
      const [dashboardStats, activityChartData] = await Promise.all([
        dashboardApi.getDashboardStats(),
        dashboardApi.getActivityChartData()
      ]);

      setStats(dashboardStats);
      setActivityData(activityChartData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
      title: 'Deposits',
      value: stats.totalDeposits.toLocaleString(),
      icon: ArrowDownLeft,
      description: 'Successful deposits',
      color: 'text-green-600',
      subValue: `Total: ${parseFloat(stats.totalDepositAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ETH`
    },
    {
      title: 'Withdrawals',
      value: stats.totalWithdrawals.toLocaleString(),
      icon: ArrowUpRight,
      description: 'Completed withdrawals',
      color: 'text-red-600',
      subValue: `Total: ${parseFloat(stats.totalWithdrawalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ETH`
    },
    {
      title: 'Orders Placed (24h)',
      value: stats.ordersPlaced.toLocaleString(),
      icon: ShoppingCart,
      description: 'Spot orders placed',
      color: 'text-blue-600',
      subValue: `Value: ${parseFloat(stats.ordersPlacedValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`
    },
    {
      title: 'Orders Executed (24h)',
      value: stats.ordersExecuted.toLocaleString(),
      icon: CheckCircle,
      description: 'Orders completed',
      color: 'text-purple-600',
      subValue: `Value: ${parseFloat(stats.ordersExecutedValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETH`
    }
  ] : [];

  // Chart configurations
  const activityChartConfig = {
    data: {
      labels: activityData?.map?.(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'New Users',
          data: activityData?.map?.(d => d.users),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Deposits',
          data: activityData?.map?.(d => d.deposits),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(34, 197, 94)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
        },
        {
          label: 'Withdrawals',
          data: activityData?.map?.(d => d.withdrawals),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(239, 68, 68)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Daily Activity Trends',
          font: {
            size: 16,
            weight: 'bold' as const,
          },
          padding: 20,
        },
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: function (context: any) {
              return `Date: ${context[0].label}`;
            },
            label: function (context: any) {
              const value = context.parsed.y;
              const datasetLabel = context.dataset.label;
              return `${datasetLabel}: ${value.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
            font: {
              size: 14,
              weight: 'bold' as const,
            },
            padding: 10,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            font: {
              size: 11,
            },
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count',
            font: {
              size: 14,
              weight: 'bold' as const,
            },
            padding: 10,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            font: {
              size: 11,
            },
            callback: function (value: any) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  };

  const spotOrdersChartConfig = {
    data: {
      labels: activityData?.map?.(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [
        {
          label: 'Orders Placed',
          data: activityData?.map?.(d => d.spotOrdersPlaced),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.3)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Orders Executed',
          data: activityData?.map?.(d => d.spotOrdersExecuted),
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.3)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgb(147, 51, 234)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          fill: true,
          tension: 0.4,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: 'Spot Orders Performance',
          font: {
            size: 16,
            weight: 'bold' as const,
          },
          padding: 20,
        },
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: function (context: any) {
              return `Date: ${context[0].label}`;
            },
            label: function (context: any) {
              const value = context.parsed.y;
              const datasetLabel = context.dataset.label;
              return `${datasetLabel}: ${value.toLocaleString()}`;
            },
            footer: function (context: any) {
              if (context.length >= 2) {
                const placed = context.find((c: any) => c.dataset.label === 'Orders Placed')?.parsed?.y || 0;
                const executed = context.find((c: any) => c.dataset.label === 'Orders Executed')?.parsed?.y || 0;
                const executionRate = placed > 0 ? ((executed / placed) * 100).toFixed(1) : '0.0';
                return `Execution Rate: ${executionRate}%`;
              }
              return '';
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Date',
            font: {
              size: 14,
              weight: 'bold' as const,
            },
            padding: 10,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            font: {
              size: 11,
            },
          },
        },
        y: {
          display: true,
          beginAtZero: true,
          stacked: false,
          title: {
            display: true,
            text: 'Number of Orders',
            font: {
              size: 14,
              weight: 'bold' as const,
            },
            padding: 10,
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
          },
          ticks: {
            font: {
              size: 11,
            },
            callback: function (value: any) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  };


  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Dashboard"
        description="Overview of your RVA platform statistics"
      >
        <div className="flex gap-2">
          <RefreshButton onClick={() => {
            loadDashboardData().then(() => {
              setSnackbarMsg({
                msg: 'Dashboard data refreshed successfully',
                type: 'success'
              });
            }).catch(() => {
              setSnackbarMsg({
                msg: 'Failed to refresh dashboard data',
                type: 'error'
              });
            });
          }} />
        </div>
      </PageHeader>
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">

          {/* Statistics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card, index) => {
              const IconComponent = card.icon;
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
              );
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
                ) : activityData?.length > 0 ? (
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
                <CardTitle>Spot Orders Overview</CardTitle>
                <CardDescription>Orders placed vs executed (Last 7 days)</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-64 bg-muted animate-pulse rounded" />
                ) : activityData?.length > 0 ? (
                  <div className="h-64">
                    <Line {...spotOrdersChartConfig} />
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No spot order data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;