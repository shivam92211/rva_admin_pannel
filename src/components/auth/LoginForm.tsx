import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuthStore } from '../../store/authStore';
import { TwoFactorForm } from './TwoFactorForm';
import axios from 'axios';

interface LoginFormProps {
  onSuccess?: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'; // Test key

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const { login, isLoading, error, clearError, requires2FA, clear2FAState } = useAuthStore();

  // Check if CAPTCHA is required on component mount
  useEffect(() => {
    const checkCaptchaRequired = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/auth/captcha-required`);
        setCaptchaRequired(response.data.required);
      } catch (error) {
        console.error('Failed to check CAPTCHA requirement:', error);
      }
    };
    checkCaptchaRequired();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      return;
    }

    // Check if CAPTCHA is required but not completed
    if (captchaRequired && !recaptchaToken) {
      return; // CAPTCHA widget will show error
    }

    try {
      await login({ email, password }, recaptchaToken || undefined);
      // If 2FA is not required, redirect to success
      if (!requires2FA) {
        console.log('Login successful, calling onSuccess');
        setTimeout(() => {
          onSuccess?.();
        }, 100);
      }
      // If 2FA is required, the form will automatically show the 2FA component
    } catch (error: any) {
      console.error('Login error:', error);
      // Reset reCAPTCHA on error
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
      // Check if we now need CAPTCHA after failed attempt
      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/auth/captcha-required`);
        setCaptchaRequired(response.data.required);
      } catch (checkError) {
        console.error('Failed to check CAPTCHA requirement:', checkError);
      }
    }
  };

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };

  const handle2FACancel = () => {
    clear2FAState();
    setEmail('');
    setPassword('');
  };

  // Show 2FA form if required
  if (requires2FA) {
    return <TwoFactorForm onSuccess={onSuccess} onCancel={handle2FACancel} />;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-lg px-8 py-10 border border-slate-700/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-slate-300">Sign in to access the RVA Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-200">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-700/50 text-white rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-12 py-3 border border-slate-600 bg-slate-700/50 text-white rounded-md placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                ) : (
                  <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {captchaRequired && (
            <div className="flex justify-center">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={RECAPTCHA_SITE_KEY}
                onChange={handleRecaptchaChange}
                theme="dark"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email || !password || (captchaRequired && !recaptchaToken)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* <div className="mt-8 text-center">
          <p className="text-sm text-slate-300">
            Demo Accounts:
          </p>
          <div className="mt-2 space-y-1 text-xs text-slate-400">
            <p>Super Admin: superadmin@rva.com</p>
            <p>Admin: admin@rva.com</p>
            <p>Support: support@rva.com</p>
            <p>Password: 123abc</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};