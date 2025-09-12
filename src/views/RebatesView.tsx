import React, { useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { RebateHistoryTable } from '@/components/rebate/RebateHistoryTable'
import { useRebateStore } from '@/store/rebate'
import { kucoinApi } from '@/services/kucoinApi'

const RebatesView: React.FC = () => {
  const { fetchRebates, loadDummyData, error, clearError } = useRebateStore()

  useEffect(() => {
    // Initialize data when component mounts
    const isConfigured = kucoinApi.isBrokerConfigured()
    if (isConfigured) {
      fetchRebates()
    } else {
      loadDummyData()
    }
  }, [fetchRebates, loadDummyData])

  const isConfigured = kucoinApi.isBrokerConfigured()

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Rebates" 
        description="Track your broker rebates and commission earnings"
      />
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Configuration Warning */}
          {!isConfigured && (
            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">
                    Demo Mode Active
                  </h3>
                  <div className="mt-2 text-sm text-yellow-200">
                    <p>
                      Broker API credentials are not configured. The rebate tracking will use demo data. 
                      Configure your API credentials in the dashboard to enable live rebate monitoring.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Error Display */}
          {error && error.includes('demo data') && (
            <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-300">
                    Using Demo Data
                  </h3>
                  <div className="mt-2 text-sm text-blue-200">
                    <p>{error}</p>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={clearError}
                      className="text-xs text-blue-300 hover:text-blue-200 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rebate History */}
          <RebateHistoryTable />

          {/* Help Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Rebate Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Business Lines</h4>
                <ul className="space-y-1">
                  <li><strong>Spot:</strong> Commission from spot trading activities</li>
                  <li><strong>Futures:</strong> Commission from futures trading activities</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Commission Types</h4>
                <ul className="space-y-1">
                  <li><strong>Total Commission:</strong> Overall commission generated</li>
                  <li><strong>Broker Commission:</strong> Your share as a broker</li>
                  <li><strong>User Commission:</strong> Commission share for users</li>
                  <li><strong>Affiliate Commission:</strong> Commission for affiliate partners</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Important Features</h4>
                <ul className="space-y-1">
                  <li>• Filter by date range to analyze specific periods</li>
                  <li>• Download detailed reports for accounting purposes</li>
                  <li>• Track affiliate performance and commissions</li>
                  <li>• Monitor trading volume and commission rates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Data Export</h4>
                <ul className="space-y-1">
                  <li>• CSV export with all commission details</li>
                  <li>• Filter data by business line before export</li>
                  <li>• Reports include all UID and volume information</li>
                  <li>• Suitable for accounting and tax reporting</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RebatesView