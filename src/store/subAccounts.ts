import { create } from 'zustand'
import type { SubAccount, PaginatedResponse, CreateSubAccountRequest } from '@/types/kucoin'
import { kucoinApi } from '@/services/kucoinApi'

interface SubAccountsState {
  subAccounts: PaginatedResponse<SubAccount> | null
  loading: boolean
  error: string | null
  isLoading: boolean
  hasError: boolean
  totalSubAccounts: number
  fetchSubAccounts: (params?: { uid?: string; currentPage?: number; pageSize?: number }) => Promise<void>
  createSubAccount: (data: CreateSubAccountRequest) => Promise<SubAccount | null>
  clearError: () => void
}

export const useSubAccountsStore = create<SubAccountsState>((set, get) => ({
  subAccounts: null,
  loading: false,
  error: null,
  get isLoading() {
    return get().loading
  },
  get hasError() {
    return get().error !== null
  },
  get totalSubAccounts() {
    return get().subAccounts?.totalNum || 0
  },

  fetchSubAccounts: async (params?: { uid?: string; currentPage?: number; pageSize?: number }) => {
    set({ loading: true, error: null })
    
    try {
      const subAccounts = await kucoinApi.getSubAccounts(params)
      set({ subAccounts, loading: false })
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch sub-accounts',
        loading: false
      })
      console.error('Error fetching sub-accounts:', err)
    }
  },

  createSubAccount: async (data: CreateSubAccountRequest) => {
    set({ loading: true, error: null })
    
    try {
      const newSubAccount = await kucoinApi.createSubAccount(data)
      
      set((state) => {
        if (state.subAccounts) {
          return {
            subAccounts: {
              ...state.subAccounts,
              items: [newSubAccount, ...state.subAccounts.items],
              totalNum: state.subAccounts.totalNum + 1
            },
            loading: false
          }
        }
        return { loading: false }
      })
      
      return newSubAccount
    } catch (err: any) {
      set({
        error: err.message || 'Failed to create sub-account',
        loading: false
      })
      console.error('Error creating sub-account:', err)
      return null
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))