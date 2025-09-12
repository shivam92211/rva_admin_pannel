import React, { useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { WithdrawalHistoryTable } from '@/components/withdrawal/WithdrawalHistoryTable'
import { Button } from '@/components/ui/button'
import { useWithdrawalStore } from '@/store/withdrawal'
import { kucoinApi } from '@/services/kucoinApi'
import { Download } from 'lucide-react'

const WithdrawalsView: React.FC = () => {
  const { fetchWithdrawals, loadDummyData, withdrawals, error, clearError } = useWithdrawalStore()

  useEffect(() => {
    // Initialize data when component mounts
    const isConfigured = kucoinApi.isBrokerConfigured()
    if (isConfigured) {
      fetchWithdrawals()
    } else {
      loadDummyData()
    }
  }, [fetchWithdrawals, loadDummyData])

  const isConfigured = kucoinApi.isBrokerConfigured()

  const handleExport = () => {
    // Create CSV export of withdrawals
    if (withdrawals.length === 0) return

    const csvHeaders = ['Withdrawal ID', 'Currency', 'Amount', 'Chain', 'Address', 'Status', 'Created At', 'Updated At', 'Wallet TX ID']
    const csvRows = withdrawals.map(withdrawal => [
      withdrawal.id,
      withdrawal.currency,
      withdrawal.amount,
      withdrawal.chain,
      withdrawal.address,
      withdrawal.status,
      new Date(withdrawal.createdAt).toISOString(),
      new Date(withdrawal.updatedAt).toISOString(),
      withdrawal.walletTxId
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `withdrawals_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader 
        title="Withdrawals" 
        description="Monitor withdrawal activities and transactions"
      >
        <Button 
          variant="outline"
          onClick={handleExport}
          disabled={withdrawals.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
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
                      Broker API credentials are not configured. The withdrawal monitoring will use demo data. 
                      Configure your API credentials in the dashboard to enable live withdrawal tracking.
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

          {/* Withdrawal History */}
          <WithdrawalHistoryTable />

          {/* Help Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Withdrawal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Supported Networks</h4>
                <ul className="space-y-1">
                  <li><strong>Bitcoin:</strong> BTC network</li>
                  <li><strong>Ethereum:</strong> ERC20 tokens</li>
                  <li><strong>Tron:</strong> TRC20 tokens</li>
                  <li><strong>Binance Smart Chain:</strong> BEP20 tokens</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Withdrawal Status</h4>
                <ul className="space-y-1">
                  <li><span className="text-green-300">SUCCESS:</span> Withdrawal completed and sent</li>
                  <li><span className="text-yellow-300">PROCESSING:</span> Withdrawal being processed</li>
                  <li><span className="text-red-300">FAILURE:</span> Withdrawal failed or rejected</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Important Notes</h4>
                <ul className="space-y-1">
                  <li>• Withdrawal processing times vary by network</li>
                  <li>• Always double-check destination addresses</li>
                  <li>• Check network fees before initiating withdrawals</li>
                  <li>• Some withdrawals may require additional verification</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Transaction Details</h4>
                <ul className="space-y-1">
                  <li>• Click the eye icon to view full withdrawal details</li>
                  <li>• External link opens block explorer for verification</li>
                  <li>• Use filters to find specific withdrawals</li>
                  <li>• Export data for record keeping and analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WithdrawalsView