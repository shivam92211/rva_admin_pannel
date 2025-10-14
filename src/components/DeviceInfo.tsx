import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Device, RefreshToken } from '@/services/userApi';
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Fingerprint,
  Globe,
  Key,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { obfuscateText, obfuscateIpAddress } from '@/utils/security';

interface DeviceInfoProps {
  device: Device;
  showSensitiveData?: boolean;
}

export const DeviceInfo: React.FC<DeviceInfoProps> = ({ device, showSensitiveData = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getDeviceIcon = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      return <Smartphone className="h-4 w-4" />;
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const getDeviceType = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('iphone') || ua.includes('android')) {
      return 'Mobile';
    } else if (ua.includes('ipad') || ua.includes('tablet')) {
      return 'Tablet';
    }
    return 'Desktop';
  };

  const getBrowserInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    return 'Unknown';
  };

  const getOSInfo = (userAgent: string) => {
    const ua = userAgent.toLowerCase();
    if (ua.includes('windows')) return 'Windows';
    if (ua.includes('mac os')) return 'macOS';
    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('android')) return 'Android';
    if (ua.includes('ios')) return 'iOS';
    return 'Unknown';
  };

  const activeTokens = device.refreshTokens.filter(token => token.isActive);
  const expiredTokens = device.refreshTokens.filter(token => !token.isActive);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Device Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getDeviceIcon(device.userAgent)}
          <span className="font-medium">{getDeviceType(device.userAgent)} Device</span>
          <Badge variant="outline">{getBrowserInfo(device.userAgent)}</Badge>
          <Badge variant="secondary">{getOSInfo(device.userAgent)}</Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          Last used: {formatDate(device.updatedAt)}
        </div>
      </div>

      {/* Device Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* IP Address */}
        {device.ipAddress && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">IP:</span>
            <span className="font-mono bg-muted px-1 rounded">
              {showSensitiveData ? device.ipAddress : obfuscateIpAddress(device.ipAddress)}
            </span>
          </div>
        )}

        {/* Location */}
        {device.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Location:</span>
            <span>
              {showSensitiveData
                ? `${device.location.city}, ${device.location.country}`
                : `${obfuscateText(device.location.city)}, ${obfuscateText(device.location.country)}`
              }
            </span>
          </div>
        )}

        {/* Timezone */}
        {device.timezone && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Timezone:</span>
            <span>{device.timezone}</span>
          </div>
        )}
      </div>

      <div className="">

        {/* Fingerprint */}
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Fingerprint:</span>
          <span className="font-mono text-xs bg-muted px-1 rounded flex flex-wrap">
            {device.fingerprint.slice(0, showSensitiveData ? device.fingerprint.length : 4) + (showSensitiveData ? '' : '***')}
          </span>
        </div>
      </div>

      {/* User Agent */}
      <div className="space-y-2">
        <label className="text-sm font-medium">User Agent:</label>
        <p className="text-xs font-mono bg-muted p-2 rounded break-all">
          {device.userAgent}
        </p>
      </div>

      {/* Refresh Tokens */}
      {device.refreshTokens.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Key className="h-4 w-4" />
              Refresh Tokens ({device.refreshTokens.length})
            </h4>
            <div className="flex gap-2">
              {activeTokens.length > 0 && (
                <Badge variant="default" className="text-xs">
                  {activeTokens.length} Active
                </Badge>
              )}
              {expiredTokens.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {expiredTokens.length} Expired
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {device.refreshTokens.map((token: RefreshToken) => (
              <div key={token.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                <div className="flex items-center gap-2">
                  {token.isActive ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className="font-mono">{token.id}</span>
                  <Badge variant={token.isActive ? "default" : "secondary"} className="text-xs">
                    {token.isActive ? "Active" : "Expired"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Created: {formatDate(token.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Expires: {formatDate(token.expiresAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Timestamps */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t text-xs text-muted-foreground">
        <div>
          <span className="font-medium">First seen:</span> {formatDate(device.createdAt)}
        </div>
        <div>
          <span className="font-medium">Last activity:</span> {formatDate(device.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default DeviceInfo;