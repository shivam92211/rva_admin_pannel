<template>
  <button
    @click="toggleTheme"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-purple backdrop-blur-xl border border-white/20 rounded-full shadow-glow hover:shadow-glow-pink transition-all duration-300 hover:scale-110 group"
    :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <div class="flex items-center justify-center w-full h-full">
      <Transition
        name="theme-icon"
        mode="out-in"
      >
        <Sun 
          v-if="theme === 'dark'"
          key="sun"
          class="w-6 h-6 text-white group-hover:text-yellow-300 transition-colors duration-300" 
        />
        <Moon 
          v-else
          key="moon"
          class="w-6 h-6 text-white group-hover:text-blue-300 transition-colors duration-300" 
        />
      </Transition>
    </div>
  </button>
</template>

<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { theme, toggleTheme } = useTheme()
</script>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.3s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.5);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.5);
}

.theme-icon-enter-to {
  opacity: 1;
  transform: rotate(0deg) scale(1);
}
</style>