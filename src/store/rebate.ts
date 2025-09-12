import { create } from 'zustand'
import { kucoinApi } from '@/services/kucoinApi'
import type { RebateRecord, RebateDownloadRequest, SubAccount } from '@/types/kucoin'

interface RebateStore {
  rebates: RebateRecord[]
  subAccounts: SubAccount[]
  isLoading: boolean
  isDownloading: boolean
  error: string | null
  downloadUrl: string | null
  
  // Actions
  fetchRebates: (params?: RebateDownloadRequest) => Promise<void>
  downloadRebateReport: (params: RebateDownloadRequest) => Promise<void>
  fetchSubAccounts: () => Promise<void>
  loadDummyData: () => void
  clearError: () => void
  clearDownloadUrl: () => void
}

// Dummy data for fallback
const dummyRebates: RebateRecord[] = [
  {
    date: '2024-12-01',
    brokerUid: 'broker_main',
    affiliateUid: '',
    uid: '226383154',
    bizLine: 'Spot',
    volume: '50000.00',
    totalCommission: '15.00',
    brokerCommission: '7.50',
    userCommission: '6.00',
    affiliateCommission: '1.50',
    createdAt: Date.now() - 86400000 // 1 day ago
  },
  {
    date: '2024-12-01',
    brokerUid: 'broker_main',
    affiliateUid: 'affiliate_001',
    uid: '226383155',
    bizLine: 'Futures',
    volume: '125000.00',
    totalCommission: '62.50',
    brokerCommission: '31.25',
    userCommission: '25.00',
    affiliateCommission: '6.25',
    createdAt: Date.now() - 86400000
  },
  {
    date: '2024-11-30',
    brokerUid: 'broker_main',
    affiliateUid: '',
    uid: '226383156',
    bizLine: 'Spot',
    volume: '75000.00',
    totalCommission: '22.50',
    brokerCommission: '11.25',
    userCommission: '9.00',
    affiliateCommission: '2.25',
    createdAt: Date.now() - 172800000 // 2 days ago
  },
  {
    date: '2024-11-30',
    brokerUid: 'broker_main',
    affiliateUid: 'affiliate_002',
    uid: '226383154',
    bizLine: 'Futures',
    volume: '200000.00',
    totalCommission: '100.00',
    brokerCommission: '50.00',
    userCommission: '40.00',
    affiliateCommission: '10.00',
    createdAt: Date.now() - 172800000
  },
  {
    date: '2024-11-29',
    brokerUid: 'broker_main',
    affiliateUid: '',
    uid: '226383155',
    bizLine: 'Spot',
    volume: '35000.00',
    totalCommission: '10.50',
    brokerCommission: '5.25',
    userCommission: '4.20',
    affiliateCommission: '1.05',
    createdAt: Date.now() - 259200000 // 3 days ago
  },
  {
    date: '2024-11-29',
    brokerUid: 'broker_main',
    affiliateUid: 'affiliate_001',
    uid: '226383156',
    bizLine: 'Futures',
    volume: '180000.00',
    totalCommission: '90.00',
    brokerCommission: '45.00',
    userCommission: '36.00',
    affiliateCommission: '9.00',
    createdAt: Date.now() - 259200000
  },
  {
    date: '2024-11-28',
    brokerUid: 'broker_main',
    affiliateUid: '',
    uid: '226383154',
    bizLine: 'Spot',
    volume: '95000.00',
    totalCommission: '28.50',
    brokerCommission: '14.25',
    userCommission: '11.40',
    affiliateCommission: '2.85',
    createdAt: Date.now() - 345600000 // 4 days ago
  },
  {
    date: '2024-11-27',
    brokerUid: 'broker_main',
    affiliateUid: 'affiliate_003',
    uid: '226383155',
    bizLine: 'Futures',
    volume: '300000.00',
    totalCommission: '150.00',
    brokerCommission: '75.00',
    userCommission: '60.00',
    affiliateCommission: '15.00',
    createdAt: Date.now() - 432000000 // 5 days ago
  }
]

