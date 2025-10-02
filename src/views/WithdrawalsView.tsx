import React, { useEffect, useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { WithdrawalHistoryTable } from '@/components/withdrawal/WithdrawalHistoryTable'
import { KucoinWithdrawalHistoryTable } from '@/components/withdrawal/KucoinWithdrawalHistoryTable'
import { Button } from '@/components/ui/button'
import { useWithdrawalStore } from '@/store/withdrawal'
import { Download } from 'lucide-react'

type TabType = 'requests' | 'kucoin'

const WithdrawalsView: React.FC = () => {
  const { fetchWithdrawals, fetchKucoinWithdrawals, withdrawals, kucoinWithdrawals, error, clearError } = useWithdrawalStore()
  const [activeTab, setActiveTab] = useState<TabType>('requests')

  useEffect(() => {
    // Fetch withdrawals from database when component mounts
    if (activeTab === 'requests') {
      fetchWithdrawals()
    } else {
      fetchKucoinWithdrawals()
    }
  }, [activeTab, fetchWithdrawals, fetchKucoinWithdrawals])

  const handleExport = () => {
    // Create CSV export of withdrawals
    const data = activeTab === 'requests' ? withdrawals : kucoinWithdrawals
    if (data.length === 0) return

    const csvHeaders = activeTab === 'requests'
      ? ['ID', 'User Email', 'Amount', 'Fee', 'Total', 'To Address', 'Status', 'TX Hash', 'Created At', 'Updated At']
      : ['ID', 'User Email', 'Amount', 'Fee', 'Currency', 'Chain', 'Address', 'Status', 'TX Hash', 'Created At', 'Updated At']

    const csvRows = activeTab === 'requests'
      ? withdrawals.map(withdrawal => [
          withdrawal.id,
          withdrawal.user?.email || 'N/A',
          withdrawal.amount,
          withdrawal.fee,
          withdrawal.totalAmount,
          withdrawal.toAddress,
          withdrawal.status,
          withdrawal.txHash || 'N/A',
          new Date(withdrawal.createdAt).toISOString(),
          new Date(withdrawal.updatedAt).toISOString()
        ])
      : kucoinWithdrawals.map(withdrawal => [
          withdrawal.id,
          withdrawal.user?.email || 'N/A',
          withdrawal.amount,
          withdrawal.fee,
          withdrawal.currency,
          withdrawal.chain,
          withdrawal.address,
          withdrawal.status,
          withdrawal.walletTxId || 'N/A',
          new Date(withdrawal.createdAt).toISOString(),
          new Date(withdrawal.updatedAt).toISOString()
        ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${activeTab}_withdrawals_${new Date().toISOString().split('T')[0]}.csv`
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
          disabled={(activeTab === 'requests' ? withdrawals.length : kucoinWithdrawals.length) === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-lg p-1 inline-flex space-x-1">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'requests'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Withdrawal Requests
            </button>
            <button
              onClick={() => setActiveTab('kucoin')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'kucoin'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              Withdrawals
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">
                    Error Loading Withdrawals
                  </h3>
                  <div className="mt-2 text-sm text-red-200">
                    <p>{error}</p>
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={clearError}
                      className="text-xs text-red-300 hover:text-red-200 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Withdrawal History - Tab Content */}
          {activeTab === 'requests' ? <WithdrawalHistoryTable /> : <KucoinWithdrawalHistoryTable />}

          {/* Help Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Withdrawal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Withdrawal Status</h4>
                <ul className="space-y-1">
                  <li><span className="text-green-300">COMPLETED:</span> Withdrawal completed and sent</li>
                  <li><span className="text-blue-300">PROCESSING:</span> Withdrawal being processed</li>
                  <li><span className="text-yellow-300">PENDING:</span> Awaiting verification</li>
                  <li><span className="text-red-300">REJECTED:</span> Withdrawal rejected</li>
                  <li><span className="text-gray-300">CANCELLED:</span> Withdrawal cancelled</li>
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
                  <li>• View transaction hash when available</li>
                  <li>• Use filters to find specific withdrawals</li>
                  <li>• Export data for record keeping and analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Verification</h4>
                <ul className="space-y-1">
                  <li>• Email verification status is tracked</li>
                  <li>• 2FA verification status is tracked</li>
                  <li>• Beneficiary information may be linked</li>
                  <li>• Fees are calculated and displayed</li>
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
