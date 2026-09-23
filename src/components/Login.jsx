import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield, KeyRound, ArrowLeft } from 'lucide-react';
import { loginUser, verify2FA } from '../services/authService';

export default function Login({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // 2FA state
  const [is2FA, setIs2FA] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');

  // Validation and loading state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email) {
      setError(t('login.emailRequired', 'Email is required'));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('login.emailError', 'Please enter a valid email'));
      return;
    }
    if (!password) {
      setError(t('login.passwordRequired', 'Password is required'));
      return;
    }
    if (password.length < 6) {
      setError(t('login.passwordError', 'Password must be at least 6 characters'));
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      
      if (res.is2FA) {
        setIs2FA(true);
        setTempToken(res.tempToken);
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setIsLoading(false);
      onLoginSuccess(res.email || email, res.accessToken, res.refreshToken);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!twoFactorCode || twoFactorCode.trim().length === 0) {
      setError('Please enter your 2FA verification code');
      return;
    }

    setIsLoading(true);

    try {
      const res = await verify2FA(tempToken, twoFactorCode);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      setIsLoading(false);
      onLoginSuccess(res.email || email, res.accessToken, res.refreshToken);
    } catch (err) {
      setIsLoading(false);
      setError(err.message || '2FA verification failed. Please try again.');
    }
  };

  const handleBackToLogin = () => {
    setIs2FA(false);
    setTempToken('');
    setTwoFactorCode('');
    setError('');
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    alert('Simulated password reset instructions have been sent to ' + (email || 'your email') + '.');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card-container">
        
        {/* Storage Logo Section */}
        <div className="login-header">
          <div className="login-logo-container">
            <img src="/logo.png" alt="Beta Storage Logo" className="login-logo-img" />
          </div>
          <h1 className="login-title">{t('dashboard.title', 'BETA STORAGE').toUpperCase()}</h1>
          <h2 className="login-welcome">{is2FA ? 'Two-Factor Authentication' : t('login.welcome', 'Welcome Back')}</h2>
          <p className="login-subtitle">{is2FA ? `Enter verification code sent to ${email}` : t('login.title', 'Sign in to access your storage ecosystem')}</p>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="login-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {is2FA ? (
          /* 2FA Code Form */
          <form onSubmit={handle2FASubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-label" htmlFor="2fa-code-input">Verification Code</label>
              <div className="login-input-wrapper">
                <KeyRound className="login-input-icon" size={16} />
                <input
                  id="2fa-code-input"
                  type="text"
                  className="login-input"
                  placeholder="Enter 6-digit code"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                'VERIFY & SIGN IN'
              )}
            </button>

            <button
              type="button"
              onClick={handleBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-blue)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginTop: '0.75rem',
                padding: '0.5rem'
              }}
              disabled={isLoading}
            >
              <ArrowLeft size={14} />
              <span>Back to Login</span>
            </button>
          </form>
        ) : (
          /* Standard Login Form */
          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-form-group">
              <label className="login-label" htmlFor="email-input">{t('login.emailLabel', 'Email Address')}</label>
              <div className="login-input-wrapper">
                <Mail className="login-input-icon" size={16} />
                <input
                  id="email-input"
                  type="email"
                  className="login-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-label" htmlFor="password-input">{t('login.passwordLabel', 'Password')}</label>
              <div className="login-input-wrapper">
                <Lock className="login-input-icon" size={16} />
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="login-password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="login-remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                <span>{t('login.rememberMe', 'Remember me')}</span>
              </label>
              <a href="#" className="login-forgot-link" onClick={handleForgotPassword}>
                {t('login.forgotPassword', 'Forgot password?')}
              </a>
            </div>

            <button
              type="submit"
              className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                t('login.submitBtn', 'SIGN IN').toUpperCase()
              )}
            </button>
          </form>
        )}

        {/* Beta Footer environment stamp */}
        <div className="login-footer">
          <div className="environment-badge">
            <Shield size={12} />
            <span>{t('login.environment', 'Secured with End-to-End Encryption')}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
