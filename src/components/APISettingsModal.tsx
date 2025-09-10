import React, { useState, useEffect } from 'react'
import { kucoinApi } from '@/services/kucoinApi'

interface APISettingsModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const APISettingsModal: React.FC<APISettingsModalProps> = ({ open, onClose, onSaved }) => {
  const [formData, setFormData] = useState({
    apiKey: '',
    apiSecret: '',
    apiPassphrase: '',
    partnerKey: '',
    brokerName: ''
  })

  // Load existing credentials when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        apiKey: localStorage.getItem('kucoin_broker_api_key') || '',
        apiSecret: localStorage.getItem('kucoin_broker_api_secret') || '',
        apiPassphrase: localStorage.getItem('kucoin_broker_api_passphrase') || '',
        partnerKey: localStorage.getItem('kucoin_broker_partner_key') || '',
        brokerName: localStorage.getItem('kucoin_broker_name') || ''
      })
    }
  }, [open])

  if (!open) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Store credentials in localStorage for now
    // In production, these should be handled more securely
    localStorage.setItem('kucoin_broker_api_key', formData.apiKey)
    localStorage.setItem('kucoin_broker_api_secret', formData.apiSecret)
    localStorage.setItem('kucoin_broker_api_passphrase', formData.apiPassphrase)
    localStorage.setItem('kucoin_broker_partner_key', formData.partnerKey)
    localStorage.setItem('kucoin_broker_name', formData.brokerName)
    
    // Refresh API credentials
    kucoinApi.refreshCredentials()
    
    onSaved()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-4">KuCoin Broker API Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Broker API Key *
            </label>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your broker API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Secret *
            </label>
            <input
              type="password"
              name="apiSecret"
              value={formData.apiSecret}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API secret"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              API Passphrase *
            </label>
            <input
              type="password"
              name="apiPassphrase"
              value={formData.apiPassphrase}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your API passphrase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Partner Key
            </label>
            <input
              type="text"
              name="partnerKey"
              value={formData.partnerKey}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your broker partner key (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Broker Name
            </label>
            <input
              type="text"
              name="brokerName"
              value={formData.brokerName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your broker name (optional)"
            />
          </div>
        </div>

        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-600 rounded-md">
          <p className="text-sm text-yellow-400">
            <strong>Note:</strong> These credentials are stored locally for this demo. In production, use environment variables (.env file) for security.
          </p>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!formData.apiKey || !formData.apiSecret || !formData.apiPassphrase}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default APISettingsModal