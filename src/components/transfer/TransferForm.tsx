import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTransferStore } from '@/store/transfer'
import type { TransferRequest } from '@/types/kucoin'
import { ArrowRightLeft, Loader2 } from 'lucide-react'

interface FormErrors {
  currency?: string
  amount?: string
  clientOid?: string
  specialUid?: string
}

interface TransferFormProps {
  onSuccess?: () => void
}

const currencies = ['USDT', 'BTC', 'ETH', 'BNB', 'ADA', 'DOT', 'LINK', 'UNI']
const accountTypes = [
  { value: 'MAIN', label: 'Main Account (Funding)' },
  { value: 'TRADE', label: 'Trade Account (Spot)' }
]

export const TransferForm: React.FC<TransferFormProps> = ({ onSuccess }) => {
  const { 
    subAccounts, 
    isSubmitting, 
    error, 
    submitTransfer, 
    fetchSubAccounts, 
    clearError,
    lastTransferOrderId
  } = useTransferStore()

  const [formData, setFormData] = useState<TransferRequest>({
    currency: '',
    amount: '',
    clientOid: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    direction: 'OUT',
    accountType: 'MAIN',
    specialUid: '',
    specialAccountType: 'MAIN'
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchSubAccounts()
  }, [fetchSubAccounts])

  useEffect(() => {
    if (lastTransferOrderId) {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [lastTransferOrderId])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.currency) {
      newErrors.currency = 'Currency is required'
    }

    if (!formData.amount) {
      newErrors.amount = 'Amount is required'
    } else {
      const amount = parseFloat(formData.amount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.amount = 'Amount must be a positive number'
      }
    }

    if (!formData.clientOid) {
      newErrors.clientOid = 'Client Order ID is required'
    } else if (formData.clientOid.length > 128) {
      newErrors.clientOid = 'Client Order ID must be less than 128 characters'
    }

    if (!formData.specialUid) {
      newErrors.specialUid = 'Sub-account is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    if (!validateForm()) {
      return
    }

    try {
      await submitTransfer(formData)
      
      // Reset form after successful submission
      setFormData({
        ...formData,
        amount: '',
        clientOid: `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })
      setErrors({})
      
      // Call success callback if provided
      onSuccess?.()
    } catch {
      // Error is handled by the store
    }
  }

  const handleInputChange = (field: keyof TransferRequest) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleDirection = () => {
    setFormData(prev => ({
      ...prev,
      direction: prev.direction === 'OUT' ? 'IN' : 'OUT'
    }))
  }

  const getDirectionLabel = () => {
    return formData.direction === 'OUT' 
      ? 'Broker → Sub-account' 
      : 'Sub-account → Broker'
  }

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="bg-green-900/20 border border-green-600 rounded-lg px-4 py-2">
          <p className="text-green-300 text-sm">
            Transfer submitted! Order ID: {lastTransferOrderId}
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transfer Direction */}
        <div>
          <Label className="text-white">Transfer Direction</Label>
          <div className="mt-2">
            <Button
              type="button"
              onClick={toggleDirection}
              variant="outline"
              className="w-full justify-center bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {getDirectionLabel()}
            </Button>
          </div>
        </div>

        {/* Currency and Amount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency" className="text-white">Currency</Label>
            <Select 
              value={formData.currency} 
              onValueChange={handleInputChange('currency')}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(currency => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.currency && <p className="text-red-400 text-sm mt-1">{errors.currency}</p>}
          </div>

          <div>
            <Label htmlFor="amount" className="text-white">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="any"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount')(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
            {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
          </div>
        </div>

        {/* Account Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-white">
              {formData.direction === 'OUT' ? 'From (Broker Account)' : 'To (Broker Account)'}
            </Label>
            <Select 
              value={formData.accountType} 
              onValueChange={handleInputChange('accountType')}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">
              {formData.direction === 'OUT' ? 'To (Sub-account Type)' : 'From (Sub-account Type)'}
            </Label>
            <Select 
              value={formData.specialAccountType} 
              onValueChange={handleInputChange('specialAccountType')}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sub-account Selection */}
        <div>
          <Label className="text-white">Sub-account</Label>
          <Select 
            value={formData.specialUid} 
            onValueChange={handleInputChange('specialUid')}
          >
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue placeholder="Select sub-account" />
            </SelectTrigger>
            <SelectContent>
              {subAccounts.map(account => (
                <SelectItem key={account.uid} value={account.uid}>
                  {account.accountName} ({account.uid})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.specialUid && <p className="text-red-400 text-sm mt-1">{errors.specialUid}</p>}
        </div>

        {/* Client Order ID */}
        <div>
          <Label htmlFor="clientOid" className="text-white">Client Order ID</Label>
          <Input
            id="clientOid"
            value={formData.clientOid}
            onChange={(e) => handleInputChange('clientOid')(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            placeholder="Unique order identifier"
          />
          {errors.clientOid && <p className="text-red-400 text-sm mt-1">{errors.clientOid}</p>}
          <p className="text-gray-400 text-sm mt-1">Auto-generated unique identifier</p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting Transfer...
            </>
          ) : (
            'Submit Transfer'
          )}
        </Button>
      </form>
    </div>
  )
}