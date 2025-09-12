import { create } from 'zustand'
import { kucoinApi } from '@/services/kucoinApi'
import type { WithdrawalDetail, SubAccount } from '@/types/kucoin'

interface WithdrawalStore {
  withdrawals: WithdrawalDetail[]
  subAccounts: SubAccount[]
  selectedWithdrawal: WithdrawalDetail | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchWithdrawals: () => Promise<void>
  fetchWithdrawalDetail: (withdrawalId: string) => Promise<void>
  fetchSubAccounts: () => Promise<void>
  loadDummyData: () => void
  clearError: () => void
  clearSelectedWithdrawal: () => void
}

// Dummy data for fallback
const dummyWithdrawals: WithdrawalDetail[] = [
  {
    id: 'wd_20241201_001',
    chain: 'TRC20',
    walletTxId: 'wallet_tx_8f9e2c1a5b4d3f6e',
    uid: '226383154',
    amount: '500.00',
    address: 'THPvaUhoh2Qn2PIJ5kMgmNkkB7EU7qgmFG',
    currency: 'USDT',
    status: 'SUCCESS',
    createdAt: Date.now() - 600000, // 10 minutes ago
    updatedAt: Date.now() - 300000  // 5 minutes ago
  },
  {
    id: 'wd_20241201_002',
    chain: 'BTC',
    walletTxId: 'wallet_tx_7e8d1c2a5b4d3f6e',
    uid: '226383155',
    amount: '0.015',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    currency: 'BTC',
    status: 'PROCESSING',
    createdAt: Date.now() - 1200000, // 20 minutes ago
    updatedAt: Date.now() - 900000   // 15 minutes ago
  },
  {
    id: 'wd_20241201_003',
    chain: 'ERC20',
    walletTxId: 'wallet_tx_6d7c0b1a4a3d2f5e',
    uid: '226383156',
    amount: '2.75',
    address: '0x742d35Cc6634C0532925a3b8D902b2534D7c232c',
    currency: 'ETH',
    status: 'SUCCESS',
    createdAt: Date.now() - 1800000, // 30 minutes ago
    updatedAt: Date.now() - 1500000  // 25 minutes ago
  },
  {
    id: 'wd_20241201_004',
    chain: 'BEP20',
    walletTxId: 'wallet_tx_5c6b9a0a3a2d1f4e',
    uid: '226383154',
    amount: '15.0',
    address: '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE',
    currency: 'BNB',
    status: 'FAILURE',
    createdAt: Date.now() - 2700000, // 45 minutes ago
    updatedAt: Date.now() - 2400000  // 40 minutes ago
  },
  {
    id: 'wd_20241201_005',
    chain: 'ADA',
    walletTxId: 'wallet_tx_4b5a8909292c0f3e',
    uid: '226383155',
    amount: '850.0',
    address: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
    currency: 'ADA',
    status: 'SUCCESS',
    createdAt: Date.now() - 3600000, // 1 hour ago
    updatedAt: Date.now() - 3300000  // 55 minutes ago
  },
  {
    id: 'wd_20241201_006',
    chain: 'DOT',
    walletTxId: 'wallet_tx_3a4979080802c829',
    uid: '226383156',
    amount: '45.5',
    address: '15irhkwLFXme2U3zTMCrSLGCj4oDPcF8Sf',
    currency: 'DOT',
    status: 'PROCESSING',
    createdAt: Date.now() - 5400000, // 1.5 hours ago
    updatedAt: Date.now() - 4500000  // 1.25 hours ago
  },
  {
    id: 'wd_20241130_007',
    chain: 'ERC20',
    walletTxId: 'wallet_tx_2939087808c4285b',
    uid: '226383154',
    amount: '75.0',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    currency: 'LINK',
    status: 'SUCCESS',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86100000  // 1 day ago (5 min processing)
  },
  {
    id: 'wd_20241129_008',
    chain: 'ERC20',
    walletTxId: 'wallet_tx_1829074808a3174b',
    uid: '226383155',
    amount: '12.5',
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    currency: 'UNI',
    status: 'FAILURE',
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172500000  // 2 days ago (5 min processing)
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

export const useWithdrawalStore = create<WithdrawalStore>((set, get) => ({
  withdrawals: !kucoinApi.isBrokerConfigured() ? dummyWithdrawals : [],
  subAccounts: !kucoinApi.isBrokerConfigured() ? dummySubAccounts : [],
  selectedWithdrawal: null,
  isLoading: false,
  error: !kucoinApi.isBrokerConfigured() ? 'Using demo data - API connection failed' : null,

  fetchWithdrawals: async () => {
    set({ isLoading: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Use dummy data when API not configured
        set({ 
          withdrawals: dummyWithdrawals,
          isLoading: false,
          error: 'Using demo data - API connection failed'
        })
        return
      }

      // Note: There's no specific withdrawal list API, so we would need to
      // implement a way to get withdrawal IDs first, or extend the API
      // For now, use dummy data as fallback
      set({ 
        withdrawals: dummyWithdrawals,
        isLoading: false,
        error: 'Withdrawal list API not available - using demo data'
      })
      
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      
      // Fallback to dummy data on error
      set({ 
        withdrawals: dummyWithdrawals,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  fetchWithdrawalDetail: async (withdrawalId: string) => {
    set({ isLoading: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Find dummy detail from the withdrawal record
        const withdrawal = dummyWithdrawals.find(w => w.id === withdrawalId)
        if (withdrawal) {
          set({ 
            selectedWithdrawal: withdrawal,
            isLoading: false,
            error: null
          })
        }
        return
      }

      const withdrawalDetail = await kucoinApi.getWithdrawDetail({ withdrawalId })
      set({ 
        selectedWithdrawal: withdrawalDetail,
        isLoading: false,
        error: null
      })
      
    } catch (error) {
      console.error('Failed to fetch withdrawal detail:', error)
      
      // Try to find in dummy data as fallback
      const withdrawal = dummyWithdrawals.find(w => w.id === withdrawalId)
      if (withdrawal) {
        set({ 
          selectedWithdrawal: withdrawal,
          isLoading: false,
          error: 'Using demo data - API connection failed'
        })
      } else {
        set({ 
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch withdrawal detail'
        })
      }
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
          withdrawals: currentState.withdrawals.length === 0 ? dummyWithdrawals : currentState.withdrawals,
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
        withdrawals: currentState.withdrawals.length === 0 ? dummyWithdrawals : currentState.withdrawals,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  loadDummyData: () => {
    set({ 
      withdrawals: dummyWithdrawals,
      subAccounts: dummySubAccounts,
      error: 'Using demo data - API connection failed'
    })
  },

  clearError: () => set({ error: null }),
  
  clearSelectedWithdrawal: () => set({ selectedWithdrawal: null })
}))