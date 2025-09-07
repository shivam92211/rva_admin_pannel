<template>
  <div class="space-y-8 p-6">
    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">Sub Accounts</h1>
        <p class="mt-2 text-sm text-white/70">
          Manage your broker sub-accounts and their API keys
        </p>
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
        <button
          @click="showCreateModal = true"
          class="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-purple hover:shadow-glow-pink transition-all duration-300"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Sub Account
        </button>
      </div>
    </div>

    <div v-if="subAccountsStore.hasError" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ subAccountsStore.error }}</p>
        </div>
        <div class="ml-auto">
          <button @click="subAccountsStore.clearError" class="text-red-500 hover:text-red-700">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div v-if="subAccountsStore.isLoading" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-kucoin-green" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="!brokerStore.isDemoMode && subAccountsStore.subAccounts?.items.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.6.713-3.714m0 0A9.971 9.971 0 0124 24c4.21 0 7.954 2.648 9.287 6.286" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No sub-accounts</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new sub-account.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="account in displayedAccounts" :key="account.uid">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ account.accountName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ account.uid }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Level {{ account.level }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(account.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    @click="viewApiKeys(account.uid)"
                    class="text-kucoin-green hover:text-green-700"
                  >
                    API Keys
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="brokerStore.isDemoMode || (subAccountsStore.subAccounts && subAccountsStore.subAccounts.totalPage > 1)" class="mt-6 flex justify-between items-center">
          <div class="text-sm text-gray-700">
            <span v-if="brokerStore.isDemoMode">
              Showing 1 to {{ demoSubAccounts.length }} of {{ demoSubAccounts.length }} results (Demo Data)
            </span>
            <span v-else>
              Showing {{ ((subAccountsStore.subAccounts.currentPage - 1) * subAccountsStore.subAccounts.pageSize) + 1 }} 
              to {{ Math.min(subAccountsStore.subAccounts.currentPage * subAccountsStore.subAccounts.pageSize, subAccountsStore.subAccounts.totalNum) }}
              of {{ subAccountsStore.subAccounts.totalNum }} results
            </span>
          </div>
          <div v-if="!brokerStore.isDemoMode" class="flex space-x-2">
            <button
              @click="loadPage(subAccountsStore.subAccounts.currentPage - 1)"
              :disabled="subAccountsStore.subAccounts.currentPage === 1"
              class="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="loadPage(subAccountsStore.subAccounts.currentPage + 1)"
              :disabled="subAccountsStore.subAccounts.currentPage === subAccountsStore.subAccounts.totalPage"
              class="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Sub Account Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeCreateModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <h3 class="text-lg font-medium text-gray-900 mb-4">Create Sub Account</h3>
        <form @submit.prevent="createAccount">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Account Name</label>
            <input
              v-model="newAccountName"
              type="text"
              required
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
              placeholder="Enter unique account name"
            />
          </div>
          <div class="flex justify-end space-x-3">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!newAccountName.trim() || subAccountsStore.isLoading"
              class="px-4 py-2 bg-kucoin-green text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              {{ subAccountsStore.isLoading ? 'Creating...' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- API Keys Modal -->
    <div v-if="showApiKeysModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeApiKeysModal">
      <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white" @click.stop>
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">API Keys for {{ selectedAccountUid }}</h3>
          <button
            @click="showCreateApiKeyForm = true"
            class="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kucoin-green hover:bg-green-700"
          >
            <svg class="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create API Key
          </button>
        </div>

        <div v-if="apiKeysStore.isLoading" class="flex justify-center py-8">
          <svg class="animate-spin h-6 w-6 text-kucoin-green" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <div v-else-if="currentApiKeys.length === 0" class="text-center py-8">
          <p class="text-gray-500">No API keys found for this account.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Label</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">API Key</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="apiKey in currentApiKeys" :key="apiKey.apiKey">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ apiKey.label }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ apiKey.apiKey }}</td>
                <td class="px-6 py-4 text-sm text-gray-500">
                  <span v-for="permission in apiKey.permissions" :key="permission" class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                    {{ permission }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-500">{{ formatDate(apiKey.createdAt) }}</td>
                <td class="px-6 py-4 text-sm font-medium space-x-2">
                  <button
                    @click="deleteKey(selectedAccountUid!, apiKey.apiKey)"
                    class="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Create API Key Form -->
        <div v-if="showCreateApiKeyForm" class="mt-6 border-t pt-4">
          <h4 class="text-md font-medium text-gray-900 mb-4">Create New API Key</h4>
          <form @submit.prevent="createApiKey" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Label</label>
              <input
                v-model="newApiKey.label"
                type="text"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
                placeholder="API key description"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Passphrase</label>
              <input
                v-model="newApiKey.passphrase"
                type="password"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
                placeholder="API key passphrase"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Permissions</label>
              <div class="mt-2 space-y-2">
                <label class="inline-flex items-center">
                  <input v-model="newApiKey.permissions" type="checkbox" value="general" class="rounded border-gray-300 text-kucoin-green focus:ring-kucoin-green">
                  <span class="ml-2 text-sm text-gray-700">General</span>
                </label>
                <label class="inline-flex items-center ml-6">
                  <input v-model="newApiKey.permissions" type="checkbox" value="spot" class="rounded border-gray-300 text-kucoin-green focus:ring-kucoin-green">
                  <span class="ml-2 text-sm text-gray-700">Spot Trading</span>
                </label>
                <label class="inline-flex items-center ml-6">
                  <input v-model="newApiKey.permissions" type="checkbox" value="futures" class="rounded border-gray-300 text-kucoin-green focus:ring-kucoin-green">
                  <span class="ml-2 text-sm text-gray-700">Futures Trading</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">IP Whitelist</label>
              <textarea
                v-model="ipWhitelistText"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
                rows="3"
                placeholder="Enter IP addresses (one per line, max 20)"
              ></textarea>
            </div>
            <div class="flex justify-end space-x-3">
              <button
                type="button"
                @click="cancelCreateApiKey"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="!newApiKey.label.trim() || !newApiKey.passphrase.trim() || newApiKey.permissions.length === 0"
                class="px-4 py-2 bg-kucoin-green text-white rounded-md hover:bg-green-600 disabled:opacity-50"
              >
                Create API Key
              </button>
            </div>
          </form>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="closeApiKeysModal"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useSubAccountsStore } from '@/stores/subAccounts'
