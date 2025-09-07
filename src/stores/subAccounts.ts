import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { SubAccount, PaginatedResponse, CreateSubAccountRequest } from '@/types/kucoin'
import { kucoinApi } from '@/services/kucoinApi'

export const useSubAccountsStore = defineStore('subAccounts', () => {
  const subAccounts = ref<PaginatedResponse<SubAccount> | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const totalSubAccounts = computed(() => subAccounts.value?.totalNum || 0)

  async function fetchSubAccounts(params?: { uid?: string; currentPage?: number; pageSize?: number }) {
    loading.value = true
    error.value = null
    
    try {
      subAccounts.value = await kucoinApi.getSubAccounts(params)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch sub-accounts'
      console.error('Error fetching sub-accounts:', err)
    } finally {
      loading.value = false
    }
  }

  async function createSubAccount(data: CreateSubAccountRequest): Promise<SubAccount | null> {
    loading.value = true
    error.value = null
    
    try {
      const newSubAccount = await kucoinApi.createSubAccount(data)
      
      if (subAccounts.value) {
        subAccounts.value.items.unshift(newSubAccount)
        subAccounts.value.totalNum += 1
      }
      
      return newSubAccount
    } catch (err: any) {
      error.value = err.message || 'Failed to create sub-account'
      console.error('Error creating sub-account:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    subAccounts,
    loading,
    error,
    isLoading,
    hasError,
    totalSubAccounts,
    fetchSubAccounts,
    createSubAccount,
    clearError
  }
})