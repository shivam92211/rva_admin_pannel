import React, { useState } from 'react'
import { useWithdrawalStore } from '@/store/withdrawal'
import { WithdrawalStatusBadge } from './WithdrawalStatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, RefreshCw, Eye, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { kucoinApi } from '@/services/kucoinApi'
import type { TransactionStatus } from '@/types/kucoin'

export const WithdrawalHistoryTable: React.FC = () => {
  const { 
    withdrawals, 
    selectedWithdrawal, 
    isLoading, 
    fetchWithdrawals, 
    fetchWithdrawalDetail, 
    loadDummyData, 
    clearSelectedWithdrawal 
  } = useWithdrawalStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [chainFilter, setChainFilter] = useState<string>('all')

  // Get unique values for filters
  const availableCurrencies = Array.from(
    new Set(withdrawals.map(w => w.currency))
  ).sort()
  
  const availableChains = Array.from(
    new Set(withdrawals.map(w => w.chain))
  ).sort()

  // Filter withdrawals based on search and filters
  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const matchesSearch = searchTerm === '' || 
      withdrawal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.walletTxId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || withdrawal.status === statusFilter
    const matchesCurrency = currencyFilter === 'all' || withdrawal.currency === currencyFilter
    const matchesChain = chainFilter === 'all' || withdrawal.chain === chainFilter

    return matchesSearch && matchesStatus && matchesCurrency && matchesChain
  })

  const handleRefresh = () => {
    if (kucoinApi.isBrokerConfigured()) {
      fetchWithdrawals()
    } else {
      loadDummyData()
    }
  }

  const handleViewDetails = (withdrawalId: string) => {
    fetchWithdrawalDetail(withdrawalId)
  }

  const truncateId = (id: string) => {
    return `${id.slice(0, 8)}...${id.slice(-4)}`
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const getBlockExplorerUrl = (chain: string, walletTxId: string) => {
    const explorers: Record<string, string> = {
      'BTC': `https://blockstream.info/tx/${walletTxId}`,
      'ETH': `https://etherscan.io/tx/${walletTxId}`,
      'ERC20': `https://etherscan.io/tx/${walletTxId}`,
      'TRC20': `https://tronscan.org/#/transaction/${walletTxId}`,
      'BEP20': `https://bscscan.com/tx/${walletTxId}`,
      'ADA': `https://cardanoscan.io/transaction/${walletTxId}`,
      'DOT': `https://polkascan.io/polkadot/transaction/${walletTxId}`
    }
    return explorers[chain] || '#'
  }

  if (isLoading && withdrawals.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading withdrawal history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex flex-col min-h-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search withdrawals..."
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

        <Select value={chainFilter} onValueChange={setChainFilter}>
          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
            <SelectValue placeholder="Filter by chain" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Chains</SelectItem>
            {availableChains.map(chain => (
              <SelectItem key={chain} value={chain}>
                {chain}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center text-sm text-gray-400">
          {filteredWithdrawals.length} of {withdrawals.length} withdrawals
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0">
        {filteredWithdrawals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">
              {withdrawals.length === 0 
                ? 'No withdrawals found. Withdrawals will appear here when processed.' 
                : 'No withdrawals match your current filters.'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Withdrawal ID</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Currency</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Amount</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Chain</th>
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
                          href={getBlockExplorerUrl(withdrawal.chain, withdrawal.walletTxId)}
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
                    <span className="text-sm font-medium text-white">
                      {withdrawal.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-red-300">
                      -{parseFloat(withdrawal.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                      {withdrawal.chain}
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

      {withdrawals.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p>
            Withdrawal history shows the latest withdrawal transactions. Use the search and filters to find specific withdrawals.
            {!isLoading && withdrawals.length > 0 && withdrawals[0].id.startsWith('wd_') && (
              <span className="ml-2 text-yellow-500">
                ⚠ Demo data is being displayed
              </span>
            )}
          </p>
        </div>
      )}

      {/* Withdrawal Detail Modal */}
      <Dialog open={!!selectedWithdrawal} onOpenChange={() => clearSelectedWithdrawal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Withdrawal ID</label>
                  <p className="font-mono text-sm">{selectedWithdrawal.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Wallet TX ID</label>
                  <p className="font-mono text-sm break-all">{selectedWithdrawal.walletTxId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">User ID</label>
                  <p className="text-sm font-medium">{selectedWithdrawal.uid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Currency</label>
                  <p className="text-sm font-medium">{selectedWithdrawal.currency}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Amount</label>
                  <p className="text-sm font-mono text-red-300">
                    -{parseFloat(selectedWithdrawal.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Chain</label>
                  <p className="text-sm">{selectedWithdrawal.chain}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <WithdrawalStatusBadge status={selectedWithdrawal.status} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Created At</label>
                  <p className="text-sm">{format(new Date(selectedWithdrawal.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-400">Destination Address</label>
                  <p className="font-mono text-sm break-all">{selectedWithdrawal.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Last Updated</label>
                  <p className="text-sm">{format(new Date(selectedWithdrawal.updatedAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
              </div>
              {selectedWithdrawal.walletTxId && (
                <div className="flex justify-between pt-4 border-t">
                  <a
                    href={getBlockExplorerUrl(selectedWithdrawal.chain, selectedWithdrawal.walletTxId)}
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