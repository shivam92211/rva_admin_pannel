import { create } from 'zustand'
import { depositApi, type Deposit, type GetDepositsParams } from '@/services/depositApi'

interface DepositStore {
  deposits: Deposit[]
  selectedDeposit: Deposit | null
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

  // Actions
  fetchDeposits: (params?: GetDepositsParams) => Promise<void>
  fetchDepositDetail: (id: string) => Promise<void>
  clearError: () => void
  clearSelectedDeposit: () => void
}

export const useDepositStore = create<DepositStore>((set) => ({
  deposits: [],
  selectedDeposit: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchDeposits: async (params?: GetDepositsParams) => {
    set({ isLoading: true, error: null })

    try {
      const response = await depositApi.getDeposits(params)
      set({
        deposits: response.deposits,
        pagination: response.pagination,
        isLoading: false,
        error: null
      })
    } catch (error) {
      console.error('Failed to fetch deposits:', error)
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch deposits'
      })
    }
  },

  fetchDepositDetail: async (id: string) => {
    set({ isLoading: true, error: null })

    try {
      const deposit = await depositApi.getDepositById(id)
      set({
        selectedDeposit: deposit,
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

  clearError: () => set({ error: null }),

  clearSelectedDeposit: () => set({ selectedDeposit: null })
}))
