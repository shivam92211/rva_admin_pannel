import { useState, useMemo, useCallback } from 'react'

export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev)
  }, [])

  const collapseSidebar = useCallback(() => {
    setIsCollapsed(true)
  }, [])

  const expandSidebar = useCallback(() => {
    setIsCollapsed(false)
  }, [])

  const sidebarWidth = useMemo(() => 
    isCollapsed ? 'w-16' : 'w-64', 
    [isCollapsed]
  )

  const sidebarCollapsed = useMemo(() => isCollapsed, [isCollapsed])

  return {
    isCollapsed: sidebarCollapsed,
    sidebarWidth,
    toggleSidebar,
    collapseSidebar,
    expandSidebar
  }
}