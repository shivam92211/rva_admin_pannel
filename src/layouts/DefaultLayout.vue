<template>
  <div class="min-h-screen bg-gradient-dark dark:bg-gradient-dark">
    <!-- Animated background elements -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div class="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style="animation-delay: 2s;"></div>
      <div class="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style="animation-delay: 4s;"></div>
    </div>
    
    <Sidebar
      :api-connected="apiConnected"
      :is-demo-mode="brokerStore.isDemoMode"
      @open-settings="showApiModal = true"
      @refresh="handleRefresh"
    >
      <RouterView />
    </Sidebar>

    <!-- API Settings Modal -->
    <APISettingsModal 
      :open="showApiModal" 
      @close="showApiModal = false"
      @saved="handleApiSettingsSaved"
    />
    
    <!-- Theme Toggle Button -->
    <ThemeToggle />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterView } from 'vue-router'
import { useBrokerStore } from '@/stores/broker'

import Sidebar from '@/components/Sidebar.vue'
import APISettingsModal from '@/components/APISettingsModal.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const brokerStore = useBrokerStore()
const showApiModal = ref(false)

const apiConnected = computed(() => !brokerStore.hasError && !brokerStore.isLoading)

function handleRefresh() {
  brokerStore.clearError()
  // Trigger a refresh in the current view
  window.location.reload()
}

function handleApiSettingsSaved() {
  showApiModal.value = false
  handleRefresh()
}
</script>