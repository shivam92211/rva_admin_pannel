import React, { useState, useEffect } from 'react'
import { useBrokerStore } from '@/store/broker'
import { kucoinApi } from '@/services/kucoinApi'
import APISettingsModal from '@/components/APISettingsModal'
import { PageHeader } from '@/components/PageHeader'

const DashboardView: React.FC = () => {
  const [showApiModal, setShowApiModal] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const [credentials, setCredentials] = useState<any>(null)
  
  const { brokerInfo, fetchBrokerInfo, isLoading, hasError, error } = useBrokerStore()

  useEffect(() => {
    const creds = kucoinApi.getBrokerCredentials()
    setCredentials(creds)
    setIsConfigured(creds.isConfigured)
  }, [])

  const handleApiSettingsSaved = () => {
    setShowApiModal(false)
    const creds = kucoinApi.getBrokerCredentials()
    setCredentials(creds)
    setIsConfigured(creds.isConfigured)
  }

  const handleTestConnection = async () => {
    if (isConfigured) {
      // Test with current date range
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7) // Last 7 days
      
      await fetchBrokerInfo(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0],
        1 // Spot trading
      )
    }
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Dashboard" 
        description="Monitor your broker operations and API status"
      />
      <div className="flex-1 p-6">
      
      {/* Configuration Status */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-white mb-4">Broker API Configuration</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-white">
              {isConfigured ? 'Broker API Configured' : 'Broker API Not Configured'}
            </span>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowApiModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              {isConfigured ? 'Update Settings' : 'Configure API'}
            </button>
            
            {isConfigured && (
              <button
                onClick={handleTestConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 transition-colors"
              >
                {isLoading ? 'Testing...' : 'Test Connection'}
              </button>
            )}
          </div>
        </div>

        {credentials && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <p className="text-sm text-gray-300">
              <strong>API Key:</strong> {credentials.apiKey ? `${credentials.apiKey.substring(0, 8)}...` : 'Not set'}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Broker Name:</strong> {credentials.brokerName || 'Not set'}
            </p>
            <p className="text-sm text-gray-300">
              <strong>Partner Key:</strong> {credentials.partnerKey ? 'Set' : 'Not set'}
            </p>
          </div>
        )}
      </div>

      {/* API Test Results */}
      {hasError && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-red-400 mb-2">API Connection Error</h3>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {brokerInfo && (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">Broker Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Spot Commission Rate</p>
              <p className="text-white">{brokerInfo.spotCommissionRate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Futures Commission Rate</p>
              <p className="text-white">{brokerInfo.futuresCommissionRate || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {!isConfigured && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-400 mb-2">Setup Required</h3>
          <p className="text-yellow-300 text-sm mb-4">
            To use this broker admin panel, you need to configure your KuCoin Broker API credentials.
            You can either:
          </p>
          <ul className="text-yellow-300 text-sm space-y-1 mb-4">
            <li>• Click "Configure API" above to enter credentials manually</li>
            <li>• Set environment variables in your .env file (recommended for production)</li>
          </ul>
          <button
            onClick={() => setShowApiModal(true)}
            className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
          >
            Get Started
          </button>
        </div>
      )}

      <APISettingsModal
        open={showApiModal}
        onClose={() => setShowApiModal(false)}
        onSaved={handleApiSettingsSaved}
      />
      </div>
    </div>
  )
}

export default DashboardView