import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type KycSubmission } from '@/services/kycSubmissionApi';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  IdCard,
  MapPin,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  cipherEmail,
  cypherPhone,
  obfuscateName,
  obfuscateUserId,
  obfuscateText,
  maskString
} from '@/utils/security';

interface KycDetailsDialogProps {
  kycSubmission: KycSubmission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KycDetailsDialog: React.FC<KycDetailsDialogProps> = ({
  kycSubmission,
  open,
  onOpenChange,
}) => {
  const [showSensitiveData, setShowSensitiveData] = useState(false); // GDPR protection - off by default

  if (!kycSubmission) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getBadgeVariant = (isTrue: boolean) => {
    return isTrue ? 'default' : 'secondary';
  };

  // Helper functions for displaying sensitive data with GDPR protection
  const displayEmail = (email: string) => {
    return showSensitiveData ? email : cipherEmail(email);
  };

  const displayPhone = (phone: string) => {
    return showSensitiveData ? phone : cypherPhone(phone);
  };

  const displayName = (name: string) => {
    return showSensitiveData ? name : obfuscateName(name);
  };

  const displayUserId = (id: string) => {
    return showSensitiveData ? id : obfuscateUserId(id);
  };

  const displayIdNumber = (idNumber: string) => {
    return showSensitiveData ? idNumber : maskString(idNumber, 2, 2);
  };

  const displaySensitiveText = (text: string) => {
    return showSensitiveData ? text : obfuscateText(text);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle },
      APPROVED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const getLevelBadge = (level: number) => {
    const levelColors = {
      1: 'bg-gray-100 text-gray-800',
      2: 'bg-orange-100 text-orange-800',
      3: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${levelColors[level as keyof typeof levelColors] || levelColors[1]}`}>
        Level {level}
      </span>
    );
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const ImagePreview = ({ src, alt, label }: { src: string; alt: string; label: string; }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <div className="border rounded-lg p-2 bg-gray-50">
        {showSensitiveData ? (
          <>
            <img
              src={src}
              alt={alt}
              className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(src, '_blank')}
            />
            <p className="text-xs text-center text-muted-foreground mt-1">Click to view full size</p>
          </>
        ) : (
          <div className="w-full h-32 bg-muted rounded flex items-center justify-center">
            <div className="text-center">
              <EyeOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Image Hidden</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              KYC Submission Details - {showSensitiveData
                ? `${kycSubmission.firstName} ${kycSubmission.lastName}`
                : `${displayName(kycSubmission.firstName)} ${displayName(kycSubmission.lastName)}`
              }
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
            Complete KYC submission information for {showSensitiveData ? kycSubmission.user.username : displaySensitiveText(kycSubmission.user.username)}
            {!showSensitiveData && (
              <span className="block text-xs text-amber-600 mt-1">
                🔒 Sensitive data is hidden for GDPR compliance. Click "Show Data" to reveal.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Status Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Status Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(kycSubmission.status)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Level:</span>
                {getLevelBadge(kycSubmission.level)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sent to KuCoin:</span>
                <Badge variant={kycSubmission.sentToKucoin ? 'default' : 'secondary'}>
                  {kycSubmission.sentToKucoin ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">User Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{displayUserId(kycSubmission.user.id)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Username</label>
                <p className="text-sm font-medium">{showSensitiveData ? kycSubmission.user.username : displaySensitiveText(kycSubmission.user.username)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {displayEmail(kycSubmission.user.email)}
                </p>
              </div>
              {kycSubmission.user.phone && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {displayPhone(kycSubmission.user.phone)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Verification Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">User Verification Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {kycSubmission.user.isEmailVerified !== undefined && (
                <div className="flex items-center gap-2">
                  {getVerificationIcon(kycSubmission.user.isEmailVerified)}
                  <span className="text-sm">Email Verified</span>
                  <Badge variant={getBadgeVariant(kycSubmission.user.isEmailVerified)}>
                    {kycSubmission.user.isEmailVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              {kycSubmission.user.isPhoneVerified !== undefined && (
                <div className="flex items-center gap-2">
                  {getVerificationIcon(kycSubmission.user.isPhoneVerified)}
                  <span className="text-sm">Phone Verified</span>
                  <Badge variant={getBadgeVariant(kycSubmission.user.isPhoneVerified)}>
                    {kycSubmission.user.isPhoneVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
              {kycSubmission.user.isKycVerified !== undefined && (
                <div className="flex items-center gap-2">
                  {getVerificationIcon(kycSubmission.user.isKycVerified)}
                  <span className="text-sm">KYC Verified</span>
                  <Badge variant={getBadgeVariant(kycSubmission.user.isKycVerified)}>
                    {kycSubmission.user.isKycVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <p className="text-sm font-medium">
                  {showSensitiveData
                    ? `${kycSubmission.firstName} ${kycSubmission.lastName}`
                    : `${displayName(kycSubmission.firstName)} ${displayName(kycSubmission.lastName)}`
                  }
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="text-sm">
                  {showSensitiveData
                    ? formatDate(kycSubmission.dateOfBirth)
                    : "***/**/****"
                  }
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Nationality
                </label>
                <p className="text-sm">{showSensitiveData ? kycSubmission.nationality : displaySensitiveText(kycSubmission.nationality)}</p>
              </div>
            </div>
          </div>

          {/* Identity Document Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Identity Document</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <IdCard className="h-4 w-4" />
                  ID Type
                </label>
                <p className="text-sm font-medium">{kycSubmission.idType.toUpperCase()}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ID Number</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{displayIdNumber(kycSubmission.idNumber)}</p>
              </div>
              {kycSubmission.expireDate && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                  <p className="text-sm">
                    {showSensitiveData
                      ? formatDate(kycSubmission.expireDate)
                      : "***/**/****"
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Document Images */}
          {/* <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Document Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <ImagePreview
                src={kycSubmission.idFrontImage}
                alt="ID Front"
                label="ID Front Image"
              />
              {kycSubmission.idBackImage && (
                <ImagePreview
                  src={kycSubmission.idBackImage}
                  alt="ID Back"
                  label="ID Back Image"
                />
              )}
              <ImagePreview
                src={kycSubmission.selfieImage}
                alt="Selfie"
                label="Selfie Image"
              />
              {kycSubmission.addressProof && (
                <ImagePreview
                  src={kycSubmission.addressProof}
                  alt="Address Proof"
                  label="Address Proof"
                />
              )}
              {kycSubmission.utilityBill && (
                <ImagePreview
                  src={kycSubmission.utilityBill}
                  alt="Utility Bill"
                  label="Utility Bill"
                />
              )}
            </div>
          </div> */}

          {/* Review Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Review Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted At
                </label>
                <p className="text-sm">{formatDate(kycSubmission.submittedAt)}</p>
              </div>
              {kycSubmission.reviewedAt && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Reviewed At
                  </label>
                  <p className="text-sm">{formatDate(kycSubmission.reviewedAt)}</p>
                </div>
              )}
              {kycSubmission.reviewedBy && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Reviewed By</label>
                  <p className="text-sm">{showSensitiveData ? kycSubmission.reviewedBy : displaySensitiveText(kycSubmission.reviewedBy)}</p>
                </div>
              )}
              {kycSubmission.rejectionReason && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Rejection Reason</label>
                  <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                    {showSensitiveData ? kycSubmission.rejectionReason : displaySensitiveText(kycSubmission.rejectionReason)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* KuCoin Integration */}
          {kycSubmission.sentToKucoin && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">KuCoin Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {kycSubmission.sentAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Sent to KuCoin At</label>
                    <p className="text-sm">{formatDate(kycSubmission.sentAt)}</p>
                  </div>
                )}
                {kycSubmission.kucoinSubmissionId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">KuCoin Submission ID</label>
                    <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{displayUserId(kycSubmission.kucoinSubmissionId)}</p>
                  </div>
                )}
                {kycSubmission.checkedAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Last Checked At</label>
                    <p className="text-sm">{formatDate(kycSubmission.checkedAt)}</p>
                  </div>
                )}
                {kycSubmission.errorMessage && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Error Message</label>
                    <p className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded">
                      {showSensitiveData ? kycSubmission.errorMessage : displaySensitiveText(kycSubmission.errorMessage)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Submission ID</label>
                <p className="text-sm font-mono bg-muted px-2 py-1 rounded">{displayUserId(kycSubmission.id)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created At
                </label>
                <p className="text-sm">{formatDate(kycSubmission.createdAt)}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Updated At
                </label>
                <p className="text-sm">{formatDate(kycSubmission.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};