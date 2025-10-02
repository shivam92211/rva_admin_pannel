import React, { useState, useEffect } from 'react'
import { kucoinApi } from '@/services/kucoinApi'

interface APISettingsModalProps {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

interface CredentialStatus {
  apiKey: string
  hasSecret: boolean
  hasPassphrase: boolean
  partnerKey: string
  brokerName: string
  isConfigured: boolean
}

const APISettingsModal: React.FC<APISettingsModalProps> = ({ open, onClose, onSaved }) => {
  const [credentialStatus, setCredentialStatus] = useState<CredentialStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Load credential status when modal opens
  useEffect(() => {
    if (open) {
      loadCredentialStatus()
    }
  }, [open])

  const loadCredentialStatus = async () => {
    setLoading(true)
    setError('')
    try {
      const status = await kucoinApi.getBrokerCredentials()
      setCredentialStatus(status)
    } catch (err: any) {
      setError(err.message || 'Failed to load credential status')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const StatusIndicator = ({ isSet, label }: { isSet: boolean; label: string }) => (
    <div className="flex items-center justify-between py-2 px-3 bg-gray-700 rounded">
      <span className="text-gray-300">{label}</span>
      <div className={`flex items-center space-x-2 ${isSet ? 'text-green-400' : 'text-red-400'}`}>
        <div className={`w-2 h-2 rounded-full ${isSet ? 'bg-green-400' : 'bg-red-400'}`}></div>
        <span className="text-sm">{isSet ? 'Configured' : 'Not Set'}</span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg w-[500px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-4">KuCoin Broker API Status</h2>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {credentialStatus && !loading && (
          <div className="space-y-4">
            <div className="mb-6">
              <div className={`p-4 rounded-lg border ${
                credentialStatus.isConfigured
                  ? 'bg-green-900/20 border-green-600'
                  : 'bg-red-900/20 border-red-600'
              }`}>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    credentialStatus.isConfigured ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className={`font-medium ${
                    credentialStatus.isConfigured ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {credentialStatus.isConfigured ? 'API Configured' : 'API Not Configured'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 mt-2">
                  {credentialStatus.isConfigured
                    ? 'KuCoin broker API credentials are properly configured in the backend.'
                    : 'KuCoin broker API credentials need to be configured in the backend environment.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-medium text-white mb-3">Credential Status</h3>

              <StatusIndicator
                isSet={!!credentialStatus.apiKey}
                label="Broker API Key"
              />

              <StatusIndicator
                isSet={credentialStatus.hasSecret}
                label="API Secret"
              />

              <StatusIndicator
                isSet={credentialStatus.hasPassphrase}
                label="API Passphrase"
              />

              <StatusIndicator
                isSet={!!credentialStatus.partnerKey}
                label="Partner Key"
              />

              <StatusIndicator
                isSet={!!credentialStatus.brokerName}
                label="Broker Name"
              />
            </div>

            {credentialStatus.apiKey && (
              <div className="mt-4 p-3 bg-blue-900/20 border border-blue-600 rounded-md">
                <h4 className="text-blue-400 font-medium mb-2">Configuration Details</h4>
                <div className="space-y-1 text-sm text-gray-300">
                  <div>API Key: {credentialStatus.apiKey.substring(0, 8)}...****</div>
                  {credentialStatus.partnerKey && (
                    <div>Partner Key: {credentialStatus.partnerKey.substring(0, 8)}...****</div>
                  )}
                  {credentialStatus.brokerName && (
                    <div>Broker Name: {credentialStatus.brokerName}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-3 bg-blue-900/20 border border-blue-600 rounded-md">
          <p className="text-sm text-blue-400">
            <strong>Security Notice:</strong> KuCoin API credentials are now securely stored in the backend environment.
            Contact your system administrator to update these credentials.
          </p>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={loadCredentialStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            Refresh Status
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default APISettingsModal