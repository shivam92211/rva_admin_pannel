<template>
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Gift class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Rebates
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? '$45,678.90' : '$0.00' }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <TrendingUp class="h-6 w-6 text-green-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  This Month
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? '$3,456.78' : '$0.00' }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Users class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Active Sub-Accounts
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 25 : 0 }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <BarChart3 class="h-6 w-6 text-purple-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Avg. Rate
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? '15.5%' : '0%' }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
        <h1 class="text-2xl font-semibold text-gray-900">Broker Rebates</h1>
        <p class="mt-2 text-sm text-gray-700">
          Download and view your broker rebate reports
        </p>
      </div>
    </div>

    <!-- Download Form -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Download Rebate Report</h3>
        <form @submit.prevent="downloadReport" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label class="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                v-model="reportParams.begin"
                type="date"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">End Date</label>
              <input
                v-model="reportParams.end"
                type="date"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Trade Type</label>
              <select
                v-model="reportParams.tradeType"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
              >
                <option :value="1">Spot Trading</option>
                <option :value="2">Futures Trading</option>
              </select>
            </div>
          </div>
          <div>
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kucoin-green hover:bg-green-700 disabled:opacity-50"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <svg v-else class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ loading ? 'Generating...' : 'Download Report' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>
        <div class="ml-auto">
          <button @click="error = null" class="text-red-500 hover:text-red-700">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Success Display -->
    <div v-if="downloadUrl" class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-800">
            Report generated successfully!
            <a :href="downloadUrl" target="_blank" class="font-medium text-green-800 hover:text-green-900 underline ml-2">
              Download CSV
            </a>
          </p>
        </div>
        <div class="ml-auto">
          <button @click="downloadUrl = null" class="text-green-500 hover:text-green-700">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">Report Information</h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>Reports include rebate data for all your sub-accounts</li>
              <li>Maximum date range is 6 months</li>
              <li>CSV files contain detailed commission breakdown</li>
              <li>Data includes: Date, UIDs, Volume, Commissions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useBrokerStore } from '@/stores/broker'
import { kucoinApi } from '@/services/kucoinApi'
import { format } from 'date-fns'
import {
  Gift,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-vue-next'

const brokerStore = useBrokerStore()
const loading = ref(false)
const error = ref<string | null>(null)
const downloadUrl = ref<string | null>(null)

const reportParams = reactive({
  begin: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  end: format(new Date(), 'yyyy-MM-dd'),
  tradeType: 1 as 1 | 2
})

async function downloadReport() {
  loading.value = true
  error.value = null
  downloadUrl.value = null
  
  try {
    if (brokerStore.isDemoMode) {
      // Simulate demo mode download
      setTimeout(() => {
        downloadUrl.value = 'data:text/csv;base64,RGF0ZSxVSUQsVm9sdW1lLENvbW1pc3Npb24KMjAyNC0xMS0xNSxzdWJhY2NvdW50MSwyNTAwMCwxMjUKMjAyNC0xMS0xNCxzdWJhY2NvdW50MiwxODAwMCw5MAoyMDI0LTExLTEzLHN1YmFjY291bnQzLDMwMDAwLDE1MA=='
        loading.value = false
      }, 2000)
      return
    }

    const begin = reportParams.begin.replace(/-/g, '')
    const end = reportParams.end.replace(/-/g, '')
    
    const url = await kucoinApi.downloadBrokerRebate({
      begin,
      end,
      tradeType: reportParams.tradeType
    })
    
    downloadUrl.value = url
  } catch (err: any) {
    error.value = err.message || 'Failed to generate report'
  } finally {
    if (!brokerStore.isDemoMode) {
      loading.value = false
    }
  }
}
</script>