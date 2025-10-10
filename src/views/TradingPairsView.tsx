import React, { useState } from 'react'
import { PageHeader } from '@/components/PageHeader'
import { TradingPairForm } from '@/components/tradingpair/TradingPairForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

const TradingPairsView: React.FC = () => {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Trading Pairs"
        description="Create and manage trading pairs for the exchange"
      >
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Hide Form' : 'New Trading Pair'}
        </Button>
      </PageHeader>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Trading Pair</CardTitle>
                <CardDescription>
                  Fill in the details below to create a new trading pair
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TradingPairForm onSuccess={() => setShowForm(false)} />
              </CardContent>
            </Card>
          )}

          {/* Guidelines Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4">Trading Pair Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
              <div>
                <h4 className="font-medium text-white mb-2">Symbol Format</h4>
                <ul className="space-y-1">
                  <li>Format: BASE-QUOTE (e.g., BTC-USDT)</li>
                  <li>Must be uppercase</li>
                  <li>Must be unique</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Precision Settings</h4>
                <ul className="space-y-1">
                  <li>Base Asset Precision: Number of decimal places for base asset</li>
                  <li>Quote Asset Precision: Number of decimal places for quote asset</li>
                  <li>Example: BTC typically uses 8, USDT uses 2</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Order Size Limits</h4>
                <ul className="space-y-1">
                  <li>Min Order Size: Minimum quantity allowed</li>
                  <li>Max Order Size: Maximum quantity allowed (optional)</li>
                  <li>Min Order Value: Minimum total value in quote currency</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Increment Settings</h4>
                <ul className="space-y-1">
                  <li>Tick Size: Minimum price increment</li>
                  <li>Lot Size: Minimum quantity increment</li>
                  <li>Example: 0.01 for tick, 0.001 for lot</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Fee Configuration</h4>
                <ul className="space-y-1">
                  <li>Maker Fee: Fee for limit orders that add liquidity</li>
                  <li>Taker Fee: Fee for market orders that remove liquidity</li>
                  <li>Format: Percentage (e.g., 0.1 for 0.1%)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Order Types</h4>
                <ul className="space-y-1">
                  <li>Market Orders: Execute immediately at market price</li>
                  <li>Limit Orders: Execute at specific price or better</li>
                  <li>Stop/Iceberg/Hidden: Advanced order types</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TradingPairsView
