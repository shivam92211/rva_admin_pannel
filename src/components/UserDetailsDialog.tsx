import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { type User, type UserDevicesResponse, userApi } from '@/services/userApi'
import { User as UserIcon, Mail, Phone, Calendar, Shield, ShieldCheck, Key, CheckCircle, XCircle, Monitor, Loader2, Eye, EyeOff } from 'lucide-react'
import DeviceInfo from './DeviceInfo'
import { 
  cipherEmail, 
  cypherPhone, 
  obfuscateName, 
  obfuscateUserId, 
  obfuscateText
} from '@/utils/security'

interface UserDetailsDialogProps {
  user: User | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  open,
  onOpenChange,
}) => {
  const [devices, setDevices] = useState<UserDevicesResponse | null>(null)
  const [loadingDevices, setLoadingDevices] = useState(false)
  const [devicesError, setDevicesError] = useState<string | null>(null)
  const [showSensitiveData, setShowSensitiveData] = useState(false) // GDPR protection - off by default

  // Fetch devices when dialog opens and user is selected
  useEffect(() => {
    if (open && user) {
      setLoadingDevices(true)
      setDevicesError(null)

      userApi.getUserDevices(user.id)
        .then(setDevices)
        .catch((error) => {
          console.error('Failed to fetch user devices:', error)
          setDevicesError('Failed to load device information')
        })
        .finally(() => setLoadingDevices(false))
    } else {
      // Reset devices when dialog closes
      setDevices(null)
      setDevicesError(null)
    }
  }, [open, user])

  if (!user) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getBadgeVariant = (isTrue: boolean) => {
    return isTrue ? 'default' : 'secondary'
  }

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  // Helper functions for displaying sensitive data with GDPR protection
  const displayEmail = (email: string) => {
    return showSensitiveData ? email : cipherEmail(email)
  }

  const displayPhone = (phone: string) => {
    return showSensitiveData ? phone : cypherPhone(phone)
  }

  const displayName = (name: string) => {
    return showSensitiveData ? name : obfuscateName(name)
  }

  const displayUserId = (id: string) => {
    return showSensitiveData ? id : obfuscateUserId(id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              User Details - {showSensitiveData ? user.username : obfuscateText(user.username)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              className="flex items-center gap-2 text-sm"
              title={showSensitiveData ? "Hide sensitive data (GDPR)" : "Show sensitive data"}
            >
              {showSensitiveData ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Hide Data
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Show Data
                </>
              )}
            </Button>
          </DialogTitle>
          <DialogDescription>
            Complete information for user {displayEmail(user.email)}
            {!showSensitiveData && (
              <span className="block text-xs text-amber-600 mt-1">
                🔒 Sensitive data is hidden for GDPR compliance. Click "Show Data" to reveal.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{displayUserId(user.id)}</p>
              </div>
              {user.uid && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">UID</label>
                  <p className="text-sm">{displayUserId(String(user.uid))}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="text-sm font-medium">{showSensitiveData ? user.username : obfuscateText(user.username)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {displayEmail(user.email)}
                </p>
              </div>
              {(user.firstName || user.lastName) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-sm">
                    {displayName(`${user.firstName || ''} ${user.lastName || ''}`.trim()) || '—'}
                  </p>
                </div>
              )}
              {(user.phone || user.phoneNumber) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {displayPhone(user.phone || user.phoneNumber || '')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Account Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Account Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {user.isFrozen !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Frozen:</span>
                  <Badge variant={user.isFrozen ? 'destructive' : 'secondary'}>
                    {user.isFrozen ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Whitelist:</span>
                <Badge variant={user.withdrawalWhitelist ? 'default' : 'secondary'}>
                  {user.withdrawalWhitelist ? 'Whitelisted' : 'Not Whitelisted'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Verification Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.isEmailVerified !== undefined && (
                <div className="flex items-center gap-2">
                  {getVerificationIcon(user.isEmailVerified)}
                  <span className="text-sm">Email Verified</span>
                  <Badge variant={getBadgeVariant(user.isEmailVerified)}>
                    {user.isEmailVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              {user.isPhoneVerified !== undefined && (
                <div className="flex items-center gap-2">
                  {getVerificationIcon(user.isPhoneVerified)}
                  <span className="text-sm">Phone Verified</span>
                  <Badge variant={getBadgeVariant(user.isPhoneVerified)}>
                    {user.isPhoneVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              {user.isKycVerified !== undefined && (
                <div className="flex items-center gap-2">
                  {getVerificationIcon(user.isKycVerified)}
                  <span className="text-sm">KYC Verified</span>
                  <Badge variant={getBadgeVariant(user.isKycVerified)}>
                    {user.isKycVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              {user.kycLevel !== undefined && (
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">KYC Level</span>
                  <Badge variant="outline">{user.kycLevel}</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Security</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.loginType && (
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="text-sm">Login Type:</span>
                  <Badge variant="outline">{user.loginType}</Badge>
                </div>
              )}
              {user.isGoogle2FAEnabled !== undefined && (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-sm">2FA Enabled:</span>
                  <Badge variant={getBadgeVariant(user.isGoogle2FAEnabled)}>
                    {user.isGoogle2FAEnabled ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Account Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">{formatDate(user.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated At
                </label>
                <p className="text-sm">{formatDate(user.updatedAt)}</p>
              </div>
              {user.lastLoginAt && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Login
                  </label>
                  <p className="text-sm">{formatDate(user.lastLoginAt)}</p>
                </div>
              )}
            </div>
          </div>

          {/* User Devices */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              User Devices
            </h3>

            {loadingDevices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading devices...</span>
              </div>
            ) : devicesError ? (
              <div className="text-center py-8 text-red-500">
                <p>{devicesError}</p>
              </div>
            ) : devices && devices.devices.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Found {devices.devices.length} device{devices.devices.length !== 1 ? 's' : ''} associated with this user
                </p>
                {devices.devices.map((device) => (
                  <DeviceInfo key={device.id} device={device} showSensitiveData={showSensitiveData} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No devices found for this user</p>
              </div>
            )}
          </div>

          {/* Profile Picture */}
          {user.profilePicture && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Profile Picture</h3>
              <div className="flex justify-center">
                {showSensitiveData ? (
                  <img
                    src={user.profilePicture}
                    alt={`${user.username}'s profile`}
                    className="w-24 h-24 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted border flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">Hidden</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}