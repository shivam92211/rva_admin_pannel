import React, { useState, useEffect } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { TradingPairForm } from '@/components/tradingpair/TradingPairForm'
import { TradingPairDetailsDialog } from '@/components/tradingpair/TradingPairDetailsDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Play,
  Pause,
  Square,
  Trash2,
  TrendingUp
} from 'lucide-react'
import { 
  cexAdminClient,
  TradingPairResponseDto
} from '@/services/cexengineAdminApi'
import { cexBotApi } from '@/services/cexbotApi'
import RefreshButton from '@/components/common/RefreshButton'
import { useSnackbarMsg } from '@/hooks/snackbar'

const TradingPairsView: React.FC = () => {
  const [, setSnackbarMsg] = useSnackbarMsg()
  
  const [tradingPairs, setTradingPairs] = useState<TradingPairResponseDto[]>([])
  const [allTradingPairs, setAllTradingPairs] = useState<TradingPairResponseDto[]>([]) // For filters
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [baseAssetFilter, setBaseAssetFilter] = useState<string>('all')
  const [quoteAssetFilter, setQuoteAssetFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10

  // Dialog states
  const [showForm, setShowForm] = useState(false)
  const [selectedTradingPair, setSelectedTradingPair] = useState<TradingPairResponseDto | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [tradingPairToDelete, setTradingPairToDelete] = useState<TradingPairResponseDto | null>(null)
  
  // Bot control states
  const [activeBotPairs, setActiveBotPairs] = useState<Set<string>>(new Set())
  const [botLoading, setBotLoading] = useState<Set<string>>(new Set())
  const [botConfirmOpen, setBotConfirmOpen] = useState(false)
  const [botAction, setBotAction] = useState<{type: 'add' | 'remove', pair: TradingPairResponseDto} | null>(null)

  // Market operation confirmation states
  const [marketActionConfirmOpen, setMarketActionConfirmOpen] = useState(false)
  const [marketAction, setMarketAction] = useState<{type: 'activate' | 'deactivate' | 'suspend', pair: TradingPairResponseDto} | null>(null)

  const loadActiveBotPairs = React.useCallback(async () => {
    try {
      const response = await cexBotApi.getBotPairs()
      setActiveBotPairs(new Set(response.pairs))
    } catch (error: any) {
      console.error('Failed to load bot pairs:', error)
      setActiveBotPairs(new Set())
    }
  }, [])

  const loadTradingPairs = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await cexAdminClient.getTradingPairs()
      setAllTradingPairs(response) // Store all pairs for filter options
      
      // Apply client-side filtering
      let filteredPairs = response

      if (searchTerm) {
        filteredPairs = filteredPairs.filter(pair => 
          pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pair.baseAsset.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pair.quoteAsset.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }

      if (statusFilter !== 'all') {
        filteredPairs = filteredPairs.filter(pair => pair.status === statusFilter)
      }

      if (baseAssetFilter !== 'all') {
        filteredPairs = filteredPairs.filter(pair => pair.baseAsset === baseAssetFilter)
      }

      if (quoteAssetFilter !== 'all') {
        filteredPairs = filteredPairs.filter(pair => pair.quoteAsset === quoteAssetFilter)
      }

      // Client-side pagination
      const startIndex = (currentPage - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedPairs = filteredPairs.slice(startIndex, endIndex)

      setTradingPairs(paginatedPairs)
      setTotal(filteredPairs.length)
      setTotalPages(Math.ceil(filteredPairs.length / pageSize))
    } catch (error: any) {
      console.error('Failed to load trading pairs:', error)
      setTradingPairs([])
      setAllTradingPairs([])
      setTotalPages(1)
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, searchTerm, statusFilter, baseAssetFilter, quoteAssetFilter])

  useEffect(() => {
    loadTradingPairs()
    loadActiveBotPairs()
  }, [loadTradingPairs, loadActiveBotPairs])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleBaseAssetFilter = (value: string) => {
    setBaseAssetFilter(value)
    setCurrentPage(1)
  }

  const handleQuoteAssetFilter = (value: string) => {
    setQuoteAssetFilter(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleTradingPairRowClick = (tradingPair: TradingPairResponseDto) => {
    setSelectedTradingPair(tradingPair)
    setDetailsDialogOpen(true)
  }

  const handleActivateMarket = async (symbol: string) => {
    try {
      setLoading(true)
      await cexAdminClient.activateMarket(symbol)
      await loadTradingPairs()
      setSnackbarMsg({ 
        msg: `Market ${symbol} activated successfully`, 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Failed to activate market:', error)
      setSnackbarMsg({ 
        msg: `Failed to activate market ${symbol}: ${error.message || 'Unknown error'}`, 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivateMarket = async (symbol: string) => {
    try {
      setLoading(true)
      await cexAdminClient.deactivateMarket(symbol)
      await loadTradingPairs()
      setSnackbarMsg({ 
        msg: `Market ${symbol} deactivated successfully`, 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Failed to deactivate market:', error)
      setSnackbarMsg({ 
        msg: `Failed to deactivate market ${symbol}: ${error.message || 'Unknown error'}`, 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuspendMarket = async (symbol: string) => {
    try {
      setLoading(true)
      await cexAdminClient.suspendMarket(symbol)
      await loadTradingPairs()
      setSnackbarMsg({ 
        msg: `Market ${symbol} suspended successfully`, 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Failed to suspend market:', error)
      setSnackbarMsg({ 
        msg: `Failed to suspend market ${symbol}: ${error.message || 'Unknown error'}`, 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTradingPair = async (symbol: string) => {
    try {
      setLoading(true)
      await cexAdminClient.deleteTradingPair(symbol)
      await loadTradingPairs()
      await loadActiveBotPairs() // Refresh bot pairs in case the deleted pair was active
      setDeleteConfirmOpen(false)
      setTradingPairToDelete(null)
      setSnackbarMsg({ 
        msg: `Trading pair ${symbol} deleted successfully`, 
        type: 'success' 
      })
    } catch (error: any) {
      console.error('Failed to delete trading pair:', error)
      setSnackbarMsg({ 
        msg: `Failed to delete trading pair ${symbol}: ${error.message || 'Unknown error'}`, 
        type: 'error' 
      })
    } finally {
      setLoading(false)
    }
  }

  const openDeleteConfirm = (tradingPair: TradingPairResponseDto) => {
    setTradingPairToDelete(tradingPair)
    setDeleteConfirmOpen(true)
  }

  const handleMarketActionClick = (type: 'activate' | 'deactivate' | 'suspend', pair: TradingPairResponseDto) => {
    setMarketAction({ type, pair })
    setMarketActionConfirmOpen(true)
  }

  const confirmMarketAction = async () => {
    if (!marketAction) return

    const { type, pair } = marketAction
    
    try {
      switch (type) {
        case 'activate':
          await handleActivateMarket(pair.symbol)
          break
        case 'deactivate':
          await handleDeactivateMarket(pair.symbol)
          break
        case 'suspend':
          await handleSuspendMarket(pair.symbol)
          break
      }
    } finally {
      setMarketActionConfirmOpen(false)
      setMarketAction(null)
    }
  }

  const handleBotToggleClick = (pair: TradingPairResponseDto) => {
    const isActive = activeBotPairs.has(pair.symbol)
    setBotAction({
      type: isActive ? 'remove' : 'add',
      pair: pair
    })
    setBotConfirmOpen(true)
  }

  const confirmBotAction = async () => {
    if (!botAction) return

    const { type, pair } = botAction
    setBotLoading(prev => new Set(prev).add(pair.symbol))

    try {
      if (type === 'add') {
        await cexBotApi.addBotPair(pair.symbol)
        setSnackbarMsg({ 
          msg: `Market bot enabled for ${pair.symbol}`, 
          type: 'success' 
        })
      } else {
        await cexBotApi.removeBotPair(pair.symbol)
        setSnackbarMsg({ 
          msg: `Market bot disabled for ${pair.symbol}`, 
          type: 'success' 
        })
      }
      
      // Refresh bot pairs to update UI
      await loadActiveBotPairs()
    } catch (error: any) {
      console.error(`Failed to ${type} bot pair:`, error)
      setSnackbarMsg({ 
        msg: `Failed to ${type === 'add' ? 'enable' : 'disable'} market bot for ${pair.symbol}: ${error.message || 'Unknown error'}`, 
        type: 'error' 
      })
    } finally {
      setBotLoading(prev => {
        const newSet = new Set(prev)
        newSet.delete(pair.symbol)
        return newSet
      })
      setBotConfirmOpen(false)
      setBotAction(null)
    }
  }

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
      }`}>
        {status}
      </span>
    )
  }

  // Get unique assets for filters
  const uniqueBaseAssets = [...new Set(allTradingPairs.map(pair => pair.baseAsset))].sort()
  const uniqueQuoteAssets = [...new Set(allTradingPairs.map(pair => pair.quoteAsset))].sort()

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Trading Pairs"
        description="Create and manage trading pairs for the exchange"
      >
        <div className="flex gap-2">
          <RefreshButton onClick={() => {
            loadTradingPairs()
            loadActiveBotPairs()
          }} />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Trading Pair
          </Button>
        </div>
      </PageHeader>

      <div className="flex-1 p-6 overflow-hidden">
        <div className="bg-card rounded-lg p-6 h-full flex flex-col">
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6 flex-shrink-0">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search trading pairs..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-40">
              <Select value={statusFilter} onValueChange={handleStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={baseAssetFilter} onValueChange={handleBaseAssetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Base Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Base</SelectItem>
                  {uniqueBaseAssets.map(asset => (
                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <Select value={quoteAssetFilter} onValueChange={handleQuoteAssetFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Quote Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quote</SelectItem>
                  {uniqueQuoteAssets.map(asset => (
                    <SelectItem key={asset} value={asset}>{asset}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              {total} pair{total !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-hidden rounded-md border">
            <div className="h-full overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Base Asset</TableHead>
                    <TableHead>Quote Asset</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Min Order Size</TableHead>
                    <TableHead>Maker Fee</TableHead>
                    <TableHead>Taker Fee</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                        Loading trading pairs...
                      </TableCell>
                    </TableRow>
                  ) : tradingPairs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No trading pairs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    tradingPairs.map((pair) => (
                      <TableRow
                        key={pair.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleTradingPairRowClick(pair)}
                      >
                        <TableCell className="font-medium font-mono">{pair.symbol}</TableCell>
                        <TableCell>{pair.baseAsset}</TableCell>
                        <TableCell>{pair.quoteAsset}</TableCell>
                        <TableCell>
                          {getStatusBadge(pair.status)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {pair.minOrderSize} {pair.baseAsset}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{pair.makerFeeRate}%</TableCell>
                        <TableCell className="font-mono text-sm">{pair.takerFeeRate}%</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(pair.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            {/* Market Bot Control - Most Prominent */}
                            <Button
                              variant={activeBotPairs.has(pair.symbol) ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleBotToggleClick(pair)}
                              disabled={botLoading.has(pair.symbol)}
                              className={`h-8 px-3 font-medium ${
                                activeBotPairs.has(pair.symbol) 
                                  ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                  : "border-green-200 text-green-600 hover:bg-green-100 hover:text-green-950 hover:border-green-300"
                              }`}
                              title={activeBotPairs.has(pair.symbol) ? "Disable Market Bot" : "Enable Market Bot"}
                            >
                              {botLoading.has(pair.symbol) ? (
                                <RefreshCw className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  {activeBotPairs.has(pair.symbol) ? (
                                    <>
                                      <Square className="h-3 w-3 mr-1" />
                                      OFF
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-3 w-3 mr-1" />
                                      ON
                                    </>
                                  )}
                                </>
                              )}
                            </Button>
                            
                            {/* Market Status Controls */}
                            {pair.status === 'ACTIVE' ? (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarketActionClick('suspend', pair)}
                                  disabled={loading}
                                  className="h-8 w-8 p-0"
                                  title="Suspend"
                                >
                                  <Pause className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleMarketActionClick('deactivate', pair)}
                                  disabled={loading}
                                  className="h-8 w-8 p-0"
                                  title="Deactivate"
                                >
                                  <Square className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarketActionClick('activate', pair)}
                                disabled={loading}
                                className="h-8 w-8 p-0"
                                title="Activate"
                              >
                                <Play className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteConfirm(pair)}
                              disabled={loading}
                              className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4 flex-shrink-0">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    if (page === 1 || page === totalPages) return true
                    if (Math.abs(page - currentPage) <= 1) return true
                    return false
                  })
                  .map((page, index, pages) => {
                    const showEllipsis = index > 0 && page - pages[index - 1] > 1

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-3 py-1 text-sm text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    )
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Trading Pair Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Create New Trading Pair
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to create a new trading pair
            </DialogDescription>
          </DialogHeader>
          <TradingPairForm 
            onSuccess={() => {
              setShowForm(false)
              loadTradingPairs()
              loadActiveBotPairs()
              setSnackbarMsg({ 
                msg: 'Trading pair created successfully', 
                type: 'success' 
              })
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Trading Pair Details Dialog */}
      <TradingPairDetailsDialog
        tradingPair={selectedTradingPair}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trading Pair</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the trading pair{' '}
              <span className="font-mono font-bold">{tradingPairToDelete?.symbol}</span>?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => tradingPairToDelete && handleDeleteTradingPair(tradingPairToDelete.symbol)}
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bot Toggle Confirmation Dialog */}
      <Dialog open={botConfirmOpen} onOpenChange={setBotConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {botAction?.type === 'add' ? 'Enable' : 'Disable'} Market Bot
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{' '}
              <span className="font-semibold">
                {botAction?.type === 'add' ? 'enable' : 'disable'}
              </span>{' '}
              the market bot for trading pair{' '}
              <span className="font-mono font-bold">{botAction?.pair.symbol}</span>?
              {botAction?.type === 'add' && (
                <>
                  <br /><br />
                  <span className="text-sm text-muted-foreground">
                    This will start automated market making for this trading pair.
                  </span>
                </>
              )}
              {botAction?.type === 'remove' && (
                <>
                  <br /><br />
                  <span className="text-sm text-muted-foreground">
                    This will stop automated market making and cancel all active orders for this trading pair.
                  </span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setBotConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={botAction?.type === 'add' ? 'default' : 'destructive'}
              onClick={confirmBotAction}
              disabled={!!botAction && botLoading.has(botAction.pair.symbol)}
            >
              {botAction && botLoading.has(botAction.pair.symbol) ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {botAction.type === 'add' ? 'Enabling...' : 'Disabling...'}
                </>
              ) : (
                botAction?.type === 'add' ? 'Enable Bot' : 'Disable Bot'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Market Action Confirmation Dialog */}
      <Dialog open={marketActionConfirmOpen} onOpenChange={setMarketActionConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {marketAction?.type === 'activate' && 'Activate Market'}
              {marketAction?.type === 'deactivate' && 'Deactivate Market'}
              {marketAction?.type === 'suspend' && 'Suspend Market'}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to{' '}
              <span className="font-semibold">{marketAction?.type}</span>{' '}
              the market for trading pair{' '}
              <span className="font-mono font-bold">{marketAction?.pair.symbol}</span>?
              <br /><br />
              <span className="text-sm text-muted-foreground">
                {marketAction?.type === 'activate' && 'This will make the trading pair available for trading.'}
                {marketAction?.type === 'deactivate' && 'This will disable trading for this pair and cancel all active orders.'}
                {marketAction?.type === 'suspend' && 'This will temporarily halt trading while keeping the pair configured.'}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMarketActionConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={marketAction?.type === 'activate' ? 'default' : 'destructive'}
              onClick={confirmMarketAction}
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  {marketAction?.type === 'activate' && 'Activating...'}
                  {marketAction?.type === 'deactivate' && 'Deactivating...'}
                  {marketAction?.type === 'suspend' && 'Suspending...'}
                </>
              ) : (
                <>
                  {marketAction?.type === 'activate' && 'Activate Market'}
                  {marketAction?.type === 'deactivate' && 'Deactivate Market'}
                  {marketAction?.type === 'suspend' && 'Suspend Market'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TradingPairsView
