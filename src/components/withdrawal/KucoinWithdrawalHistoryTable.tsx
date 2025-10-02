import React, { useState } from 'react'
import { useWithdrawalStore } from '@/store/withdrawal'
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, RefreshCw, Eye, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'

export const KucoinWithdrawalHistoryTable: React.FC = () => {
  const {
    kucoinWithdrawals,
    selectedKucoinWithdrawal,
    isLoading,
    fetchKucoinWithdrawals,
    fetchKucoinWithdrawalDetail,
    clearSelectedKucoinWithdrawal
  } = useWithdrawalStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Filter withdrawals based on search and filters
  const filteredWithdrawals = kucoinWithdrawals.filter(withdrawal => {
    const matchesSearch = searchTerm === '' ||
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (withdrawal.walletTxId && withdrawal.walletTxId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (withdrawal.user?.email && withdrawal.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (withdrawal.user?.username && withdrawal.user.username.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    fetchKucoinWithdrawals()
  }

  const handleViewDetails = (id: string) => {
    fetchKucoinWithdrawalDetail(id)
  }

  const truncateId = (id: string) => {
    if (!id) return 'N/A'
    return `${id.slice(0, 8)}...${id.slice(-4)}`
  }

  const truncateAddress = (address: string) => {
    if (!address) return 'N/A'
    if (address.length <= 20) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const getBlockExplorerUrl = (txHash: string) => {
    if (!txHash) return '#'
    // Default to Etherscan - could be enhanced based on chain detection
    return `https://etherscan.io/tx/${txHash}`
  }

  if (isLoading && kucoinWithdrawals.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading KuCoin withdrawal history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Withdrawals</h2>
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
            placeholder="Search by ID, address, hash, user email..."
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
            <SelectItem value="PROCESSING">Processing</SelectItem>
            <SelectItem value="SUCCESS">Success</SelectItem>
            <SelectItem value="FAILURE">Failure</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 text-sm text-gray-400">
        Showing {filteredWithdrawals.length} of {kucoinWithdrawals.length} withdrawals
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {kucoinWithdrawals.length === 0
                ? 'No KuCoin withdrawals found. Withdrawals will appear here when processed.'
                : 'No withdrawals match your current filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Withdrawal ID</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">User</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Fee</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Address</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Created</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-blue-300 bg-gray-700/50 px-2 py-1 rounded">
                        {truncateId(withdrawal.id)}
                      </code>
                      {withdrawal.walletTxId && (
                        <a
                          href={getBlockExplorerUrl(withdrawal.walletTxId)}
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
                        {withdrawal.user?.email || 'N/A'}
                      </div>
                      {withdrawal.user?.username && (
                        <div className="text-xs text-gray-400">
                          @{withdrawal.user.username}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-red-300">
                      {withdrawal.amount && !isNaN(parseFloat(withdrawal.amount))
                        ? `-${parseFloat(withdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
                        : 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-300">
                      {withdrawal.fee && !isNaN(parseFloat(withdrawal.fee))
                        ? parseFloat(withdrawal.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                        : '0.00'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-xs text-gray-300">
                      {truncateAddress(withdrawal.address)}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <WithdrawalStatusBadge status={withdrawal.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-400">
                      {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      onClick={() => handleViewDetails(withdrawal.id)}
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

      {/* Withdrawal Detail Modal */}
      <Dialog open={!!selectedKucoinWithdrawal} onOpenChange={() => clearSelectedKucoinWithdrawal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KuCoin Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedKucoinWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Withdrawal ID</label>
                  <p className="font-mono text-sm">{selectedKucoinWithdrawal.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">User Email</label>
                  <p className="text-sm">{selectedKucoinWithdrawal.user?.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Amount</label>
                  <p className="text-sm font-mono text-red-300">
                    {selectedKucoinWithdrawal.amount && !isNaN(parseFloat(selectedKucoinWithdrawal.amount))
                      ? `-${parseFloat(selectedKucoinWithdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Fee</label>
                  <p className="text-sm font-mono">
                    {selectedKucoinWithdrawal.fee && !isNaN(parseFloat(selectedKucoinWithdrawal.fee))
                      ? parseFloat(selectedKucoinWithdrawal.fee).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })
                      : '0.00'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Currency</label>
                  <p className="text-sm font-mono">{selectedKucoinWithdrawal.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Chain</label>
                  <p className="text-sm font-mono">{selectedKucoinWithdrawal.chain}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <WithdrawalStatusBadge status={selectedKucoinWithdrawal.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Is Inner</label>
                  <p className="text-sm">{selectedKucoinWithdrawal.isInner ? 'Yes' : 'No'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-400">Destination Address</label>
                  <p className="font-mono text-sm break-all">{selectedKucoinWithdrawal.address}</p>
                </div>
                {selectedKucoinWithdrawal.memo && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-400">Memo</label>
                    <p className="font-mono text-sm">{selectedKucoinWithdrawal.memo}</p>
                  </div>
                )}
                {selectedKucoinWithdrawal.walletTxId && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-400">Transaction Hash</label>
                    <p className="font-mono text-sm break-all">{selectedKucoinWithdrawal.walletTxId}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-400">Created At</label>
                  <p className="text-sm">{format(new Date(selectedKucoinWithdrawal.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Updated At</label>
                  <p className="text-sm">{format(new Date(selectedKucoinWithdrawal.updatedAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
              </div>
              {selectedKucoinWithdrawal.walletTxId && (
                <div className="flex justify-between pt-4 border-t">
                  <a
                    href={getBlockExplorerUrl(selectedKucoinWithdrawal.walletTxId)}
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
