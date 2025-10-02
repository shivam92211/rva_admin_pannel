import React, { useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { DepositHistoryTable } from '@/components/deposit/DepositHistoryTable'
import { Button } from '@/components/ui/button'
import { useDepositStore } from '@/store/deposit'
import { Download } from 'lucide-react'

const DepositsView: React.FC = () => {
  const { fetchDeposits, deposits, error, clearError } = useDepositStore()

  useEffect(() => {
    // Fetch deposits from database when component mounts
    fetchDeposits()
  }, [fetchDeposits])

  const handleExport = () => {
    // Create CSV export of deposits
    if (deposits.length === 0) return

    const csvHeaders = ['ID', 'User Email', 'Hash', 'Amount', 'Status', 'Confirmations', 'To Address', 'Created At', 'Updated At']
    const csvRows = deposits.map(deposit => [
      deposit.id,
      deposit.user?.email || 'N/A',
      deposit.txHash,
      deposit.amount,
      deposit.status,
      `${deposit.confirmations}/${deposit.requiredConfirmations}`,
      deposit.toAddress,
      new Date(deposit.createdAt).toISOString(),
      new Date(deposit.updatedAt).toISOString()
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deposits_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Deposits"
        description="Monitor deposit activities and transactions"
      >
        <Button
          variant="outline"
          onClick={handleExport}
          disabled={deposits.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
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
                    Error Loading Deposits
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

          {/* Deposit History */}
          <DepositHistoryTable />

          {/* Help Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Deposit Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Deposit Status</h4>
                <ul className="space-y-1">
                  <li><span className="text-green-300">COMPLETED:</span> Deposit confirmed and credited</li>
                  <li><span className="text-blue-300">CONFIRMED:</span> Transaction confirmed</li>
                  <li><span className="text-yellow-300">PENDING:</span> Awaiting network confirmation</li>
                  <li><span className="text-red-300">FAILED:</span> Deposit failed or rejected</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Important Notes</h4>
                <ul className="space-y-1">
                  <li>• Deposit confirmation times vary by network</li>
                  <li>• Always verify the deposit address before sending</li>
                  <li>• Check minimum deposit amounts for each currency</li>
                  <li>• Confirmations are tracked automatically</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Transaction Details</h4>
                <ul className="space-y-1">
                  <li>• Click the eye icon to view full deposit details</li>
                  <li>• View transaction hash and address information</li>
                  <li>• Use filters to find specific deposits</li>
                  <li>• Export data for record keeping</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">User Information</h4>
                <ul className="space-y-1">
                  <li>• Each deposit is linked to a specific user</li>
                  <li>• View user details in the deposit table</li>
                  <li>• Filter deposits by user ID</li>
                  <li>• Track confirmation progress</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DepositsView
