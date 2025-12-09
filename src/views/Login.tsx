import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { SetupTwoFactorModal } from '../components/auth/SetupTwoFactorModal';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, admin } = useAuthStore();
  const [show2FASetup, setShow2FASetup] = useState(false);

  useEffect(() => {
    console.log('Login component - isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLoginSuccess = () => {
    console.log('handleLoginSuccess called');

    // Check if 2FA is not enabled, show setup modal
    if (admin && !admin.twoFactorEnabled) {
      setShow2FASetup(true);
      return;
    }

    // If 2FA is already enabled or admin info not available, proceed to dashboard
    try {
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location
      window.location.href = '/dashboard';
    }
  };

  const handle2FASetupClose = () => {
    setShow2FASetup(false);
    // Proceed to dashboard after closing modal
    try {
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/dashboard';
    }
  };

  const handle2FASetupSuccess = () => {
    // Refresh admin data after enabling 2FA
    window.location.reload();
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <LoginForm onSuccess={handleLoginSuccess} />
        </div>
      </div>

      <SetupTwoFactorModal
        open={show2FASetup}
        onClose={handle2FASetupClose}
        onSuccess={handle2FASetupSuccess}
      />
    </>
  );
};