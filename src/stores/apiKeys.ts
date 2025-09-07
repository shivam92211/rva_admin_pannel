import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ApiKeyInfo, CreateApiKeyRequest, ModifyApiKeyRequest } from '@/types/kucoin'
import { kucoinApi } from '@/services/kucoinApi'

export const useApiKeysStore = defineStore('apiKeys', () => {
  const apiKeys = ref<{ [uid: string]: ApiKeyInfo[] }>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)

  function getApiKeysForUid(uid: string): ApiKeyInfo[] {
    return apiKeys.value[uid] || []
  }

  async function fetchApiKeys(uid: string, apiKey?: string) {
    loading.value = true
    error.value = null
    
    try {
      const keys = await kucoinApi.getApiKeys({ uid, apiKey })
      apiKeys.value[uid] = keys
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch API keys'
      console.error('Error fetching API keys:', err)
    } finally {
      loading.value = false
    }
  }

  async function createApiKey(data: CreateApiKeyRequest): Promise<ApiKeyInfo | null> {
    loading.value = true
    error.value = null
    
    try {
      const newApiKey = await kucoinApi.createApiKey(data)
      
      if (!apiKeys.value[data.uid]) {
        apiKeys.value[data.uid] = []
      }
      apiKeys.value[data.uid].push(newApiKey)
      
      return newApiKey
    } catch (err: any) {
      error.value = err.message || 'Failed to create API key'
      console.error('Error creating API key:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function modifyApiKey(data: ModifyApiKeyRequest): Promise<ApiKeyInfo | null> {
    loading.value = true
    error.value = null
    
    try {
      const updatedApiKey = await kucoinApi.modifyApiKey(data)
      
      if (apiKeys.value[data.uid]) {
        const index = apiKeys.value[data.uid].findIndex(key => key.apiKey === data.apiKey)
        if (index !== -1) {
          apiKeys.value[data.uid][index] = updatedApiKey
        }
      }
      
      return updatedApiKey
    } catch (err: any) {
      error.value = err.message || 'Failed to modify API key'
      console.error('Error modifying API key:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteApiKey(uid: string, apiKey: string): Promise<boolean> {
    loading.value = true
    error.value = null
    
    try {
      const success = await kucoinApi.deleteApiKey(uid, apiKey)
      
      if (success && apiKeys.value[uid]) {
        apiKeys.value[uid] = apiKeys.value[uid].filter(key => key.apiKey !== apiKey)
      }
      
      return success
    } catch (err: any) {
      error.value = err.message || 'Failed to delete API key'
      console.error('Error deleting API key:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    apiKeys,
    loading,
    error,
    isLoading,
    hasError,
    getApiKeysForUid,
    fetchApiKeys,
    createApiKey,
    modifyApiKey,
    deleteApiKey,
    clearError
  }
})