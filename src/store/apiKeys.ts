import { create } from 'zustand'
import type { ApiKeyInfo, CreateApiKeyRequest, ModifyApiKeyRequest } from '@/types/kucoin'
import { kucoinApi } from '@/services/kucoinApi'

interface ApiKeysState {
  apiKeys: { [uid: string]: ApiKeyInfo[] }
  loading: boolean
  error: string | null
  isLoading: boolean
  hasError: boolean
  getApiKeysForUid: (uid: string) => ApiKeyInfo[]
  fetchApiKeys: (uid: string, apiKey?: string) => Promise<void>
  createApiKey: (data: CreateApiKeyRequest) => Promise<ApiKeyInfo | null>
  modifyApiKey: (data: ModifyApiKeyRequest) => Promise<ApiKeyInfo | null>
  deleteApiKey: (uid: string, apiKey: string) => Promise<boolean>
  clearError: () => void
}

export const useApiKeysStore = create<ApiKeysState>((set, get) => ({
  apiKeys: {},
  loading: false,
  error: null,
  get isLoading() {
    return get().loading
  },
  get hasError() {
    return get().error !== null
  },

  getApiKeysForUid: (uid: string) => {
    return get().apiKeys[uid] || []
  },

  fetchApiKeys: async (uid: string, apiKey?: string) => {
    set({ loading: true, error: null })
    
    try {
      const keys = await kucoinApi.getApiKeys({ uid, apiKey })
      set((state) => ({
        apiKeys: { ...state.apiKeys, [uid]: keys },
        loading: false
      }))
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch API keys',
        loading: false
      })
      console.error('Error fetching API keys:', err)
    }
  },

  createApiKey: async (data: CreateApiKeyRequest) => {
    set({ loading: true, error: null })
    
    try {
      const newApiKey = await kucoinApi.createApiKey(data)
      
      set((state) => ({
        apiKeys: {
          ...state.apiKeys,
          [data.uid]: [...(state.apiKeys[data.uid] || []), newApiKey]
        },
        loading: false
      }))
      
      return newApiKey
    } catch (err: any) {
      set({
        error: err.message || 'Failed to create API key',
        loading: false
      })
      console.error('Error creating API key:', err)
      return null
    }
  },

  modifyApiKey: async (data: ModifyApiKeyRequest) => {
    set({ loading: true, error: null })
    
    try {
      const updatedApiKey = await kucoinApi.modifyApiKey(data)
      
      set((state) => {
        const currentKeys = state.apiKeys[data.uid] || []
        const index = currentKeys.findIndex(key => key.apiKey === data.apiKey)
        if (index !== -1) {
          const newKeys = [...currentKeys]
          newKeys[index] = updatedApiKey
          return {
            apiKeys: { ...state.apiKeys, [data.uid]: newKeys },
            loading: false
          }
        }
        return { loading: false }
      })
      
      return updatedApiKey
    } catch (err: any) {
      set({
        error: err.message || 'Failed to modify API key',
        loading: false
      })
      console.error('Error modifying API key:', err)
      return null
    }
  },

  deleteApiKey: async (uid: string, apiKey: string) => {
    set({ loading: true, error: null })
    
    try {
      const success = await kucoinApi.deleteApiKey(uid, apiKey)
      
      if (success) {
        set((state) => ({
          apiKeys: {
            ...state.apiKeys,
            [uid]: (state.apiKeys[uid] || []).filter(key => key.apiKey !== apiKey)
          },
          loading: false
        }))
      } else {
        set({ loading: false })
      }
      
      return success
    } catch (err: any) {
      set({
        error: err.message || 'Failed to delete API key',
        loading: false
      })
      console.error('Error deleting API key:', err)
      return false
    }
  },

  clearError: () => {
    set({ error: null })
  }
}))