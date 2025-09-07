<template>
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <Coins class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Deposits
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 234 : 0 }}
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
              <Clock class="h-6 w-6 text-yellow-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Pending
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 12 : 0 }}
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
              <CheckCircle class="h-6 w-6 text-green-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Confirmed
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 218 : 0 }}
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
              <DollarSign class="h-6 w-6 text-blue-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Value
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? '$1.25M' : '$0' }}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label class="block text-sm font-medium text-gray-700">Currency</label>
            <select
              v-model="filters.currency"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
            >
              <option value="">All Currencies</option>
              <option value="USDT">USDT</option>
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="KCS">KCS</option>
              <option value="USDC">USDC</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select
              v-model="filters.status"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PROCESSING">Processing</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Account</label>
            <select
              v-model="filters.account"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
            >
              <option value="">All Accounts</option>
              <option value="trading">Trading Account</option>
              <option value="savings">Savings Account</option>
              <option value="arbitrage">Arbitrage Bot</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">End Date</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
            />
          </div>
        </div>

        <div class="mt-4 flex justify-between">
          <button
            @click="resetFilters"
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <X class="mr-2 h-4 w-4" />
            Clear Filters
          </button>

          <div class="flex space-x-3">
            <button
              @click="exportDeposits"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download class="mr-2 h-4 w-4" />
              Export
            </button>
            
            <button
              @click="refreshDeposits"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kucoin-green hover:bg-green-700"
            >
              <RefreshCw class="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Deposits List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="sm:flex sm:items-center mb-6">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">Deposit History</h1>
            <p class="mt-2 text-sm text-gray-700">
              Track all incoming deposits across your sub-accounts
            </p>
          </div>
        </div>

        <div v-if="!brokerStore.isDemoMode" class="text-center py-12">
          <Coins class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No deposits found</h3>
          <p class="mt-1 text-sm text-gray-500">Deposits will appear here once your sub-accounts receive funds.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confirmations
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="deposit in demoDeposits" :key="deposit.txnId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  <span class="truncate w-32 block" :title="deposit.txnId">
                    {{ deposit.txnId.substring(0, 12) + '...' + deposit.txnId.slice(-6) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-xs font-medium text-gray-600">
                        {{ deposit.currency.substring(0, 2) }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ deposit.currency }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {{ formatAmount(deposit.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ deposit.accountName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ deposit.confirmations }} / {{ deposit.requiredConfirmations }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    deposit.status === 'SUCCESS' 
                      ? 'bg-green-100 text-green-800' 
                      : deposit.status === 'PROCESSING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  ]">
                    <component 
                      :is="deposit.status === 'SUCCESS' ? CheckCircle : deposit.status === 'PROCESSING' ? Clock : AlertCircle" 
                      class="w-3 h-3 mr-1" 
                    />
                    {{ deposit.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(deposit.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewTransaction(deposit.txnId)"
                    class="text-kucoin-green hover:text-green-700 mr-3"
                  >
                    <ExternalLink class="h-4 w-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useBrokerStore } from '@/stores/broker'
import { format } from 'date-fns'
import {
  Coins,
  Clock,
  CheckCircle,
  DollarSign,
  X,
  Download,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-vue-next'

const brokerStore = useBrokerStore()

const filters = reactive({
  currency: '',
  status: '',
  account: '',
  startDate: '',
  endDate: ''
})

const demoDeposits = [
  {
    txnId: '0xa8f2e9c4d5b6a1234567890abcdef1234567890abcdef1234567890abcdef123',
    currency: 'USDT',
    amount: '50000.000000',
    accountName: 'Trading Account A',
    confirmations: 12,
    requiredConfirmations: 12,
    status: 'SUCCESS',
    createdAt: Date.now() - 3600000
  },
  {
    txnId: '0xb9e3f0d5e6c7b2345678901bcdef2345678901bcdef2345678901bcdef234',
    currency: 'BTC',
    amount: '1.25000000',
    accountName: 'Savings Account',
    confirmations: 6,
    requiredConfirmations: 6,
    status: 'SUCCESS',
    createdAt: Date.now() - 7200000
  },
  {
    txnId: '0xc0f4g1e6f7d8c3456789012cdef3456789012cdef3456789012cdef345',
    currency: 'ETH',
    amount: '15.750000',
    accountName: 'DeFi Account',
    confirmations: 8,
    requiredConfirmations: 12,
    status: 'PROCESSING',
    createdAt: Date.now() - 10800000
  },
  {
    txnId: '0xd1g5h2f7g8e9d4567890123def4567890123def4567890123def456',
    currency: 'USDC',
    amount: '25000.000000',
    accountName: 'Arbitrage Bot',
    confirmations: 12,
    requiredConfirmations: 12,
    status: 'SUCCESS',
    createdAt: Date.now() - 14400000
  },
  {
    txnId: '0xe2h6i3g8h9f0e5678901234ef5678901234ef5678901234ef567',
    currency: 'KCS',
    amount: '2500.000000',
    accountName: 'Trading Account B',
    confirmations: 0,
    requiredConfirmations: 12,
    status: 'PROCESSING',
    createdAt: Date.now() - 18000000
  },
  {
    txnId: '0xf3i7j4h9i0g1f6789012345f6789012345f6789012345f678',
    currency: 'BTC',
    amount: '0.00500000',
    accountName: 'Test Account',
    confirmations: 0,
    requiredConfirmations: 6,
    status: 'FAILURE',
    createdAt: Date.now() - 21600000
  }
]

function resetFilters() {
  filters.currency = ''
  filters.status = ''
  filters.account = ''
  filters.startDate = ''
  filters.endDate = ''
}

function formatAmount(amount: string) {
  const num = parseFloat(amount)
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K`
  }
  return num.toFixed(6)
}

function formatDate(timestamp: number) {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
}

function refreshDeposits() {
  if (brokerStore.isDemoMode) {
    alert('Demo mode: Data refreshed with sample deposit records')
  } else {
    console.log('Refreshing deposits...')
  }
}

function exportDeposits() {
  if (brokerStore.isDemoMode) {
    alert('Demo mode: CSV export would be generated here')
  } else {
    alert('Export functionality would be implemented here')
  }
}

function viewTransaction(txnId: string) {
  const explorerUrl = `https://etherscan.io/tx/${txnId}`
  window.open(explorerUrl, '_blank')
}
</script>