import { useApiKeysStore } from '@/stores/apiKeys'
import { useBrokerStore } from '@/stores/broker'
import { format } from 'date-fns'
import type { ApiPermission } from '@/types/kucoin'

const subAccountsStore = useSubAccountsStore()
const apiKeysStore = useApiKeysStore()
const brokerStore = useBrokerStore()

const showCreateModal = ref(false)
const newAccountName = ref('')

const showApiKeysModal = ref(false)
const selectedAccountUid = ref<string | null>(null)
const showCreateApiKeyForm = ref(false)

const newApiKey = reactive({
  label: '',
  passphrase: '',
  permissions: [] as ApiPermission[]
})

const ipWhitelistText = ref('')

// Demo data for when no API keys are set
const demoSubAccounts = [
  {
    uid: 'sub_001_trading',
    accountName: 'Trading Account A',
    level: 1,
    createdAt: Date.now() - 86400000 * 15 // 15 days ago
  },
  {
    uid: 'sub_002_savings',
    accountName: 'Savings Account',
    level: 2,
    createdAt: Date.now() - 86400000 * 30 // 30 days ago
  },
  {
    uid: 'sub_003_defi',
    accountName: 'DeFi Portfolio',
    level: 1,
    createdAt: Date.now() - 86400000 * 7 // 7 days ago
  },
  {
    uid: 'sub_004_arbitrage',
    accountName: 'Arbitrage Bot',
    level: 3,
    createdAt: Date.now() - 86400000 * 45 // 45 days ago
  },
  {
    uid: 'sub_005_trading_b',
    accountName: 'Trading Account B',
    level: 1,
    createdAt: Date.now() - 86400000 * 60 // 60 days ago
  },
  {
    uid: 'sub_006_futures',
    accountName: 'Futures Trading',
    level: 2,
    createdAt: Date.now() - 86400000 * 22 // 22 days ago
  }
]

