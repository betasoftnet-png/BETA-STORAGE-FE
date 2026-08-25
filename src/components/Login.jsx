import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Shield } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // State for validation errors and loading state
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email) {
      setError('Email address is required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate Network Request
    setTimeout(() => {
      // Frontend-only validation check (permits any valid email format)
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentUserEmail', email);
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      setIsLoading(false);
      onLoginSuccess(email);
    }, 1000); // 1s simulation delay for a premium feel
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
          <h1 className="login-title">BETA STORAGE MANAGEMENT</h1>
          <h2 className="login-welcome">Welcome back</h2>
          <p className="login-subtitle">Sign in to manage your storage</p>
        </div>

        {/* Form Error Alert */}
        {error && (
          <div className="login-error-alert animate-fade-in">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label className="login-label" htmlFor="email-input">Email</label>
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
            <label className="login-label" htmlFor="password-input">Password</label>
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
              <span>Remember me</span>
            </label>
            <a href="#" className="login-forgot-link" onClick={handleForgotPassword}>
              Forgot password?
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
              'SIGN IN'
            )}
          </button>
        </form>

        {/* Beta Footer environment stamp */}
        <div className="login-footer">
          <div className="environment-badge">
            <Shield size={12} />
            <span>Beta Environment • v1.0</span>
          </div>
        </div>

      </div>
    </div>
  );
}
