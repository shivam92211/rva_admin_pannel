import React from 'react'

interface DepositStatusBadgeProps {
  status: string
}

export const DepositStatusBadge: React.FC<DepositStatusBadgeProps> = ({ status }) => {
  const getStatusStyles = () => {
    const upperStatus = status?.toUpperCase()
    switch (upperStatus) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'bg-green-900/20 text-green-300 border-green-600'
      case 'PROCESSING':
      case 'CONFIRMING':
      case 'PENDING':
        return 'bg-yellow-900/20 text-yellow-300 border-yellow-600'
      case 'FAILURE':
      case 'FAILED':
      case 'REJECTED':
        return 'bg-red-900/20 text-red-300 border-red-600'
      default:
        return 'bg-gray-900/20 text-gray-300 border-gray-600'
    }
  }

  const getStatusLabel = () => {
    const upperStatus = status?.toUpperCase()
    switch (upperStatus) {
      case 'SUCCESS':
        return 'Success'
      case 'COMPLETED':
        return 'Completed'
      case 'PROCESSING':
        return 'Processing'
      case 'CONFIRMING':
        return 'Confirming'
      case 'PENDING':
        return 'Pending'
      case 'FAILURE':
      case 'FAILED':
        return 'Failed'
      case 'REJECTED':
        return 'Rejected'
      default:
        return status || 'Unknown'
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  )
}
