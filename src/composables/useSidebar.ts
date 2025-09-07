import { ref, computed } from 'vue'

const isCollapsed = ref(false)

export function useSidebar() {
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  const collapseSidebar = () => {
    isCollapsed.value = true
  }

  const expandSidebar = () => {
    isCollapsed.value = false
  }

  const sidebarWidth = computed(() => isCollapsed.value ? 'w-16' : 'w-64')
  const sidebarCollapsed = computed(() => isCollapsed.value)

  return {
    isCollapsed: sidebarCollapsed,
    sidebarWidth,
    toggleSidebar,
    collapseSidebar,
    expandSidebar
  }
}