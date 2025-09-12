import { create } from 'zustand'
import { kucoinApi } from '@/services/kucoinApi'
import type { DepositRecord, DepositDetail, SubAccount, GetDepositListRequest } from '@/types/kucoin'

interface DepositStore {
  deposits: DepositRecord[]
  subAccounts: SubAccount[]
  selectedDeposit: DepositDetail | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchDeposits: (params?: GetDepositListRequest) => Promise<void>
  fetchDepositDetail: (currency: string, hash: string) => Promise<void>
  fetchSubAccounts: () => Promise<void>
  loadDummyData: () => void
  clearError: () => void
  clearSelectedDeposit: () => void
}

// Dummy data for fallback
const dummyDeposits: DepositRecord[] = [
  {
    uid: '226383154',
    hash: '0x8f9e2c1a5b4d3f6e8c7a9b2d4e6f8a1c3e5d7f9b2a4c6e8d0f2a4c6e8d0f2a4c',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    amount: '1000.00',
    currency: 'USDT',
    status: 'SUCCESS',
    chain: 'TRC20',
    createdAt: Date.now() - 300000, // 5 minutes ago
    updatedAt: Date.now() - 240000
  },
  {
    uid: '226383155',
    hash: '0x7e8d1c2a5b4d3f6e8c7a9b2d4e6f8a1c3e5d7f9b2a4c6e8d0f2a4c6e8d0f2a4c',
    address: '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
    amount: '0.05',
    currency: 'BTC',
    status: 'PROCESSING',
    chain: 'BTC',
    createdAt: Date.now() - 900000, // 15 minutes ago
    updatedAt: Date.now() - 900000
  },
  {
    uid: '226383156',
    hash: '0x6d7c0b1a4a3d2f5e7c6a8b1d3e5f7a0c2e4d6f8b1a3c5e7d9f1a3c5e7d9f1a3c',
    address: '0x742d35Cc6634C0532925a3b8D902b2534D7c232c',
    amount: '5.5',
    currency: 'ETH',
    status: 'SUCCESS',
    chain: 'ERC20',
    createdAt: Date.now() - 1800000, // 30 minutes ago
    updatedAt: Date.now() - 1680000
  },
  {
    uid: '226383154',
    hash: '0x5c6b9a0a3a2d1f4e6c5a7b0d2e4f6a9c1e3d5f7b0a2c4e6d8f0a2c4e6d8f0a2c',
    address: 'bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64k',
    amount: '25.0',
    currency: 'BNB',
    status: 'SUCCESS',
    chain: 'BEP20',
    createdAt: Date.now() - 3600000, // 1 hour ago
    updatedAt: Date.now() - 3540000
  },
  {
    uid: '226383155',
    hash: '0x4b5a8909292c0f3e5c4a6b9c1d3e4f5a8c0e2d4f6b9a1c3e5d7f9a1c3e5d7f9a1c',
    address: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3n0d3vllmyqwsx5wktcd8cc3sq835lu7drv2xwl2wywfgse35a3x',
    amount: '1250.0',
    currency: 'ADA',
    status: 'FAILURE',
    chain: 'ADA',
    createdAt: Date.now() - 5400000, // 1.5 hours ago
    updatedAt: Date.now() - 5340000
  },
  {
    uid: '226383156',
    hash: '0x3a4979080802c8295b8b78c5b276f3b2c1e2d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    address: '15irhkwLFXme2U3zTMCrSLGCj4oDPcF8Sf',
    amount: '75.25',
    currency: 'DOT',
    status: 'SUCCESS',
    chain: 'DOT',
    createdAt: Date.now() - 7200000, // 2 hours ago
    updatedAt: Date.now() - 7140000
  },
  {
    uid: '226383154',
    hash: '0x2939087808c4285b7b67b4b275e2b1c0d1e2d3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
    amount: '150.0',
    currency: 'LINK',
    status: 'SUCCESS',
    chain: 'ERC20',
    createdAt: Date.now() - 86400000, // 1 day ago
    updatedAt: Date.now() - 86340000
  },
  {
    uid: '226383155',
    hash: '0x1829074808a3174b6b56a3a164d1a0b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b',
    address: '1Lbcfr7sAHTD9CgdQo3HTMTkV8LK4ZnX71',
    amount: '8.75',
    currency: 'UNI',
    status: 'SUCCESS',
    chain: 'ERC20',
    createdAt: Date.now() - 172800000, // 2 days ago
    updatedAt: Date.now() - 172740000
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

export const useDepositStore = create<DepositStore>((set, get) => ({
  deposits: !kucoinApi.isBrokerConfigured() ? dummyDeposits : [],
  subAccounts: !kucoinApi.isBrokerConfigured() ? dummySubAccounts : [],
  selectedDeposit: null,
  isLoading: false,
  error: !kucoinApi.isBrokerConfigured() ? 'Using demo data - API connection failed' : null,

  fetchDeposits: async (params?: GetDepositListRequest) => {
    set({ isLoading: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Use dummy data when API not configured
        set({ 
          deposits: dummyDeposits,
          isLoading: false,
          error: 'Using demo data - API connection failed'
        })
        return
      }

      const deposits = await kucoinApi.getDepositList(params)
      set({ 
        deposits,
        isLoading: false,
        error: null
      })
      
    } catch (error) {
      console.error('Failed to fetch deposits:', error)
      
      // Fallback to dummy data on error
      set({ 
        deposits: dummyDeposits,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  fetchDepositDetail: async (currency: string, hash: string) => {
    set({ isLoading: true, error: null })
    
    try {
      if (!kucoinApi.isBrokerConfigured()) {
        // Create dummy detail from the deposit record
        const deposit = dummyDeposits.find(d => d.hash === hash && d.currency === currency)
        if (deposit) {
          const dummyDetail: DepositDetail = {
            chain: deposit.chain,
            hash: deposit.hash,
            walletTxId: `wallet_${hash.slice(-8)}`,
            uid: deposit.uid,
            amount: deposit.amount,
            address: deposit.address,
            status: deposit.status,
            createdAt: deposit.createdAt,
            isInner: false
          }
          set({ 
            selectedDeposit: dummyDetail,
            isLoading: false,
            error: null
          })
        }
        return
      }

      const depositDetail = await kucoinApi.getDepositDetail({ currency, hash })
      set({ 
        selectedDeposit: depositDetail,
        isLoading: false,
        error: null
      })
      
    } catch (error) {
      console.error('Failed to fetch deposit detail:', error)
      set({ 
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch deposit detail'
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
          deposits: currentState.deposits.length === 0 ? dummyDeposits : currentState.deposits,
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
        deposits: currentState.deposits.length === 0 ? dummyDeposits : currentState.deposits,
        isLoading: false,
        error: 'Using demo data - API connection failed'
      })
    }
  },

  loadDummyData: () => {
    set({ 
      deposits: dummyDeposits,
      subAccounts: dummySubAccounts,
      error: 'Using demo data - API connection failed'
    })
  },

  clearError: () => set({ error: null }),
  
  clearSelectedDeposit: () => set({ selectedDeposit: null })
}))