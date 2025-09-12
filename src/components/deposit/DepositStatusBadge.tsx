import React from 'react'
import type { TransactionStatus } from '@/types/kucoin'

interface DepositStatusBadgeProps {
  status: TransactionStatus
}

export const DepositStatusBadge: React.FC<DepositStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-900/20 text-green-300 border-green-600'
      case 'PROCESSING':
        return 'bg-yellow-900/20 text-yellow-300 border-yellow-600'
      case 'FAILURE':
        return 'bg-red-900/20 text-red-300 border-red-600'
      default:
        return 'bg-gray-900/20 text-gray-300 border-gray-600'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'SUCCESS':
        return 'Success'
      case 'PROCESSING':
        return 'Processing'
      case 'FAILURE':
        return 'Failed'
      default:
        return 'Unknown'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  )
}