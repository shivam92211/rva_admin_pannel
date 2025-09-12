import React, { useState } from 'react'
import { useRebateStore } from '@/store/rebate'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, RefreshCw, Download, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { kucoinApi } from '@/services/kucoinApi'

export const RebateHistoryTable: React.FC = () => {
  const { 
    rebates, 
    isLoading, 
    isDownloading,
    downloadUrl,
    fetchRebates, 
    downloadRebateReport,
    loadDummyData,
    clearDownloadUrl
  } = useRebateStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [bizLineFilter, setBizLineFilter] = useState<'Spot' | 'Futures' | 'all'>('all')
  const [affiliateFilter, setAffiliateFilter] = useState<'with' | 'without' | 'all'>('all')
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  // Get unique values for filters (for future use)
  // const availableBizLines = Array.from(
  //   new Set(rebates.map(r => r.bizLine))
  // ).sort()

  // Filter rebates based on search and filters
  const filteredRebates = rebates.filter(rebate => {
    const matchesSearch = searchTerm === '' || 
      rebate.uid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rebate.affiliateUid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rebate.brokerUid.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBizLine = bizLineFilter === 'all' || rebate.bizLine === bizLineFilter
    const matchesAffiliate = affiliateFilter === 'all' || 
      (affiliateFilter === 'with' && rebate.affiliateUid !== '') ||
      (affiliateFilter === 'without' && rebate.affiliateUid === '')

    return matchesSearch && matchesBizLine && matchesAffiliate
  })

  // Calculate totals
  const totals = filteredRebates.reduce((acc, rebate) => ({
    volume: acc.volume + parseFloat(rebate.volume),
    totalCommission: acc.totalCommission + parseFloat(rebate.totalCommission),
    brokerCommission: acc.brokerCommission + parseFloat(rebate.brokerCommission),
    userCommission: acc.userCommission + parseFloat(rebate.userCommission),
    affiliateCommission: acc.affiliateCommission + parseFloat(rebate.affiliateCommission)
  }), {
    volume: 0,
    totalCommission: 0,
    brokerCommission: 0,
    userCommission: 0,
    affiliateCommission: 0
  })

  const handleRefresh = () => {
    if (kucoinApi.isBrokerConfigured()) {
      fetchRebates()
    } else {
      loadDummyData()
    }
  }

  const handleDownloadReport = async () => {
    const begin = startDate.replace(/-/g, '')
    const end = endDate.replace(/-/g, '')
    const tradeType = bizLineFilter === 'Spot' ? 1 : bizLineFilter === 'Futures' ? 2 : 1
    
    await downloadRebateReport({ begin, end, tradeType })
  }

  React.useEffect(() => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `rebate_report_${startDate}_${endDate}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      clearDownloadUrl()
    }
  }, [downloadUrl, startDate, endDate, clearDownloadUrl])

  if (isLoading && rebates.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading rebate data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-white">
                ${totals.volume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Total Commission</p>
              <p className="text-2xl font-bold text-white">
                ${totals.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Broker Commission</p>
              <p className="text-2xl font-bold text-white">
                ${totals.brokerCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-400">Affiliate Commission</p>
              <p className="text-2xl font-bold text-white">
                ${totals.affiliateCommission.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Rebate History</h2>
          <div className="flex items-center space-x-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleDownloadReport}
              disabled={isDownloading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              {isDownloading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isDownloading ? 'Generating...' : 'Download Report'}
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by UID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>

          <Select value={bizLineFilter} onValueChange={(value: 'Spot' | 'Futures' | 'all') => setBizLineFilter(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Business Line" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Business Lines</SelectItem>
              <SelectItem value="Spot">Spot</SelectItem>
              <SelectItem value="Futures">Futures</SelectItem>
            </SelectContent>
          </Select>

          <Select value={affiliateFilter} onValueChange={(value: 'with' | 'without' | 'all') => setAffiliateFilter(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Affiliate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Records</SelectItem>
              <SelectItem value="with">With Affiliate</SelectItem>
              <SelectItem value="without">Direct Only</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />

          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white"
          />

          <div className="flex items-center text-sm text-gray-400">
            {filteredRebates.length} of {rebates.length} records
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredRebates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {rebates.length === 0 
                  ? 'No rebate data found for the selected period.' 
                  : 'No rebates match your current filters.'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">User UID</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Business Line</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Volume</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Total Commission</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Broker Commission</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">User Commission</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Affiliate UID</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-medium">Affiliate Commission</th>
                </tr>
              </thead>
              <tbody>
                {filteredRebates.map((rebate, index) => (
                  <tr key={`${rebate.date}-${rebate.uid}-${index}`} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                    <td className="py-3 px-4">
                      <span className="text-sm text-white">
                        {format(new Date(rebate.date), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <code className="text-sm text-blue-300 bg-gray-700/50 px-2 py-1 rounded">
                        {rebate.uid}
                      </code>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm px-2 py-1 rounded ${
                        rebate.bizLine === 'Spot' 
                          ? 'bg-green-900/20 text-green-300' 
                          : 'bg-blue-900/20 text-blue-300'
                      }`}>
                        {rebate.bizLine}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-green-300">
                        ${parseFloat(rebate.volume).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-yellow-300">
                        ${parseFloat(rebate.totalCommission).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-purple-300">
                        ${parseFloat(rebate.brokerCommission).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-gray-300">
                        ${parseFloat(rebate.userCommission).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {rebate.affiliateUid ? (
                        <code className="text-xs text-orange-300 bg-gray-700/50 px-2 py-1 rounded">
                          {rebate.affiliateUid}
                        </code>
                      ) : (
                        <span className="text-xs text-gray-500">Direct</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-mono text-orange-300">
                        ${parseFloat(rebate.affiliateCommission).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {rebates.length > 0 && (
          <div className="mt-4 text-xs text-gray-500 border-t border-gray-700 pt-4">
            <p>
              Rebate data shows commission distribution for trading activities. Use date filters to narrow down results.
              {!isLoading && rebates.length > 0 && rebates[0].brokerUid === 'broker_main' && (
                <span className="ml-2 text-yellow-500">
                  ⚠ Demo data is being displayed
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}