const demoApiKeys = {
  'sub_001_trading': [
    {
      apiKey: 'ak_live_1234567890abcdef',
      label: 'Trading Bot Key',
      permissions: ['general', 'spot', 'futures'],
      createdAt: Date.now() - 86400000 * 10
    }
  ],
  'sub_002_savings': [
    {
      apiKey: 'ak_live_abcdef1234567890',
      label: 'Portfolio Manager',
      permissions: ['general', 'spot'],
      createdAt: Date.now() - 86400000 * 25
    }
  ],
  'sub_004_arbitrage': [
    {
      apiKey: 'ak_live_9876543210fedcba',
      label: 'Arbitrage System',
      permissions: ['general', 'spot', 'futures'],
      createdAt: Date.now() - 86400000 * 40
    },
    {
      apiKey: 'ak_live_fedcba0123456789',
      label: 'Backup Key',
      permissions: ['general'],
      createdAt: Date.now() - 86400000 * 35
    }
  ]
}

const displayedAccounts = computed(() => {
  if (brokerStore.isDemoMode) {
    return demoSubAccounts
  }
  return subAccountsStore.subAccounts?.items || []
})

const currentApiKeys = computed(() => {
  if (!selectedAccountUid.value) return []
  
  if (brokerStore.isDemoMode) {
    return demoApiKeys[selectedAccountUid.value] || []
  }
  
  return apiKeysStore.getApiKeysForUid(selectedAccountUid.value)
})

onMounted(() => {
  subAccountsStore.fetchSubAccounts()
})

function formatDate(timestamp: number) {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
}

function loadPage(page: number) {
  subAccountsStore.fetchSubAccounts({ currentPage: page })
}

function closeCreateModal() {
  showCreateModal.value = false
  newAccountName.value = ''
}

async function createAccount() {
  if (!newAccountName.value.trim()) return
  
  if (brokerStore.isDemoMode) {
    alert('Demo mode: Sub-account creation is not available in demo mode. This would create a real sub-account when API keys are configured.')
    closeCreateModal()
    return
  }
  
  const result = await subAccountsStore.createSubAccount({
    accountName: newAccountName.value.trim()
  })
  
  if (result) {
    closeCreateModal()
  }
}

async function viewApiKeys(uid: string) {
  selectedAccountUid.value = uid
  showApiKeysModal.value = true
  await apiKeysStore.fetchApiKeys(uid)
}

function closeApiKeysModal() {
  showApiKeysModal.value = false
  selectedAccountUid.value = null
  showCreateApiKeyForm.value = false
  resetApiKeyForm()
}

function resetApiKeyForm() {
  newApiKey.label = ''
  newApiKey.passphrase = ''
  newApiKey.permissions = []
  ipWhitelistText.value = ''
}

function cancelCreateApiKey() {
  showCreateApiKeyForm.value = false
  resetApiKeyForm()
}

async function createApiKey() {
  if (!selectedAccountUid.value) return
  
  if (brokerStore.isDemoMode) {
    alert('Demo mode: API key creation is not available in demo mode. This would create a real API key when broker credentials are configured.')
    showCreateApiKeyForm.value = false
    resetApiKeyForm()
    return
  }
  
  const ipWhitelist = ipWhitelistText.value
    .split('\n')
    .map(ip => ip.trim())
    .filter(ip => ip.length > 0)
    .slice(0, 20)

  const result = await apiKeysStore.createApiKey({
    uid: selectedAccountUid.value,
    label: newApiKey.label,
    passphrase: newApiKey.passphrase,
    permissions: newApiKey.permissions,
    ipWhitelist
  })
  
  if (result) {
    showCreateApiKeyForm.value = false
    resetApiKeyForm()
  }
}

async function deleteKey(uid: string, apiKey: string) {
  if (brokerStore.isDemoMode) {
    alert('Demo mode: API key deletion is not available in demo mode.')
    return
  }
  
  if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
    await apiKeysStore.deleteApiKey(uid, apiKey)
  }
}
</script>