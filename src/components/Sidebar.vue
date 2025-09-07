<template>
  <div class="flex h-screen bg-transparent relative z-10">
    <!-- Sidebar -->
    <div :class="[
      'bg-gradient-card backdrop-blur-xl border-r border-white/10 shadow-2xl transition-all duration-300',
      sidebarWidth
    ]">
      <!-- Logo Header -->
      <div class="flex items-center h-16 px-4 bg-gradient-purple shadow-glow" :class="isCollapsed ? 'justify-center' : 'justify-between'">
        <div class="flex items-center" :class="isCollapsed ? '' : 'space-x-3'">
          <div class="bg-white/20 backdrop-blur text-white px-3 py-2 rounded-lg font-bold text-sm border border-white/30">
            KC
          </div>
          <span v-if="!isCollapsed" class="text-white font-semibold text-lg">Broker Admin</span>
        </div>
        <Button
          @click="toggleSidebar"
          class="bg-white/10 hover:bg-white/20 text-white border-0 p-2 h-8 w-8"
          :class="isCollapsed ? 'hidden' : ''"
        >
          <PanelLeftClose class="h-4 w-4" />
        </Button>
      </div>

      <!-- Navigation Menu -->
      <nav class="mt-8">
        <div v-if="!isCollapsed" class="px-4">
          <p class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
            Main Menu
          </p>
        </div>
        
        <router-link
          v-for="item in navigationItems"
          :key="item.name"
          :to="item.path"
          :class="[
            'flex items-center text-sm font-medium transition-all duration-300 mx-2 rounded-lg group relative',
            isCollapsed ? 'px-3 py-3 justify-center' : 'px-6 py-3',
            $route.path === item.path
              ? 'bg-gradient-blue text-white shadow-glow-blue border border-blue-500/30'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          ]"
          :title="isCollapsed ? item.name : ''"
        >
          <component :is="item.icon" :class="[
            'h-5 w-5 flex-shrink-0',
            isCollapsed ? '' : 'mr-3'
          ]" />
          <span v-if="!isCollapsed">{{ item.name }}</span>
          <span v-if="item.badge && !isCollapsed" class="ml-auto">
            <Badge :variant="item.badgeVariant" class="text-xs">
              {{ item.badge }}
            </Badge>
          </span>
          
          <!-- Tooltip for collapsed state -->
          <div v-if="isCollapsed" class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
            {{ item.name }}
            <span v-if="item.badge" class="ml-1 px-1 py-0.5 bg-blue-500 rounded text-xs">{{ item.badge }}</span>
          </div>
        </router-link>

        <div v-if="!isCollapsed" class="px-4 mt-8">
          <p class="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
            Account
          </p>
        </div>

        <div :class="isCollapsed ? 'px-3 py-3' : 'px-6 py-3'">
          <Button
            @click="$emit('open-settings')"
            :class="[
              'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30 transition-all duration-300 group relative',
              isCollapsed ? 'w-10 h-10 p-0 justify-center' : 'w-full justify-start'
            ]"
            :title="isCollapsed ? 'API Settings' : ''"
          >
            <Settings :class="isCollapsed ? 'h-4 w-4' : 'mr-2 h-4 w-4'" />
            <span v-if="!isCollapsed">API Settings</span>
            
            <!-- Tooltip for collapsed state -->
            <div v-if="isCollapsed" class="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
              API Settings
            </div>
          </Button>
        </div>

        <!-- Demo Mode Indicator -->
        <div v-if="isDemoMode" :class="[
          'mt-4 rounded-lg border border-blue-500/30 backdrop-blur-sm bg-blue-500/20',
          isCollapsed ? 'mx-2 p-2' : 'mx-4 p-3'
        ]">
          <div :class="[
            'flex items-center',
            isCollapsed ? 'justify-center' : 'space-x-2'
          ]">
            <div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span v-if="!isCollapsed" class="text-xs font-medium text-blue-300">Demo Mode</span>
          </div>
          <p v-if="!isCollapsed" class="text-xs text-blue-200 mt-1">
            Sample data shown
          </p>
        </div>

        <!-- API Status -->
        <div v-else :class="[
          'mt-4 rounded-lg border backdrop-blur-sm',
          isCollapsed ? 'mx-2 p-2' : 'mx-4 p-3',
          apiConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
        ]">
          <div :class="[
            'flex items-center',
            isCollapsed ? 'justify-center' : 'space-x-2'
          ]">
            <div class="w-2 h-2 rounded-full animate-pulse" :class="[
              apiConnected ? 'bg-green-400' : 'bg-red-400'
            ]"></div>
            <span v-if="!isCollapsed" class="text-xs font-medium" :class="[
              apiConnected ? 'text-green-300' : 'text-red-300'
            ]">
              {{ apiConnected ? 'Connected' : 'Disconnected' }}
            </span>
          </div>
          <p v-if="!isCollapsed" class="text-xs mt-1" :class="[
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
          <div class="flex items-center space-x-4">
            <Button
              v-if="isCollapsed"
              @click="toggleSidebar"
              class="bg-white/10 hover:bg-white/20 text-white border-0 p-2 h-8 w-8"
            >
              <PanelLeftOpen class="h-4 w-4" />
            </Button>
            <div>
              <h1 class="text-2xl font-semibold text-white">{{ currentPageTitle }}</h1>
              <p class="text-sm text-white/60 mt-1">{{ currentPageDescription }}</p>
            </div>
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
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-vue-next'

import Button from '@/components/ui/button.vue'
import Badge from '@/components/ui/badge.vue'
import { useSidebar } from '@/composables/useSidebar'

const route = useRoute()
const { isCollapsed, sidebarWidth, toggleSidebar } = useSidebar()

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