import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { TradingPairResponseDto } from '@/services/cexengineAdminApi'
import { 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  Settings,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle,
  Image as ImageIcon
} from 'lucide-react'

interface TradingPairDetailsDialogProps {
  tradingPair: TradingPairResponseDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const TradingPairDetailsDialog: React.FC<TradingPairDetailsDialogProps> = ({
  tradingPair,
  open,
  onOpenChange,
}) => {
  if (!tradingPair) return null

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString()
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

  const getOrderTypeIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  const formatPercentage = (value: string) => {
    return `${value}%`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trading Pair Details - {tradingPair.symbol}
          </DialogTitle>
          <DialogDescription>
            Complete configuration and information for {tradingPair.symbol}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Symbol</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded font-bold">
                  {tradingPair.symbol}
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Base Asset</label>
                <p className="text-sm font-medium">{tradingPair.baseAsset}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Quote Asset</label>
                <p className="text-sm font-medium">{tradingPair.quoteAsset}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Base Precision</label>
                <p className="text-sm">{tradingPair.baseAssetPrecision} decimals</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Quote Precision</label>
                <p className="text-sm">{tradingPair.quoteAssetPrecision} decimals</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground mr-2">Status</label>
                {getStatusBadge(tradingPair.status)}
              </div>
            </div>
            {tradingPair.description && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{tradingPair.description}</p>
              </div>
            )}
            {tradingPair.tags && tradingPair.tags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tags</label>
                <div className="flex flex-wrap gap-1">
                  {tradingPair.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Size Limits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Order Size Limits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Min Order Size</label>
                <p className="text-sm font-mono">{tradingPair.minOrderSize} {tradingPair.baseAsset}</p>
              </div>
              {tradingPair.maxOrderSize && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Max Order Size</label>
                  <p className="text-sm font-mono">{tradingPair.maxOrderSize} {tradingPair.baseAsset}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Min Order Value</label>
                <p className="text-sm font-mono">{tradingPair.minOrderValue} {tradingPair.quoteAsset}</p>
              </div>
              {tradingPair.maxOrderValue && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Max Order Value</label>
                  <p className="text-sm font-mono">{tradingPair.maxOrderValue} {tradingPair.quoteAsset}</p>
                </div>
              )}
            </div>
          </div>

          {/* Increment Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Increment Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tick Size</label>
                <p className="text-sm font-mono">{tradingPair.tickSize}</p>
                <p className="text-xs text-muted-foreground">Minimum price increment</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Lot Size</label>
                <p className="text-sm font-mono">{tradingPair.lotSize}</p>
                <p className="text-xs text-muted-foreground">Minimum quantity increment</p>
              </div>
            </div>
          </div>

          {/* Fee Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fee Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Maker Fee Rate</label>
                <p className="text-sm font-mono">{formatPercentage(tradingPair.makerFeeRate)}</p>
                <p className="text-xs text-muted-foreground">Fee for limit orders that add liquidity</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Taker Fee Rate</label>
                <p className="text-sm font-mono">{formatPercentage(tradingPair.takerFeeRate)}</p>
                <p className="text-xs text-muted-foreground">Fee for market orders that remove liquidity</p>
              </div>
            </div>
          </div>

          {/* Order Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Enabled Order Types
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                {getOrderTypeIcon(tradingPair.isMarketOrderEnabled)}
                <span className="text-sm">Market Orders</span>
                <Badge variant={tradingPair.isMarketOrderEnabled ? 'default' : 'secondary'}>
                  {tradingPair.isMarketOrderEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getOrderTypeIcon(tradingPair.isLimitOrderEnabled)}
                <span className="text-sm">Limit Orders</span>
                <Badge variant={tradingPair.isLimitOrderEnabled ? 'default' : 'secondary'}>
                  {tradingPair.isLimitOrderEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getOrderTypeIcon(tradingPair.isStopOrderEnabled)}
                <span className="text-sm">Stop Orders</span>
                <Badge variant={tradingPair.isStopOrderEnabled ? 'default' : 'secondary'}>
                  {tradingPair.isStopOrderEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getOrderTypeIcon(tradingPair.isIcebergOrderEnabled)}
                <span className="text-sm">Iceberg Orders</span>
                <Badge variant={tradingPair.isIcebergOrderEnabled ? 'default' : 'secondary'}>
                  {tradingPair.isIcebergOrderEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {getOrderTypeIcon(tradingPair.isHiddenOrderEnabled)}
                <span className="text-sm">Hidden Orders</span>
                <Badge variant={tradingPair.isHiddenOrderEnabled ? 'default' : 'secondary'}>
                  {tradingPair.isHiddenOrderEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </div>

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Trading Pair ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{tradingPair.id}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Created By</label>
                <p className="text-sm">{tradingPair.createdBy || '—'}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">{formatDate(tradingPair.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated At
                </label>
                <p className="text-sm">{formatDate(tradingPair.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Trading Pair Image */}
          {tradingPair.imageUrl && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Trading Pair Image
              </h3>
              <div className="flex justify-center">
                <img
                  src={tradingPair.imageUrl}
                  alt={`${tradingPair.symbol} logo`}
                  className="w-24 h-24 rounded-lg object-cover border"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}