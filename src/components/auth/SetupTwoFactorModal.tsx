import React, { useState, useRef, useEffect } from 'react';
import { Shield, X, Copy, Check } from 'lucide-react';
import { AuthService } from '../../services/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SetupTwoFactorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SetupTwoFactorModal: React.FC<SetupTwoFactorModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<'loading' | 'setup' | 'verify' | 'success'>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (open && step === 'loading') {
      generateQRCode();
    }
  }, [open]);

  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await authService.generate2FA();
      setQrCodeUrl(response.qrCodeUrl);
      setSecret(response.secret);
      setStep('setup');
    } catch (error: any) {
      setError(error.message || 'Failed to generate QR code');
      setStep('setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProceedToVerify = () => {
    setStep('verify');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split('');
      const newCode = [...code];
      pastedCode.forEach((char, i) => {
        if (index + i < 6) {
          newCode[index + i] = char;
        }
      });
      setCode(newCode);

      // Focus last filled input or next empty
      const nextIndex = Math.min(index + pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Single character input
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await authService.enable2FA(fullCode);
      setStep('success');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Invalid verification code');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('loading');
    setQrCodeUrl('');
    setSecret('');
    setCode(['', '', '', '', '', '']);
    setError(null);
    setCopied(false);
    onClose();
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Enable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {step === 'setup' && 'Scan the QR code with your authenticator app'}
            {step === 'verify' && 'Enter the 6-digit code from your authenticator app'}
            {step === 'success' && '2FA has been enabled successfully!'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {step === 'loading' && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {step === 'setup' && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                {qrCodeUrl ? (
                  <img
                    src={qrCodeUrl}
                    alt="2FA QR Code"
                    className="w-64 h-64 border rounded-lg"
                  />
                ) : (
                  <div className="w-64 h-64 border rounded-lg flex items-center justify-center bg-gray-50">
                    <p className="text-gray-500">Failed to load QR code</p>
                  </div>
                )}

                <div className="w-full">
                  <p className="text-sm text-gray-600 mb-2">
                    Or enter this code manually:
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm font-mono break-all">
                      {secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySecret}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Recommended Authenticator Apps:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Google Authenticator</li>
                    <li>• Microsoft Authenticator</li>
                    <li>• Authy</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isLoading}
                    className="w-12 h-14 text-center text-2xl font-bold border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                  />
                ))}
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-800">
                2FA Enabled Successfully!
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Your account is now more secure.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {step === 'setup' && (
            <>
              <Button variant="outline" onClick={handleSkip}>
                Skip for now
              </Button>
              <Button onClick={handleProceedToVerify} disabled={!qrCodeUrl}>
                Continue
              </Button>
            </>
          )}

          {step === 'verify' && (
            <>
              <Button
                variant="outline"
                onClick={() => setStep('setup')}
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isLoading || code.join('').length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Enable'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
