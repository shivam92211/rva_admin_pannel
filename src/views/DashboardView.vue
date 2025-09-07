<template>
  <div class="container mx-auto p-6 space-y-8 relative z-20">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p class="text-white/70 mt-2">
          Monitor your KuCoin broker activities and account status
        </p>
      </div>
      <div class="flex items-center space-x-4">
        <Button
          @click="refreshData"
          :disabled="brokerStore.isLoading"
          class="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-300"
        >
          <RefreshCw :class="{ 'animate-spin': brokerStore.isLoading }" class="mr-2 h-4 w-4" />
          {{ brokerStore.isLoading ? 'Loading...' : 'Refresh' }}
        </Button>
        <Button 
          @click="showSettingsModal = true" 
          class="bg-gradient-purple text-white border-none shadow-glow hover:shadow-glow-pink transition-all duration-300"
        >
          <Settings class="mr-2 h-4 w-4" />
          API Settings
        </Button>
      </div>
    </div>

    <!-- Demo Mode Alert -->
    <div v-if="brokerStore.isDemoMode" class="relative">
      <div class="rounded-2xl border border-blue-500/30 bg-blue-500/20 backdrop-blur-xl p-6 shadow-glow-blue">
        <div class="flex items-start space-x-3">
          <Info class="h-6 w-6 text-blue-300 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-blue-200">Demo Mode</h3>
            <p class="text-blue-100 mt-2">
              You're viewing sample data. Configure your API credentials to see real broker information.
            </p>
            <div class="mt-4">
              <Button
                @click="showSettingsModal = true"
                class="bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50 transition-all duration-300"
              >
                <Settings class="mr-2 h-4 w-4" />
                Configure API Keys
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error Alert (only show when not in demo mode) -->
    <div v-if="brokerStore.hasError && !brokerStore.isDemoMode" class="relative">
      <div class="rounded-2xl border border-red-500/30 bg-red-500/20 backdrop-blur-xl p-6">
        <div class="flex items-start space-x-3">
          <AlertCircle class="h-6 w-6 text-red-300 flex-shrink-0 mt-0.5" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-red-200">Connection Error</h3>
            <p class="text-red-100 mt-2">
              {{ brokerStore.error }}
            </p>
            <div class="mt-3 text-sm">
              <p class="text-red-200">This usually happens when:</p>
              <ul class="list-disc ml-4 mt-1 text-red-100">
                <li>API credentials are missing or incorrect</li>
                <li>API signature is not properly generated</li>
                <li>Network connection issues</li>
              </ul>
            </div>
          </div>
          <Button
            @click="brokerStore.clearError"
            class="text-red-300 hover:text-red-100 h-8 w-8 -mr-2 bg-transparent hover:bg-white/20"
          >
            <X class="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <div class="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group">
        <div class="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 class="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">Sub Accounts</h3>
          <Users class="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
        </div>
        <div class="text-3xl font-bold text-white mb-2">
          {{ brokerStore.brokerInfo?.accountSize || 0 }}
        </div>
        <p class="text-xs text-white/50">
          <span v-if="brokerStore.brokerInfo?.maxAccountSize">
            of {{ brokerStore.brokerInfo.maxAccountSize }} maximum
          </span>
          <span v-else>total accounts</span>
        </p>
      </div>

      <div class="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-glow-blue transition-all duration-300 group">
        <div class="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 class="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">Broker Level</h3>
          <TrendingUp class="h-6 w-6 text-blue-400 group-hover:text-blue-300 transition-colors" />
        </div>
        <div class="text-3xl font-bold text-white mb-2">
          {{ brokerStore.brokerInfo?.level || 0 }}
        </div>
        <p class="text-xs text-white/50">
          Current tier level
        </p>
      </div>

      <div class="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-glow-pink transition-all duration-300 group">
        <div class="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 class="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">Connection</h3>
          <Wifi class="h-6 w-6 text-pink-400 group-hover:text-pink-300 transition-colors" />
        </div>
        <div class="text-2xl font-bold mb-2">
          <span :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            brokerStore.isDemoMode ? 'bg-blue-500/20 text-blue-300' : (apiConnected ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300')
          ]">
            {{ brokerStore.isDemoMode ? 'Demo' : (apiConnected ? 'Active' : 'Failed') }}
          </span>
        </div>
        <p class="text-xs text-white/50">
          {{ brokerStore.isDemoMode ? 'Demo mode' : 'API status' }}
        </p>
      </div>

      <div class="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group">
        <div class="flex flex-row items-center justify-between space-y-0 pb-4">
          <h3 class="text-sm font-medium text-white/70 group-hover:text-white/90 transition-colors">Last Updated</h3>
          <Clock class="h-6 w-6 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
        </div>
        <div class="text-lg font-bold text-white mb-2">
          {{ lastUpdated }}
        </div>
        <p class="text-xs text-white/50">
          Data refresh time
        </p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-white mb-2">Quick Actions</h3>
        <p class="text-sm text-white/60">
          Common tasks and operations
        </p>
      </div>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <button
          @click="$router.push('/subaccounts')"
          class="group bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-glow"
        >
          <Users class="h-8 w-8 text-purple-400 group-hover:text-purple-300 mx-auto mb-3 transition-colors" />
          <span class="text-white/80 group-hover:text-white text-sm font-medium">Sub Accounts</span>
        </button>
        <button
          @click="$router.push('/transfers')"
          class="group bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-glow-blue"
        >
          <ArrowRightLeft class="h-8 w-8 text-blue-400 group-hover:text-blue-300 mx-auto mb-3 transition-colors" />
          <span class="text-white/80 group-hover:text-white text-sm font-medium">Transfers</span>
        </button>
        <button
          @click="$router.push('/deposits')"
          class="group bg-white/5 hover:bg-pink-500/20 border border-white/10 hover:border-pink-500/30 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-glow-pink"
        >
          <Coins class="h-8 w-8 text-pink-400 group-hover:text-pink-300 mx-auto mb-3 transition-colors" />
          <span class="text-white/80 group-hover:text-white text-sm font-medium">Deposits</span>
        </button>
        <button
          @click="$router.push('/rebates')"
          class="group bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-glow"
        >
          <Gift class="h-8 w-8 text-indigo-400 group-hover:text-indigo-300 mx-auto mb-3 transition-colors" />
          <span class="text-white/80 group-hover:text-white text-sm font-medium">Rebates</span>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-gradient-card backdrop-blur-xl border border-white/10 rounded-2xl p-8">
      <div class="mb-6">
        <h3 class="text-xl font-semibold text-white mb-2">Recent Activity</h3>
        <p class="text-sm text-white/60">
          Latest transactions and updates
        </p>
      </div>
      <div class="text-center py-12">
        <div class="mx-auto w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-float">
          <Activity class="h-10 w-10 text-purple-400" />
        </div>
        <h3 class="text-lg font-medium mb-3 text-white">No recent activity</h3>
        <p class="text-sm text-white/60 mb-8">
          Get started by creating a sub-account or making a transfer.
        </p>
        <Button 
          @click="$router.push('/subaccounts')"
          class="bg-gradient-purple text-white border-none shadow-glow hover:shadow-glow-pink transition-all duration-300"
        >
          <Plus class="mr-2 h-4 w-4" />
          Create Sub Account
        </Button>
      </div>
    </div>

    <!-- API Settings Modal -->
    <APISettingsModal 
      :open="showSettingsModal" 
      @close="showSettingsModal = false"
      @saved="handleApiSettingsSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBrokerStore } from '@/stores/broker'
