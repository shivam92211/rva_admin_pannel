import React, { useState, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface TwoFactorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TwoFactorForm: React.FC<TwoFactorFormProps> = ({ onSuccess, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { verify2FA, isLoading, error, clearError } = useAuthStore();

  useEffect(() => {
    console.log('TwoFactorForm: Component mounted');
    console.log('TwoFactorForm: verify2FA function available:', typeof verify2FA);
    console.log('TwoFactorForm: Current error:', error);
    console.log('TwoFactorForm: Check localStorage for temp_2fa_token:', !!localStorage.getItem('temp_2fa_token'));

    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('TwoFactorForm: handleSubmit called');
    clearError();

    const fullCode = code.join('');
    console.log('TwoFactorForm: fullCode =', fullCode, 'length =', fullCode.length);

    if (fullCode.length !== 6) {
      console.log('TwoFactorForm: Code length is not 6, returning');
      return;
    }

    try {
      console.log('TwoFactorForm: Calling verify2FA with code:', fullCode);
      await verify2FA(fullCode);
      console.log('TwoFactorForm: verify2FA completed successfully');
      onSuccess?.();
    } catch (error) {
      console.error('TwoFactorForm: 2FA verification error:', error);
      // Clear the code inputs on error
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleCancel = () => {
    clearError();
    setCode(['', '', '', '', '', '']);
    onCancel?.();
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-lg px-8 py-10 border border-slate-700/50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 mb-4">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Two-Factor Authentication</h1>
          <p className="text-slate-300">Enter the 6-digit code from your authenticator app</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

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
                className="w-12 h-14 text-center text-2xl font-bold border border-slate-600 bg-slate-700/50 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              />
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-300 bg-slate-700/50 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || code.join('').length !== 6}
              className="flex-1 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
