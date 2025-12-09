import React, { useState } from 'react';
import { ShieldOff } from 'lucide-react';
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

interface DisableTwoFactorModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DisableTwoFactorModal: React.FC<DisableTwoFactorModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  const handleDisable = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await authService.disable2FA();
      onSuccess?.();
      onClose();
      // Refresh to update admin data
      window.location.reload();
    } catch (error: any) {
      setError(error.message || 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5 text-red-500" />
            Disable Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to disable two-factor authentication? This will make your account less secure.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> Disabling 2FA will reduce the security of your account. You will only need your password to log in.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDisable} disabled={isLoading}>
            {isLoading ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