import { format } from 'date-fns'

// UI Components
import Button from '@/components/ui/button.vue'
import Card from '@/components/ui/card.vue'
import CardHeader from '@/components/ui/card-header.vue'
import CardContent from '@/components/ui/card-content.vue'
import Badge from '@/components/ui/badge.vue'

// Icons
import {
  RefreshCw,
  Settings,
  AlertCircle,
  Info,
  X,
  Users,
  TrendingUp,
  Wifi,
  Clock,
  ArrowRightLeft,
  Coins,
  Gift,
  Activity,
  Plus
} from 'lucide-vue-next'

// Import API Settings Modal (we'll create this next)
import APISettingsModal from '@/components/APISettingsModal.vue'

const brokerStore = useBrokerStore()
const showSettingsModal = ref(false)

const apiConnected = computed(() => !brokerStore.hasError && !brokerStore.isLoading)

const lastUpdated = computed(() => {
  const now = new Date()
  return format(now, 'HH:mm:ss')
})

onMounted(() => {
  loadBrokerData()
})

function loadBrokerData() {
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 1)
  
  const begin = format(startDate, 'yyyyMMdd')
  const end = format(endDate, 'yyyyMMdd')
  
  brokerStore.fetchBrokerInfo(begin, end, 1)
}

function refreshData() {
  loadBrokerData()
}

function handleApiSettingsSaved() {
  showSettingsModal.value = false
  refreshData()
}
</script>