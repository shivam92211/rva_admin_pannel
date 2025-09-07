<script setup lang="ts">
import { onMounted } from 'vue'
import DefaultLayout from './layouts/DefaultLayout.vue'

onMounted(() => {
  // Apply dark theme by default
  document.documentElement.classList.add('dark')
})
</script>

<template>
  <div class="dark">
    <DefaultLayout />
  </div>
</template>
