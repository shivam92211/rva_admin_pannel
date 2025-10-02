import React, { useState } from 'react'
import { useDepositStore } from '@/store/deposit'
import { DepositStatusBadge } from './DepositStatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, RefreshCw, Eye, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

export const DepositHistoryTable: React.FC = () => {
  const {
    deposits,
    selectedDeposit,
    isLoading,
    fetchDeposits,
    fetchDepositDetail,
    clearSelectedDeposit
  } = useDepositStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter deposits based on search and filters
  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = searchTerm === '' ||
      (deposit.walletTxId && deposit.walletTxId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      deposit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deposit.user?.email && deposit.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (deposit.user?.username && deposit.user.username.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    fetchDeposits()
  }

  const handleViewDetails = (id: string) => {
    fetchDepositDetail(id)
  }

  const truncateHash = (hash: string) => {
    if (!hash) return 'N/A'
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A'
    if (address.length <= 20) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const getBlockExplorerUrl = (chain: string, txId: string) => {
    if (!txId) return '#'
    const explorers: Record<string, string> = {
      'BTC': `https://blockstream.info/tx/${txId}`,
      'ETH': `https://etherscan.io/tx/${txId}`,
      'ERC20': `https://etherscan.io/tx/${txId}`,
      'TRC20': `https://tronscan.org/#/transaction/${txId}`,
      'BEP20': `https://bscscan.com/tx/${txId}`,
    }
    return explorers[chain] || `https://etherscan.io/tx/${txId}`
  }

  const formatTimestamp = (timestamp: string | number) => {
    if (!timestamp) return 'N/A'
    try {
      // Handle both string and number timestamps
      const numTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp

      // Check if it's a valid number
      if (isNaN(numTimestamp)) return 'N/A'

      const date = new Date(numTimestamp)

      // Check if date is valid
      if (isNaN(date.getTime())) return 'N/A'

      return format(date, 'MMM dd, yyyy HH:mm')
    } catch (error) {
      console.error('Error formatting timestamp:', timestamp, error)
      return 'N/A'
    }
  }

  if (isLoading && deposits.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading deposit history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Deposit History</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by txId, address, currency, user email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
      </div>

      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredDeposits.length} of {deposits.length} deposits
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {filteredDeposits.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {deposits.length === 0
                ? 'No deposits found. Deposits will appear here when received.'
                : 'No deposits match your current filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Wallet TX ID</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Currency</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Chain</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Created</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-blue-300 bg-gray-700/50 px-2 py-1 rounded">
                        {truncateHash(deposit.walletTxId || deposit.id)}
                      </code>
                      {deposit.walletTxId && (
                        <a
                          href={getBlockExplorerUrl(deposit.chain, deposit.walletTxId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm">
                      <div className="text-white font-medium">
                        {deposit.user?.email || 'N/A'}
                      </div>
                      {deposit.user?.username && (
                        <div className="text-xs text-gray-400">
                          @{deposit.user.username}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-white">
                      {deposit.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-green-300">
                      {deposit.amount && !isNaN(parseFloat(deposit.amount))
                        ? parseFloat(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                        : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                      {deposit.chain}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <DepositStatusBadge status={deposit.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(deposit.createdAt)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      onClick={() => handleViewDetails(deposit.id)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-white"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Deposit Detail Modal */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => clearSelectedDeposit()}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-6">
              {/* Transaction Information */}
              <div>
                <h3 className="text-md font-semibold text-white mb-3 border-b border-gray-700 pb-2">Transaction Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Deposit ID</label>
                    <p className="font-mono text-sm break-all">{selectedDeposit.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Wallet TX ID</label>
                    <p className="font-mono text-sm break-all">{selectedDeposit.walletTxId || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Currency</label>
                    <p className="text-sm font-medium">{selectedDeposit.currency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Chain</label>
                    <p className="text-sm">{selectedDeposit.chain}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Amount</label>
                    <p className="text-sm font-mono text-green-300">
                      {selectedDeposit.amount && !isNaN(parseFloat(selectedDeposit.amount))
                        ? `${parseFloat(selectedDeposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${selectedDeposit.currency}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Fee</label>
                    <p className="text-sm font-mono">
                      {selectedDeposit.fee && !isNaN(parseFloat(selectedDeposit.fee))
                        ? `${parseFloat(selectedDeposit.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })} ${selectedDeposit.currency}`
                        : '0.00'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Status</label>
                    <div className="mt-1">
                      <DepositStatusBadge status={selectedDeposit.status} />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Type</label>
                    <p className="text-sm">{selectedDeposit.isInner ? 'Internal Transfer' : 'External Deposit'}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className="text-md font-semibold text-white mb-3 border-b border-gray-700 pb-2">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Email</label>
                    <p className="text-sm">{selectedDeposit.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Username</label>
                    <p className="text-sm">{selectedDeposit.user?.username || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-md font-semibold text-white mb-3 border-b border-gray-700 pb-2">Address Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">From Address</label>
                    <p className="font-mono text-sm break-all">{selectedDeposit.address}</p>
                  </div>
                  {selectedDeposit.memo && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Memo</label>
                      <p className="font-mono text-sm">{selectedDeposit.memo}</p>
                    </div>
                  )}
                  {selectedDeposit.depositAddress && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Deposit Address (User's Wallet)</label>
                        <p className="font-mono text-sm break-all">{selectedDeposit.depositAddress.address}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-400">Chain Name</label>
                          <p className="text-sm">{selectedDeposit.depositAddress.chainName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-400">Balance</label>
                          <p className="text-sm font-mono">{selectedDeposit.depositAddress.balance}</p>
                        </div>
                        {selectedDeposit.depositAddress.contractAddress && (
                          <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-400">Contract Address</label>
                            <p className="font-mono text-sm break-all">{selectedDeposit.depositAddress.contractAddress}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-400">Address Status</label>
                          <p className="text-sm">{selectedDeposit.depositAddress.isActive ? 'Active' : 'Inactive'}</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-md font-semibold text-white mb-3 border-b border-gray-700 pb-2">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400">Created At</label>
                    <p className="text-sm">{formatTimestamp(selectedDeposit.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400">Updated At</label>
                    <p className="text-sm">{formatTimestamp(selectedDeposit.updatedAt)}</p>
                  </div>
                  {selectedDeposit.remark && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-400">Remark</label>
                      <p className="text-sm">{selectedDeposit.remark}</p>
                    </div>
                  )}
                  {selectedDeposit.kucoinDepositId && (
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-400">KuCoin Deposit ID</label>
                      <p className="font-mono text-sm">{selectedDeposit.kucoinDepositId}</p>
                    </div>
                  )}
                </div>
              </div>

              {selectedDeposit.walletTxId && (
                <div className="flex justify-between pt-4 border-t border-gray-700">
                  <a
                    href={getBlockExplorerUrl(selectedDeposit.chain, selectedDeposit.walletTxId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View on Block Explorer</span>
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
