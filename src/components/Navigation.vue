<template>
  <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <div class="bg-kucoin-green text-white px-3 py-1.5 rounded-lg font-bold text-lg">
              KC
            </div>
            <h1 class="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
              KuCoin Broker Admin
            </h1>
          </div>
          
          <!-- Navigation Links -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <router-link
              v-for="item in navigation"
              :key="item.name"
              :to="item.href"
              :class="[
                item.current
                  ? 'border-kucoin-green text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-200',
                'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
              ]"
            >
              <component :is="item.icon" class="w-4 h-4 mr-2" />
              {{ item.name }}
            </router-link>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <!-- API Status -->
          <div class="flex items-center space-x-2">
            <div :class="[
              'w-2 h-2 rounded-full',
              isDemoMode ? 'bg-blue-500' : (apiConnected ? 'bg-green-500' : 'bg-red-500')
            ]"></div>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ isDemoMode ? 'Demo Mode' : (apiConnected ? 'Connected' : 'Disconnected') }}
            </span>
          </div>

          <!-- Settings Button -->
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('open-settings')"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Settings class="h-5 w-5" />
          </Button>

          <!-- Refresh Button -->
          <Button
            variant="ghost"
            size="icon"
            @click="$emit('refresh')"
            class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <RefreshCw class="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Coins, 
  Gift,
  Settings,
  RefreshCw
} from 'lucide-vue-next'
import Button from './ui/button.vue'

const route = useRoute()

const navigation = computed(() => [
  {
    name: 'Dashboard',
    href: '/',
    icon: BarChart3,
    current: route.path === '/'
  },
  {
    name: 'Sub Accounts',
    href: '/subaccounts',
    icon: Users,
    current: route.path === '/subaccounts'
  },
  {
    name: 'Transfers',
    href: '/transfers',
    icon: CreditCard,
    current: route.path === '/transfers'
  },
  {
    name: 'Deposits',
    href: '/deposits',
    icon: Coins,
    current: route.path === '/deposits'
  },
  {
    name: 'Rebates',
    href: '/rebates',
    icon: Gift,
    current: route.path === '/rebates'
  }
])

defineProps<{
  apiConnected?: boolean
  isDemoMode?: boolean
}>()

defineEmits<{
  'open-settings': []
  'refresh': []
}>()
</script>