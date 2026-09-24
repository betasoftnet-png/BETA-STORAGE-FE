import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader } from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();

  const handleSSORedirect = () => {
    // Generate the redirect URI back to this frontend
    const redirectUri = window.location.origin;
    // Set the SSO target URL (e.g. account.beta-softnet.com or b2auth.com)
    const authUrl = import.meta.env.VITE_AUTH_URL || 'https://b2auth.com';
    
    // Redirect to the auth app with the required OAuth query parameters
    window.location.href = `${authUrl}/?client_id=beta-storage&redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  useEffect(() => {
    // Check if we are already handling a callback (tokens in URL)
    const params = new URLSearchParams(window.location.search);
    if (params.get('token') && params.get('email')) {
      // Don't redirect, let App.jsx handle the tokens
      return;
    }
    
    // Otherwise, immediately redirect to SSO
    handleSSORedirect();
  }, []);

  return (
    <div className="login-wrapper">
      <div className="login-card-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="login-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="login-logo-container" style={{ marginBottom: '1rem' }}>
            <img src="/logo.png" alt="Beta Storage Logo" className="login-logo-img" style={{ margin: '0 auto', width: '96px', height: '96px' }} />
          </div>
          <h1 className="login-title" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('dashboard.title', 'BETA STORAGE').toUpperCase()}</h1>
          <h2 className="login-welcome" style={{ marginTop: '0.5rem', color: '#4b5563' }}>Redirecting to Beta Account for authentication...</h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '1rem' }}>
          <Loader className="animate-spin text-blue-600" size={32} />
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>Please wait while we transfer you securely.</p>
          
          <button 
            onClick={handleSSORedirect}
            style={{ marginTop: '2rem', padding: '0.5rem 1.5rem', backgroundColor: '#2563eb', color: 'white', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}
          >
            Click here if not redirected
          </button>
        </div>
      </div>
    </div>
  );
}
