import { create } from 'zustand'
import { kucoinApi } from '@/services/kucoinApi'
import type { TransferRequest, TransferDetail, SubAccount } from '@/types/kucoin'

interface TransferStore {
  transfers: TransferDetail[]
  subAccounts: SubAccount[]
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
  lastTransferOrderId: string | null
  
  // Actions
  submitTransfer: (data: TransferRequest) => Promise<void>
  fetchTransferHistory: (orderId: string) => Promise<void>
  fetchSubAccounts: () => Promise<void>
  loadDummyData: () => void
  clearError: () => void
  clearTransfers: () => void
}

// Dummy data for fallback
const dummyTransfers: TransferDetail[] = [
  {
    orderId: 'txn_20241201_001',
    currency: 'USDT',
    amount: '1000.00',
    fromUid: 'broker_main',
    fromAccountType: 'MAIN',
    toUid: '226383154',
    toAccountType: 'MAIN',
    status: 'SUCCESS',
    createdAt: Date.now() - 300000 // 5 minutes ago
  },
  {
    orderId: 'txn_20241201_002',
    currency: 'BTC',
    amount: '0.025',
    fromUid: '226383154',
    fromAccountType: 'TRADE',
    toUid: 'broker_main',
    toAccountType: 'MAIN',
    status: 'PROCESSING',
    createdAt: Date.now() - 900000 // 15 minutes ago
  },
  {
    orderId: 'txn_20241201_003',
    currency: 'ETH',
    amount: '2.5',
    fromUid: 'broker_main',
    fromAccountType: 'MAIN',
    toUid: '226383155',
    toAccountType: 'TRADE',
    status: 'SUCCESS',
    createdAt: Date.now() - 1800000 // 30 minutes ago
  },
  {
    orderId: 'txn_20241201_004',
    currency: 'USDT',
    amount: '500.00',
    fromUid: '226383156',
    fromAccountType: 'MAIN',
    toUid: 'broker_main',
    toAccountType: 'MAIN',
    status: 'SUCCESS',
    createdAt: Date.now() - 3600000 // 1 hour ago
  },
  {
    orderId: 'txn_20241201_005',
    currency: 'BNB',
    amount: '10.0',
    fromUid: 'broker_main',
    fromAccountType: 'MAIN',
    toUid: '226383154',
    toAccountType: 'TRADE',
    status: 'FAILURE',
    createdAt: Date.now() - 5400000 // 1.5 hours ago
  },
  {
    orderId: 'txn_20241201_006',
    currency: 'ADA',
    amount: '750.0',
    fromUid: '226383155',
    fromAccountType: 'TRADE',
    toUid: 'broker_main',
    toAccountType: 'MAIN',
    status: 'SUCCESS',
    createdAt: Date.now() - 7200000 // 2 hours ago
  },
  {
    orderId: 'txn_20241130_007',
    currency: 'DOT',
    amount: '25.0',
    fromUid: 'broker_main',
    fromAccountType: 'MAIN',
    toUid: '226383156',
    toAccountType: 'TRADE',
    status: 'SUCCESS',
    createdAt: Date.now() - 86400000 // 1 day ago
  },
  {
    orderId: 'txn_20241130_008',
    currency: 'LINK',
    amount: '50.0',
    fromUid: '226383154',
    fromAccountType: 'TRADE',
    toUid: 'broker_main',
    toAccountType: 'MAIN',
    status: 'SUCCESS',
    createdAt: Date.now() - 172800000 // 2 days ago
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

export const useTransferStore = create<TransferStore>((set, get) => ({
  transfers: !kucoinApi.isBrokerConfigured() ? dummyTransfers : [],
  subAccounts: !kucoinApi.isBrokerConfigured() ? dummySubAccounts : [],
  isLoading: false,
  isSubmitting: false,
  error: !kucoinApi.isBrokerConfigured() ? 'Using demo data - API connection failed' : null,
  lastTransferOrderId: null,

  submitTransfer: async (data: TransferRequest) => {
    set({ isSubmitting: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Use dummy success response when API not configured
        const dummyOrderId = `t_${Date.now()}`
        set({ 
          isSubmitting: false, 
          lastTransferOrderId: dummyOrderId,
          error: null
        })
        
        // Add a dummy transfer to the history
        const dummyTransfer: TransferDetail = {
          orderId: dummyOrderId,
          currency: data.currency,
          amount: data.amount,
          fromUid: data.direction === 'OUT' ? 'broker_main' : data.specialUid,
          fromAccountType: data.direction === 'OUT' ? data.accountType : data.specialAccountType,
          toUid: data.direction === 'OUT' ? data.specialUid : 'broker_main',
          toAccountType: data.direction === 'OUT' ? data.specialAccountType : data.accountType,
          status: 'SUCCESS',
          createdAt: Date.now()
        }
        
        set(state => ({
          transfers: [dummyTransfer, ...state.transfers]
        }))
        
        return
      }

      const result = await kucoinApi.transfer(data)
      set({ 
        isSubmitting: false, 
        lastTransferOrderId: result.orderId,
        error: null
      })
      
      // Fetch the transfer details after successful submission
      get().fetchTransferHistory(result.orderId)
      
    } catch (error) {
      console.error('Transfer submission failed:', error)
      set({ 
        isSubmitting: false, 
        error: error instanceof Error ? error.message : 'Transfer failed' 
      })
    }
  },

  fetchTransferHistory: async (orderId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Use dummy data when API not configured
        set({ 
          transfers: dummyTransfers,
          isLoading: false,
          error: null
        })
        return
      }

      const transferDetail = await kucoinApi.getTransferHistory({ orderId })
      
      set(state => ({
        transfers: [transferDetail, ...state.transfers.filter(t => t.orderId !== orderId)],
        isLoading: false,
        error: null
      }))
      
    } catch (error) {
      console.error('Failed to fetch transfer history:', error)
      
      // Fallback to dummy data on error
      set({ 
        transfers: dummyTransfers,
        isLoading: false,
        error: 'Using demo data - API connection failed'
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
          transfers: currentState.transfers.length === 0 ? dummyTransfers : currentState.transfers,
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
        transfers: currentState.transfers.length === 0 ? dummyTransfers : currentState.transfers,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  loadDummyData: () => {
    set({ 
      transfers: dummyTransfers,
      subAccounts: dummySubAccounts,
      error: 'Using demo data - API connection failed'
    })
  },

  clearError: () => set({ error: null }),
  
  clearTransfers: () => set({ transfers: [], lastTransferOrderId: null })
}))