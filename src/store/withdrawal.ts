import { create } from 'zustand'
import { withdrawalApi, type Withdrawal, type KucoinWithdrawalHistory, type GetWithdrawalsParams } from '@/services/withdrawalApi'

interface WithdrawalStore {
  withdrawals: Withdrawal[]
  selectedWithdrawal: Withdrawal | null
  kucoinWithdrawals: KucoinWithdrawalHistory[]
  selectedKucoinWithdrawal: KucoinWithdrawalHistory | null
  isLoading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  kucoinPagination: {
    currentPage: number
    totalPages: number
    totalCount: number
    limit: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null

  // Actions
  fetchWithdrawals: (params?: GetWithdrawalsParams) => Promise<void>
  fetchWithdrawalDetail: (id: string) => Promise<void>
  fetchKucoinWithdrawals: (params?: GetWithdrawalsParams) => Promise<void>
  fetchKucoinWithdrawalDetail: (id: string) => Promise<void>
  clearError: () => void
  clearSelectedWithdrawal: () => void
  clearSelectedKucoinWithdrawal: () => void
}

export const useWithdrawalStore = create<WithdrawalStore>((set) => ({
  withdrawals: [],
  selectedWithdrawal: null,
  kucoinWithdrawals: [],
  selectedKucoinWithdrawal: null,
  isLoading: false,
  error: null,
  pagination: null,
  kucoinPagination: null,

  fetchWithdrawals: async (params?: GetWithdrawalsParams) => {
    set({ isLoading: true, error: null })

    try {
      const response = await withdrawalApi.getWithdrawals(params)
      set({
        withdrawals: response.withdrawals,
        pagination: response.pagination,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch withdrawals'
      })
    }
  },

  fetchWithdrawalDetail: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const withdrawal = await withdrawalApi.getWithdrawalById(id)
      set({
        selectedWithdrawal: withdrawal,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to fetch withdrawal detail:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch withdrawal detail'
      })
    }
  },

  fetchKucoinWithdrawals: async (params?: GetWithdrawalsParams) => {
    set({ isLoading: true, error: null })

    try {
      const response = await withdrawalApi.getKucoinWithdrawalHistory(params)
      set({
        kucoinWithdrawals: response.withdrawals,
        kucoinPagination: response.pagination,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to fetch KuCoin withdrawals:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch KuCoin withdrawals'
      })
    }
  },

  fetchKucoinWithdrawalDetail: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const withdrawal = await withdrawalApi.getKucoinWithdrawalHistoryById(id)
      set({
        selectedKucoinWithdrawal: withdrawal,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to fetch KuCoin withdrawal detail:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch KuCoin withdrawal detail'
      })
    }
  },

  clearError: () => set({ error: null }),

  clearSelectedWithdrawal: () => set({ selectedWithdrawal: null }),

  clearSelectedKucoinWithdrawal: () => set({ selectedKucoinWithdrawal: null })
}))
