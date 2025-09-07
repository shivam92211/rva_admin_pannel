import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BrokerInfo } from '@/types/kucoin'
import { kucoinApi } from '@/services/kucoinApi'
import { DummyDataService } from '@/services/dummyData'

export const useBrokerStore = defineStore('broker', () => {
  const brokerInfo = ref<BrokerInfo | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const isDemoMode = computed(() => DummyDataService.isDemoMode())

  async function fetchBrokerInfo(begin: string, end: string, tradeType: 1 | 2) {
    loading.value = true
    error.value = null
    
    try {
      if (isDemoMode.value) {
        // Use dummy data when no API keys are configured
        brokerInfo.value = await DummyDataService.getBrokerInfo({ begin, end, tradeType })
      } else {
        // Use real API when credentials are available
        brokerInfo.value = await kucoinApi.getBrokerInfo({ begin, end, tradeType })
      }
    } catch (err: any) {
      if (!isDemoMode.value) {
        // Only show errors for real API calls, not demo mode
        error.value = err.message || 'Failed to fetch broker information'
        console.error('Error fetching broker info:', err)
      }
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    brokerInfo,
    loading,
    error,
    isLoading,
    hasError,
    isDemoMode,
    fetchBrokerInfo,
    clearError
  }
})