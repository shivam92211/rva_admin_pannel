import React, { useState, useMemo } from 'react'
import { useBrokerStore } from '@/store/broker'
import { AppSidebar } from '@/components/AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import APISettingsModal from '@/components/APISettingsModal'
import ThemeToggle from '@/components/ThemeToggle'

interface DefaultLayoutProps {
  children: React.ReactNode
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ children }) => {
  const { hasError, isLoading, clearError } = useBrokerStore()
  const [showApiModal, setShowApiModal] = useState(false)

  const apiConnected = useMemo(() => !hasError && !isLoading, [hasError, isLoading])

  const handleRefresh = () => {
    clearError()
    window.location.reload()
  }

  const handleApiSettingsSaved = () => {
    setShowApiModal(false)
    handleRefresh()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          apiConnected={apiConnected}
          onOpenSettings={() => setShowApiModal(true)}
          onRefresh={handleRefresh}
        />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>

      {/* API Settings Modal */}
      <APISettingsModal 
        open={showApiModal} 
        onClose={() => setShowApiModal(false)}
        onSaved={handleApiSettingsSaved}
      />
      
      {/* Theme Toggle Button */}
      <ThemeToggle />
    </div>
  )
}

export default DefaultLayout