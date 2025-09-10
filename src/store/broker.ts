import { create } from 'zustand'
import type { BrokerInfo } from '@/types/kucoin'
import { kucoinApi } from '@/services/kucoinApi'
import { DummyDataService } from '@/services/dummyData'

interface BrokerState {
  brokerInfo: BrokerInfo | null
  loading: boolean
  error: string | null
  isLoading: boolean
  hasError: boolean
  isDemoMode: boolean
  fetchBrokerInfo: (begin: string, end: string, tradeType: 1 | 2) => Promise<void>
  clearError: () => void
}

export const useBrokerStore = create<BrokerState>((set, get) => ({
  brokerInfo: null,
  loading: false,
  error: null,
  get isLoading() {
    return get().loading
  },
  get hasError() {
    return get().error !== null
  },
  get isDemoMode() {
    return DummyDataService.isDemoMode()
  },

  fetchBrokerInfo: async (begin: string, end: string, tradeType: 1 | 2) => {
    set({ loading: true, error: null })
    
    try {
      const isDemoMode = DummyDataService.isDemoMode()
      let brokerInfo: BrokerInfo
      
      if (isDemoMode) {
        brokerInfo = await DummyDataService.getBrokerInfo({ begin, end, tradeType })
      } else {
        brokerInfo = await kucoinApi.getBrokerInfo({ begin, end, tradeType })
      }
      
      set({ brokerInfo, loading: false })
    } catch (err: any) {
      const isDemoMode = DummyDataService.isDemoMode()
      if (!isDemoMode) {
        set({
          error: err.message || 'Failed to fetch broker information',
          loading: false
        })
        console.error('Error fetching broker info:', err)
      } else {
        set({ loading: false })
      }
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))