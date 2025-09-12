import React, { useState } from 'react'
import { useDepositStore } from '@/store/deposit'
import { DepositStatusBadge } from './DepositStatusBadge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Search, RefreshCw, Eye, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { kucoinApi } from '@/services/kucoinApi'
import type { TransactionStatus } from '@/types/kucoin'

export const DepositHistoryTable: React.FC = () => {
  const { 
    deposits, 
    selectedDeposit, 
    isLoading, 
    fetchDeposits, 
    fetchDepositDetail, 
    loadDummyData, 
    clearSelectedDeposit 
  } = useDepositStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TransactionStatus | 'all'>('all')
  const [currencyFilter, setCurrencyFilter] = useState<string>('all')
  const [chainFilter, setChainFilter] = useState<string>('all')

  // Get unique values for filters
  const availableCurrencies = Array.from(
    new Set(deposits.map(d => d.currency))
  ).sort()
  
  const availableChains = Array.from(
    new Set(deposits.map(d => d.chain))
  ).sort()

  // Filter deposits based on search and filters
  const filteredDeposits = deposits.filter(deposit => {
    const matchesSearch = searchTerm === '' || 
      deposit.hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.uid.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || deposit.status === statusFilter
    const matchesCurrency = currencyFilter === 'all' || deposit.currency === currencyFilter
    const matchesChain = chainFilter === 'all' || deposit.chain === chainFilter

    return matchesSearch && matchesStatus && matchesCurrency && matchesChain
  })

  const handleRefresh = () => {
    if (kucoinApi.isBrokerConfigured()) {
      fetchDeposits()
    } else {
      loadDummyData()
    }
  }

  const handleViewDetails = (currency: string, hash: string) => {
    fetchDepositDetail(currency, hash)
  }

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`
  }

  const truncateAddress = (address: string) => {
    if (address.length <= 20) return address
    return `${address.slice(0, 8)}...${address.slice(-8)}`
  }

  const getBlockExplorerUrl = (chain: string, hash: string) => {
    const explorers: Record<string, string> = {
      'BTC': `https://blockstream.info/tx/${hash}`,
      'ETH': `https://etherscan.io/tx/${hash}`,
      'ERC20': `https://etherscan.io/tx/${hash}`,
      'TRC20': `https://tronscan.org/#/transaction/${hash}`,
      'BEP20': `https://bscscan.com/tx/${hash}`,
      'ADA': `https://cardanoscan.io/transaction/${hash}`,
      'DOT': `https://polkascan.io/polkadot/transaction/${hash}`
    }
    return explorers[chain] || '#'
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search deposits..."
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
          {filteredDeposits.length} of {deposits.length} deposits
        </div>
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
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Transaction Hash</th>
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
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.hash} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm text-blue-300 bg-gray-700/50 px-2 py-1 rounded">
                        {truncateHash(deposit.hash)}
                      </code>
                      <a
                        href={getBlockExplorerUrl(deposit.chain, deposit.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-medium text-white">
                      {deposit.currency}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-mono text-green-300">
                      {parseFloat(deposit.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-300 bg-gray-700/30 px-2 py-1 rounded">
                      {deposit.chain}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-xs text-gray-300">
                      {truncateAddress(deposit.address)}
                    </code>
                  </td>
                  <td className="py-3 px-4">
                    <DepositStatusBadge status={deposit.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-gray-400">
                      {format(new Date(deposit.createdAt), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Button
                      onClick={() => handleViewDetails(deposit.currency, deposit.hash)}
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

      {deposits.length > 0 && (
        <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-4">
          <p>
            Deposit history shows the latest deposit transactions. Use the search and filters to find specific deposits.
            {!isLoading && deposits.length > 0 && deposits[0].hash.startsWith('0x') && (
              <span className="ml-2 text-yellow-500">
                ⚠ Demo data is being displayed
              </span>
            )}
          </p>
        </div>
      )}

      {/* Deposit Detail Modal */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => clearSelectedDeposit()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
          </DialogHeader>
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-400">Transaction Hash</label>
                  <p className="font-mono text-sm break-all">{selectedDeposit.hash}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Wallet TX ID</label>
                  <p className="font-mono text-sm">{selectedDeposit.walletTxId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Currency</label>
                  <p className="text-sm font-medium">{selectedDeposit.uid}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Amount</label>
                  <p className="text-sm font-mono text-green-300">
                    {parseFloat(selectedDeposit.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Chain</label>
                  <p className="text-sm">{selectedDeposit.chain}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <DepositStatusBadge status={selectedDeposit.status} />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-400">Deposit Address</label>
                  <p className="font-mono text-sm break-all">{selectedDeposit.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Created At</label>
                  <p className="text-sm">{format(new Date(selectedDeposit.createdAt), 'MMM dd, yyyy HH:mm:ss')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-400">Type</label>
                  <p className="text-sm">{selectedDeposit.isInner ? 'Internal' : 'External'}</p>
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t">
                <a
                  href={getBlockExplorerUrl(selectedDeposit.chain, selectedDeposit.hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Block Explorer</span>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}