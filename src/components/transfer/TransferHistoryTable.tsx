import React, { useState } from 'react'
import { useTransferStore } from '@/store/transfer'
import { TransferStatusBadge } from './TransferStatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { kucoinApi } from '@/services/kucoinApi'
import type { TransactionStatus } from '@/types/kucoin'

export const TransferHistoryTable: React.FC = () => {
  const { transfers, isLoading, fetchSubAccounts, loadDummyData } = useTransferStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')

  // Get unique currencies from transfers
  const availableCurrencies = Array.from(
    new Set(transfers.map(t => t.currency))
  ).sort()

  // Filter transfers based on search and filters
  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = searchTerm === '' || 
      transfer.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.fromUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.toUid.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
    const matchesCurrency = currencyFilter === 'all' || transfer.currency === currencyFilter

    return matchesSearch && matchesStatus && matchesCurrency
  })

  const getTransferDirection = (transfer: { fromUid: string }) => {
    const isBrokerToSub = transfer.fromUid === 'broker_main' || transfer.fromUid.startsWith('broker')
    return isBrokerToSub ? 'OUT' : 'IN'
  }

  const getTransferLabel = (transfer: { fromUid: string }) => {
    const direction = getTransferDirection(transfer)
    return direction === 'OUT' ? 'Broker → Sub' : 'Sub → Broker'
  }

  const handleRefresh = () => {
    if (kucoinApi.isBrokerConfigured()) {
      fetchSubAccounts()
    } else {
      loadDummyData()
    }
  }

  if (isLoading && transfers.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading transfer history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Transfer History</h2>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="sm"
          className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search transfers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <Select value={statusFilter} onValueChange={(value: TransactionStatus | 'all') => setStatusFilter(value)}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="FAILURE">Failed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Filter by currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Currencies</SelectItem>
            {availableCurrencies.map(currency => (
              <SelectItem key={currency} value={currency}>
                {currency}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center text-sm text-gray-400">
          {filteredTransfers.length} of {transfers.length} transfers
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {filteredTransfers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {transfers.length === 0 
                ? 'No transfers found. Create your first transfer above.' 
                : 'No transfers match your current filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Order ID</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Direction</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Currency</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">From</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">To</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.orderId} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <code className="text-sm text-blue-300 bg-gray-700/50 px-2 py-1 rounded">
                      {transfer.orderId}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300">
                      {getTransferLabel(transfer)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-white">
                      {transfer.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-green-300">
                      {parseFloat(transfer.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-300">
                      <div>{transfer.fromUid}</div>
                      <div className="text-gray-500">{transfer.fromAccountType}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-xs text-gray-300">
                      <div>{transfer.toUid}</div>
                      <div className="text-gray-500">{transfer.toAccountType}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <TransferStatusBadge status={transfer.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-400">
                      {format(new Date(transfer.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {transfers.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p>
            Transfer history shows the latest transfers. Use the search and filters to find specific transactions.
            {!isLoading && transfers.length > 0 && transfers[0].orderId.startsWith('txn_') && (
              <span className="ml-2 text-yellow-500">
                ⚠ Demo data is being displayed
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}