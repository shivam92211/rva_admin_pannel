<template>
  <div class="flex h-screen bg-transparent relative z-10">
    <!-- Sidebar -->
    <div class="w-64 bg-gradient-card backdrop-blur-xl border-r border-white/10 shadow-2xl">
      <!-- Logo Header -->
      <div class="flex items-center justify-center h-16 px-4 bg-gradient-purple shadow-glow">
        <div class="flex items-center space-x-3">
          <div class="bg-white/20 backdrop-blur text-white px-3 py-2 rounded-lg font-bold text-sm border border-white/30">
            KC
          </div>
          <span class="text-white font-semibold text-lg">Broker Admin</span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="mt-8">
        <div class="px-4">
          <p class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
            Main Menu
          </p>
        </div>
        
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          :class="[
            'flex items-center px-6 py-3 text-sm font-medium transition-all duration-300 mx-2 rounded-lg',
            $route.path === item.path
              ? 'bg-gradient-blue text-white shadow-glow-blue border border-blue-500/30'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          ]"
        >
          <component :is="item.icon" class="mr-3 h-5 w-5 flex-shrink-0" />
          <span>{{ item.name }}</span>
          <span v-if="item.badge" class="ml-auto">
            <Badge :variant="item.badgeVariant" class="text-xs">
              {{ item.badge }}
            </Badge>
          </span>
        </router-link>

        <div class="px-4 mt-8">
          <p class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
            Account
          </p>
        </div>

        <div class="px-6 py-3">
          <Button
            @click="$emit('open-settings')"
            class="w-full justify-start bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-300"
          >
            <Settings class="mr-2 h-4 w-4" />
            API Settings
          </Button>
        </div>

        <!-- Demo Mode Indicator -->
        <div v-if="isDemoMode" class="mx-4 mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span class="text-xs font-medium text-blue-300">Demo Mode</span>
          </div>
          <p class="text-xs text-blue-200 mt-1">
            Sample data shown
          </p>
        </div>

        <!-- API Status -->
        <div v-else class="mx-4 mt-4 p-3 rounded-lg border backdrop-blur-sm" :class="[
          apiConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
        ]">
          <div class="flex items-center space-x-2">
            <div class="w-2 h-2 rounded-full animate-pulse" :class="[
              apiConnected ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
            <span class="text-xs font-medium" :class="[
              apiConnected ? 'text-green-300' : 'text-red-300'
            ]">
              {{ apiConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <p class="text-xs mt-1" :class="[
            apiConnected ? 'text-green-200' : 'text-red-200'
          ]">
            {{ apiConnected ? 'API is active' : 'Check credentials' }}
          </p>
        </div>
      </nav>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-semibold text-white">{{ currentPageTitle }}</h1>
            <p class="text-sm text-white/60 mt-1">{{ currentPageDescription }}</p>
          </div>
          <div class="flex items-center space-x-4">
            <Button
              @click="$emit('refresh')"
              class="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-300"
            >
              <RefreshCw class="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto bg-transparent p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  BarChart3,
  Users,
  ArrowRightLeft,
  Coins,
  Gift,
  Settings,
  RefreshCw
} from 'lucide-vue-next'

import Button from '@/components/ui/button.vue'
import Badge from '@/components/ui/badge.vue'

const route = useRoute()

const navigationItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: BarChart3,
    description: 'Overview and statistics'
  },
  {
    name: 'Sub Accounts',
    path: '/subaccounts',
    icon: Users,
    badge: '12',
    badgeVariant: 'secondary',
    description: 'Manage sub-accounts'
  },
  {
    name: 'Transfers',
    path: '/transfers',
    icon: ArrowRightLeft,
    description: 'Transfer history and management'
  },
  {
    name: 'Deposits',
    path: '/deposits',
    icon: Coins,
    badge: '3',
    badgeVariant: 'success',
    description: 'Deposit records and details'
  },
  {
    name: 'Rebates',
    path: '/rebates',
    icon: Gift,
    description: 'Commission and rebate reports'
  }
]

const currentPageTitle = computed(() => {
  const currentItem = navigationItems.find(item => item.path === route.path)
  return currentItem?.name || 'Dashboard'
})

const currentPageDescription = computed(() => {
  const currentItem = navigationItems.find(item => item.path === route.path)
  return currentItem?.description || 'Monitor your KuCoin broker activities and account status'
})

defineProps<{
  apiConnected?: boolean
  isDemoMode?: boolean
}>()

defineEmits<{
  'open-settings': []
  'refresh': []
}>()
</script>