import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { TransferHistoryTable } from '@/components/transfer/TransferHistoryTable'
import { NewTransferModal } from '@/components/transfer/NewTransferModal'
import { Button } from '@/components/ui/button'
import { useTransferStore } from '@/store/transfer'
import { kucoinApi } from '@/services/kucoinApi'
import { Plus } from 'lucide-react'

const TransfersView: React.FC = () => {
  const { fetchSubAccounts, loadDummyData, error, clearError } = useTransferStore()
  const [showNewTransferModal, setShowNewTransferModal] = useState(false)

  useEffect(() => {
    // Initialize data when component mounts
    const isConfigured = kucoinApi.isBrokerConfigured()
    if (isConfigured) {
      fetchSubAccounts()
    } else {
      loadDummyData()
    }
  }, [fetchSubAccounts, loadDummyData])

  const isConfigured = kucoinApi.isBrokerConfigured()

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Transfers" 
        description="Manage transfers between broker and sub-accounts"
      >
        <Button onClick={() => setShowNewTransferModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </PageHeader>
      
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
                    Broker API credentials are not configured. The transfer functionality will use demo data. 
                    Configure your API credentials in the dashboard to enable live transfers.
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

        {/* Transfer History */}
        <TransferHistoryTable />

        {/* Help Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Transfer Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <h4 className="font-medium text-white mb-2">Transfer Directions</h4>
              <ul className="space-y-1">
                <li><strong>OUT:</strong> Broker account → Sub-account</li>
                <li><strong>IN:</strong> Sub-account → Broker account</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Account Types</h4>
              <ul className="space-y-1">
                <li><strong>MAIN:</strong> Funding account for deposits/withdrawals</li>
                <li><strong>TRADE:</strong> Spot trading account for active trading</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Important Notes</h4>
              <ul className="space-y-1">
                <li>• All fields are required for transfer requests</li>
                <li>• Client Order ID must be unique</li>
                <li>• Transfer amounts must be positive</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-white mb-2">Transfer Status</h4>
              <ul className="space-y-1">
                <li><span className="text-green-300">SUCCESS:</span> Transfer completed</li>
                <li><span className="text-yellow-300">PROCESSING:</span> Transfer in progress</li>
                <li><span className="text-red-300">FAILURE:</span> Transfer failed</li>
              </ul>
            </div>
          </div>
        </div>

        </div>

        {/* New Transfer Modal */}
        <NewTransferModal 
          open={showNewTransferModal} 
          onClose={() => setShowNewTransferModal(false)} 
        />
      </div>
    </div>
  )
}

export default TransfersView