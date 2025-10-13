import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cexAdminClient, CreateTradingPairDto, TradingPairsStatus } from '@/services/cexengineAdminApi'

interface TradingPairFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const TradingPairForm: React.FC<TradingPairFormProps> = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState<CreateTradingPairDto>({
    symbol: '',
    baseAsset: '',
    quoteAsset: '',
    baseAssetPrecision: 8,
    quoteAssetPrecision: 2,
    minOrderSize: '',
    minOrderValue: '',
    maxOrderSize: '',
    maxOrderValue: '',
    tickSize: '',
    lotSize: '',
    makerFeeRate: '0.1',
    takerFeeRate: '0.1',
    status: TradingPairsStatus.ACTIVE,
    isMarketOrderEnabled: true,
    isLimitOrderEnabled: true,
    isStopOrderEnabled: false,
    isIcebergOrderEnabled: false,
    isHiddenOrderEnabled: false,
    description: '',
    tags: []
  })

  const handleInputChange = (field: keyof CreateTradingPairDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate required fields
      if (!formData.symbol || !formData.baseAsset || !formData.quoteAsset) {
        throw new Error('Symbol, Base Asset, and Quote Asset are required')
      }

      if (!formData.minOrderSize || !formData.minOrderValue || !formData.tickSize || !formData.lotSize) {
        throw new Error('All size and increment fields are required')
      }

      // Clean up optional empty fields
      const submitData = { ...formData }
      if (!submitData.maxOrderSize) delete submitData.maxOrderSize
      if (!submitData.maxOrderValue) delete submitData.maxOrderValue
      if (!submitData.description) delete submitData.description
      if (!submitData.tags || submitData.tags.length === 0) delete submitData.tags

      await cexAdminClient.createTradingPair(submitData)

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess?.()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to create trading pair')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {success && (
        <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
          <p className="text-green-300 text-sm">Trading pair created successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Basic Information</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="symbol">Symbol *</Label>
            <Input
              id="symbol"
              placeholder="BTC-USDT"
              value={formData.symbol}
              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Format: BASE-QUOTE</p>
          </div>

          <div>
            <Label htmlFor="baseAsset">Base Asset *</Label>
            <Input
              id="baseAsset"
              placeholder="BTC"
              value={formData.baseAsset}
              onChange={(e) => handleInputChange('baseAsset', e.target.value.toUpperCase())}
              required
            />
          </div>

          <div>
            <Label htmlFor="quoteAsset">Quote Asset *</Label>
            <Input
              id="quoteAsset"
              placeholder="USDT"
              value={formData.quoteAsset}
              onChange={(e) => handleInputChange('quoteAsset', e.target.value.toUpperCase())}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="baseAssetPrecision">Base Asset Precision *</Label>
            <Input
              id="baseAssetPrecision"
              type="number"
              min="0"
              max="18"
              value={formData.baseAssetPrecision}
              onChange={(e) => handleInputChange('baseAssetPrecision', parseInt(e.target.value))}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Decimal places (0-18)</p>
          </div>

          <div>
            <Label htmlFor="quoteAssetPrecision">Quote Asset Precision *</Label>
            <Input
              id="quoteAssetPrecision"
              type="number"
              min="0"
              max="18"
              value={formData.quoteAssetPrecision}
              onChange={(e) => handleInputChange('quoteAssetPrecision', parseInt(e.target.value))}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Decimal places (0-18)</p>
          </div>
        </div>
      </div>

      {/* Order Limits */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Order Limits</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="minOrderSize">Min Order Size *</Label>
            <Input
              id="minOrderSize"
              placeholder="0.001"
              value={formData.minOrderSize}
              onChange={(e) => handleInputChange('minOrderSize', e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum quantity</p>
          </div>

          <div>
            <Label htmlFor="maxOrderSize">Max Order Size</Label>
            <Input
              id="maxOrderSize"
              placeholder="1000"
              value={formData.maxOrderSize}
              onChange={(e) => handleInputChange('maxOrderSize', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Maximum quantity (optional)</p>
          </div>

          <div>
            <Label htmlFor="minOrderValue">Min Order Value *</Label>
            <Input
              id="minOrderValue"
              placeholder="10"
              value={formData.minOrderValue}
              onChange={(e) => handleInputChange('minOrderValue', e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum value in quote currency</p>
          </div>

          <div>
            <Label htmlFor="maxOrderValue">Max Order Value</Label>
            <Input
              id="maxOrderValue"
              placeholder="1000000"
              value={formData.maxOrderValue}
              onChange={(e) => handleInputChange('maxOrderValue', e.target.value)}
            />
            <p className="text-xs text-gray-400 mt-1">Maximum value (optional)</p>
          </div>
        </div>
      </div>

      {/* Increments */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Increment Settings</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tickSize">Tick Size *</Label>
            <Input
              id="tickSize"
              placeholder="0.01"
              value={formData.tickSize}
              onChange={(e) => handleInputChange('tickSize', e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum price increment</p>
          </div>

          <div>
            <Label htmlFor="lotSize">Lot Size *</Label>
            <Input
              id="lotSize"
              placeholder="0.001"
              value={formData.lotSize}
              onChange={(e) => handleInputChange('lotSize', e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Minimum quantity increment</p>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Fee Configuration</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="makerFeeRate">Maker Fee Rate (%) *</Label>
            <Input
              id="makerFeeRate"
              placeholder="0.1"
              value={formData.makerFeeRate}
              onChange={(e) => handleInputChange('makerFeeRate', e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Fee for limit orders</p>
          </div>

          <div>
            <Label htmlFor="takerFeeRate">Taker Fee Rate (%) *</Label>
            <Input
              id="takerFeeRate"
              placeholder="0.1"
              value={formData.takerFeeRate}
              onChange={(e) => handleInputChange('takerFeeRate', e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">Fee for market orders</p>
          </div>
        </div>
      </div>

      {/* Order Types */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Enabled Order Types</h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isMarketOrderEnabled"
              checked={formData.isMarketOrderEnabled}
              onChange={(e) => handleInputChange('isMarketOrderEnabled', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isMarketOrderEnabled" className="cursor-pointer">Market Orders</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isLimitOrderEnabled"
              checked={formData.isLimitOrderEnabled}
              onChange={(e) => handleInputChange('isLimitOrderEnabled', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isLimitOrderEnabled" className="cursor-pointer">Limit Orders</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isStopOrderEnabled"
              checked={formData.isStopOrderEnabled}
              onChange={(e) => handleInputChange('isStopOrderEnabled', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isStopOrderEnabled" className="cursor-pointer">Stop Orders</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isIcebergOrderEnabled"
              checked={formData.isIcebergOrderEnabled}
              onChange={(e) => handleInputChange('isIcebergOrderEnabled', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isIcebergOrderEnabled" className="cursor-pointer">Iceberg Orders</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isHiddenOrderEnabled"
              checked={formData.isHiddenOrderEnabled}
              onChange={(e) => handleInputChange('isHiddenOrderEnabled', e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="isHiddenOrderEnabled" className="cursor-pointer">Hidden Orders</Label>
          </div>
        </div>
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-white">Additional Information (Optional)</h4>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Trading pair description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="tag1, tag2, tag3"
            value={formData.tags?.join(', ') || ''}
            onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
          />
          <p className="text-xs text-gray-400 mt-1">Comma-separated tags</p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Trading Pair'}
        </Button>
      </div>
    </form>
  )
}