const dummySubAccounts: SubAccount[] = [
  {
    accountName: 'Trading Bot 1',
    uid: '226383154',
    createdAt: Date.now() - 86400000,
    level: 1
  },
  {
    accountName: 'Market Maker',
    uid: '226383155',
    createdAt: Date.now() - 172800000,
    level: 1
  },
  {
    accountName: 'Arbitrage Account',
    uid: '226383156',
    createdAt: Date.now() - 259200000,
    level: 1
  }
]

export const useRebateStore = create<RebateStore>((set, get) => ({
  rebates: !kucoinApi.isBrokerConfigured() ? dummyRebates : [],
  subAccounts: !kucoinApi.isBrokerConfigured() ? dummySubAccounts : [],
  isLoading: false,
  isDownloading: false,
  error: !kucoinApi.isBrokerConfigured() ? 'Using demo data - API connection failed' : null,
  downloadUrl: null,

  fetchRebates: async () => {
    set({ isLoading: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Use dummy data when API not configured
        set({ 
          rebates: dummyRebates,
          isLoading: false,
          error: 'Using demo data - API connection failed'
        })
        return
      }

      // Note: The API returns a download URL, not direct rebate data
      // In a real implementation, we would need to fetch and parse the CSV/file
      // For now, we'll use dummy data with a note about API behavior
      set({ 
        rebates: dummyRebates,
        isLoading: false,
        error: 'API returns download URL - using demo data for display'
      })
      
    } catch (error) {
      console.error('Failed to fetch rebates:', error)
      
      // Fallback to dummy data on error
      set({ 
        rebates: dummyRebates,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  downloadRebateReport: async (params: RebateDownloadRequest) => {
    set({ isDownloading: true, error: null, downloadUrl: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Generate dummy CSV content for download
        const csvHeaders = ['Date', 'BrokerUID', 'AffiliateUID', 'UID', 'BizLine', 'Volume', 'TotalCommission', 'BrokerCommission', 'UserCommission', 'AffiliateCommission']
        const csvRows = dummyRebates
          .filter(rebate => {
            const rebateDate = rebate.date.replace(/-/g, '')
            return rebateDate >= params.begin && rebateDate <= params.end
          })
          .filter(rebate => {
            return (params.tradeType === 1 && rebate.bizLine === 'Spot') ||
                   (params.tradeType === 2 && rebate.bizLine === 'Futures')
          })
          .map(rebate => [
            rebate.date,
            rebate.brokerUid,
            rebate.affiliateUid,
            rebate.uid,
            rebate.bizLine,
            rebate.volume,
            rebate.totalCommission,
            rebate.brokerCommission,
            rebate.userCommission,
            rebate.affiliateCommission
          ])

        const csvContent = [
          csvHeaders.join(','),
          ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        
        set({ 
          downloadUrl: url,
          isDownloading: false,
          error: null
        })
        return
      }

      const downloadUrl = await kucoinApi.downloadBrokerRebate(params)
      set({ 
        downloadUrl,
        isDownloading: false,
        error: null
      })
      
    } catch (error) {
      console.error('Failed to download rebate report:', error)
      set({ 
        isDownloading: false,
        error: error instanceof Error ? error.message : 'Failed to download rebate report'
      })
    }
  },

  fetchSubAccounts: async () => {
    const currentState = get()
    set({ isLoading: true })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Use dummy data when API not configured
        set({ 
          subAccounts: dummySubAccounts,
          rebates: currentState.rebates.length === 0 ? dummyRebates : currentState.rebates,
          isLoading: false,
          error: 'Using demo data - API connection failed'
        })
        return
      }

      const result = await kucoinApi.getSubAccounts({ pageSize: 100 })
      set({ 
        subAccounts: result.items,
        isLoading: false,
        error: null
      })
      
    } catch (error) {
      console.error('Failed to fetch sub accounts:', error)
      
      // Fallback to dummy data on error
      const currentState = get()
      set({ 
        subAccounts: dummySubAccounts,
        rebates: currentState.rebates.length === 0 ? dummyRebates : currentState.rebates,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  loadDummyData: () => {
    set({ 
      rebates: dummyRebates,
      subAccounts: dummySubAccounts,
      error: 'Using demo data - API connection failed'
    })
  },

  clearError: () => set({ error: null }),
  
  clearDownloadUrl: () => {
    const { downloadUrl } = get()
    if (downloadUrl && downloadUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(downloadUrl)
    }
    set({ downloadUrl: null })
  }
}))