<template>
  <div :class="cn('rounded-lg border bg-white text-gray-900 shadow-sm', $attrs.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils'
</script>