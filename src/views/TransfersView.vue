<template>
  <div class="space-y-6">
    <!-- Stats Overview -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div class="bg-white overflow-hidden shadow rounded-lg">
        <div class="p-5">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <ArrowRightLeft class="h-6 w-6 text-gray-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Transfers
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 156 : 0 }}
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
                  In Transfers
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 78 : 0 }}
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
              <TrendingDown class="h-6 w-6 text-red-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Out Transfers
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? 78 : 0 }}
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
              <DollarSign class="h-6 w-6 text-yellow-400" />
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">
                  Total Volume
                </dt>
                <dd class="text-lg font-medium text-gray-900">
                  {{ brokerStore.isDemoMode ? '2.45M' : '0' }}
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
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Direction</label>
            <select
              v-model="filters.direction"
              class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm"
            >
              <option value="">All Directions</option>
              <option value="IN">In</option>
              <option value="OUT">Out</option>
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

          <button
            @click="showTransferModal = true"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kucoin-green hover:bg-green-700"
          >
            <Plus class="mr-2 h-4 w-4" />
            New Transfer
          </button>
        </div>
      </div>
    </div>

    <!-- Transfers List -->
    <div class="bg-white shadow rounded-lg">
      <div class="px-4 py-5 sm:p-6">
        <div class="sm:flex sm:items-center mb-6">
          <div class="sm:flex-auto">
            <h1 class="text-xl font-semibold text-gray-900">Transfer History</h1>
            <p class="mt-2 text-sm text-gray-700">
              View and manage all transfer transactions between accounts
            </p>
          </div>
        </div>

        <div v-if="!brokerStore.isDemoMode" class="text-center py-12">
          <ArrowRightLeft class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-medium text-gray-900">No transfers yet</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new transfer between accounts.</p>
          <button
            @click="showTransferModal = true"
            class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kucoin-green hover:bg-green-700"
          >
            <Plus class="mr-2 h-4 w-4" />
            New Transfer
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Currency
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Direction
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transfer in demoTransfers" :key="transfer.orderId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  {{ transfer.orderId }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span class="text-xs font-medium text-gray-600">
                        {{ transfer.currency.substring(0, 2) }}
                      </span>
                    </div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ transfer.currency }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                  {{ formatAmount(transfer.amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    transfer.direction === 'IN' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  ]">
                    <component 
                      :is="transfer.direction === 'IN' ? TrendingUp : TrendingDown" 
                      class="w-3 h-3 mr-1" 
                    />
                    {{ transfer.direction === 'IN' ? 'Transfer In' : 'Transfer Out' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ transfer.accountName }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    transfer.status === 'SUCCESS' 
                      ? 'bg-green-100 text-green-800' 
                      : transfer.status === 'PROCESSING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  ]">
                    {{ transfer.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(transfer.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Transfer Modal -->
    <div v-if="showTransferModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click="closeTransferModal">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <h3 class="text-lg font-medium text-gray-900 mb-4">New Transfer</h3>
        <form @submit.prevent="submitTransfer" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Direction</label>
            <select v-model="transfer.direction" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm">
              <option value="OUT">Broker → Sub Account</option>
              <option value="IN">Sub Account → Broker</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Currency</label>
            <input v-model="transfer.currency" type="text" placeholder="e.g., USDT" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Amount</label>
            <input v-model="transfer.amount" type="number" step="0.00000001" placeholder="0.00000000" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub Account UID</label>
            <input v-model="transfer.specialUid" type="text" placeholder="Sub account UID" class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-kucoin-green focus:border-kucoin-green sm:text-sm" />
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" @click="closeTransferModal" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">Cancel</button>
            <button type="submit" class="px-4 py-2 bg-kucoin-green text-white rounded-md hover:bg-green-600">Transfer</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useBrokerStore } from '@/stores/broker'
import { format } from 'date-fns'
import {
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  X,
  Plus
} from 'lucide-vue-next'

const brokerStore = useBrokerStore()
const showTransferModal = ref(false)

const filters = reactive({
  currency: '',
  direction: '',
  startDate: '',
  endDate: ''
})

const transfer = reactive({
  direction: 'OUT' as 'OUT' | 'IN',
  currency: '',
  amount: '',
  specialUid: ''
})

const demoTransfers = [
  {
    orderId: 'TXN202411150001',
    currency: 'USDT',
    amount: '25000.500000',
    direction: 'OUT',
    accountName: 'Trading Account A',
    status: 'SUCCESS',
    createdAt: Date.now() - 3600000
  },
  {
    orderId: 'TXN202411150002',
    currency: 'BTC',
    amount: '0.850000',
    direction: 'IN',
    accountName: 'Trading Account B',
    status: 'SUCCESS',
    createdAt: Date.now() - 7200000
  },
  {
    orderId: 'TXN202411150003',
    currency: 'ETH',
    amount: '12.750000',
    direction: 'OUT',
    accountName: 'DCA Account',
    status: 'PROCESSING',
    createdAt: Date.now() - 10800000
  },
  {
    orderId: 'TXN202411150004',
    currency: 'USDT',
    amount: '5000.000000',
    direction: 'IN',
    accountName: 'Arbitrage Bot',
    status: 'SUCCESS',
    createdAt: Date.now() - 14400000
  },
  {
    orderId: 'TXN202411150005',
    currency: 'KCS',
    amount: '1250.000000',
    direction: 'OUT',
    accountName: 'Marketing Rewards',
    status: 'FAILED',
    createdAt: Date.now() - 18000000
  }
]

function resetFilters() {
  filters.currency = ''
  filters.direction = ''
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

function closeTransferModal() {
  showTransferModal.value = false
  Object.assign(transfer, {
    direction: 'OUT' as 'OUT' | 'IN',
    currency: '',
    amount: '',
    specialUid: ''
  })
}

function submitTransfer() {
  if (brokerStore.isDemoMode) {
    alert('Demo mode: Transfer functionality is not available in demo mode')
  } else {
    console.log('Transfer:', transfer)
  }
  closeTransferModal()
}
</script>