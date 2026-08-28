import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, User, CreditCard, HardDrive, ShieldAlert, LogOut, 
  HelpCircle, Grid, Mail, Shield, Check, Plus, Trash2, 
  Lock, Smartphone, ChevronRight, CheckCircle2, UserCheck, AlertCircle
} from 'lucide-react';

export default function AccountManagementView({ 
  currentUserEmail, 
  onBack, 
  onLogout,
  totalPoolMB = 5120,
  apps = []
}) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('home');
  
  // User Profile details
  const email = currentUserEmail || 'rahulram042@bnxmail.com';
  const defaultUsername = email.split('@')[0];
  const defaultFullName = defaultUsername.toLowerCase().includes('rahul') 
    ? 'Rahul Ram' 
    : (defaultUsername.charAt(0).toUpperCase() + defaultUsername.slice(1));
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(`bnx_account_profile_${email}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      fullName: defaultFullName,
      username: defaultUsername,
      gender: defaultUsername.toLowerCase().includes('rahul') ? 'Male' : 'Rather not say',
      birthday: defaultUsername.toLowerCase().includes('rahul') ? '1995-04-12' : '',
      phone: defaultUsername.toLowerCase().includes('rahul') ? '+1 (555) 019-2834' : '',
      secondaryEmails: defaultUsername.toLowerCase().includes('rahul') ? ['rahul.backup@bnxmail.com'] : []
    };
  });

  // Persist Profile info
  useEffect(() => {
    localStorage.setItem(`bnx_account_profile_${email}`, JSON.stringify(profile));
  }, [profile, email]);

  // Security info state
  const [securitySettings, setSecuritySettings] = useState(() => {
    const saved = localStorage.getItem(`bnx_account_security_${email}`);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      twoStepEnabled: true,
      publicAccount: true,
      sessions: [
        { id: 'sess-1', device: 'Windows PC', browser: 'Chrome', location: 'New York, USA', active: true },
        { id: 'sess-2', device: 'iPhone 15 Pro', browser: 'BNX Mail App', location: 'California, USA', active: false }
      ]
    };
  });

  useEffect(() => {
    localStorage.setItem(`bnx_account_security_${email}`, JSON.stringify(securitySettings));
  }, [securitySettings, email]);

  // Secondary email add input state
  const [newSecEmail, setNewSecEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  // Password fields
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  // Calculate dynamic storage stats
  const totalUsedStorageMB = apps.reduce((acc, app) => {
    return acc + app.files.reduce((sum, f) => sum + f.size, 0);
  }, 0);
  const usedGB = (totalUsedStorageMB / 1024).toFixed(2);
  const totalGB = (totalPoolMB / 1024).toFixed(0);
  const storagePercentage = Math.min(100, Math.round((totalUsedStorageMB / totalPoolMB) * 100));

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSecondaryEmail = (e) => {
    e.preventDefault();
    if (!newSecEmail) return;
    if (!newSecEmail.includes('@') || !newSecEmail.includes('.')) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    if (profile.secondaryEmails.includes(newSecEmail) || newSecEmail === email) {
      setEmailError('Email address already registered.');
      return;
    }
    setProfile(prev => ({
      ...prev,
      secondaryEmails: [...prev.secondaryEmails, newSecEmail]
    }));
    setNewSecEmail('');
    setEmailError('');
  };

  const handleRemoveSecondaryEmail = (emailToRemove) => {
    setProfile(prev => ({
      ...prev,
      secondaryEmails: prev.secondaryEmails.filter(e => e !== emailToRemove)
    }));
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (!passwordState.currentPassword || !passwordState.newPassword || !passwordState.confirmPassword) {
      setPassMessage({ text: 'All fields are required.', type: 'error' });
      return;
    }
    if (passwordState.newPassword.length < 6) {
      setPassMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      setPassMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    setPassMessage({ text: 'Password successfully updated!', type: 'success' });
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleTwoStep = () => {
    setSecuritySettings(prev => ({ ...prev, twoStepEnabled: !prev.twoStepEnabled }));
  };

  const togglePublicAccount = () => {
    setSecuritySettings(prev => ({ ...prev, publicAccount: !prev.publicAccount }));
  };

  const handleRevokeSession = (sessionId) => {
    setSecuritySettings(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId)
    }));
  };

  // Switch tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="account-home-view">
            {/* Banner Section */}
            <div className="account-welcome-banner">
              <div className="welcome-avatar-large">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : defaultUsername.charAt(0).toUpperCase()}
              </div>
              <h1 className="welcome-title">Welcome, {profile.fullName.split(' ')[0]}</h1>
              <p className="welcome-subtitle">
                Manage your info, privacy, and security to make B2Auth work better for you.
              </p>
            </div>

            {/* 2x2 Grid of Cards */}
            <div className="account-card-grid">
              
              {/* Emails & Identities Card */}
              <div className="account-info-card">
                <div className="card-top-content">
                  <div className="card-icon-container bg-blue-light">
                    <Mail className="text-blue" size={24} />
                  </div>
                  <h3 className="card-title">Emails & Identities</h3>
                  <p className="card-description">
                    Manage your primary and secondary email addresses associated with this account.
                  </p>
                  
                  {/* Verified primary email list display */}
                  <div className="email-status-item">
                    <span className="email-status-icon">✓</span>
                    <span className="email-status-text">{email}</span>
                  </div>
                  {profile.secondaryEmails.length > 0 && (
                    <div className="email-status-item secondary">
                      <span className="email-status-icon secondary">✓</span>
                      <span className="email-status-text">{profile.secondaryEmails[0]}</span>
                      {profile.secondaryEmails.length > 1 && (
                        <span className="email-extra-badge">+{profile.secondaryEmails.length - 1} more</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="card-footer-link" onClick={() => setActiveTab('personal-info')}>
                  Manage your emails
                </div>
              </div>

              {/* Privacy & Personalization Card */}
              <div className="account-info-card">
                <div className="card-top-content">
                  <div className="card-icon-container bg-teal-light">
                    <Shield className="text-teal" size={24} />
                  </div>
                  <h3 className="card-title">Privacy & personalization</h3>
                  <p className="card-description">
                    See the data in your BNX Account and choose what activity is saved to personalize your BNX experience.
                  </p>
                  <div className="privacy-active-indicators">
                    <div className="indicator-row">
                      <span className="bullet"></span>
                      <span>Web activity logs: Active</span>
                    </div>
                    <div className="indicator-row">
                      <span className="bullet"></span>
                      <span>Ecosystem cookies: Enabled</span>
                    </div>
                  </div>
                </div>
                <div className="card-footer-link" onClick={() => window.location.href = 'https://www.b2auth.com/'}>
                  Manage your data & privacy
                </div>
              </div>

              {/* Account & Security Card */}
              <div className="account-info-card">
                <div className="card-top-content">
                  <div className="card-icon-container bg-indigo-light">
                    <UserCheck className="text-indigo" size={24} />
                  </div>
                  <h3 className="card-title">Account & Security</h3>
                  <p className="card-description">
                    Security checkup and recommendations for your PUBLIC account.
                  </p>
                  <div className="badge-wrapper">
                    <span className="public-account-badge">
                      {securitySettings.publicAccount ? '● PUBLIC Account' : '● PRIVATE Account'}
                    </span>
                  </div>
                </div>
                <div className="card-footer-link" onClick={() => window.location.href = 'https://www.b2auth.com/'}>
                  Protect your account
                </div>
              </div>

              {/* Account Storage Card */}
              <div className="account-info-card">
                <div className="card-top-content">
                  <div className="card-icon-container bg-orange-light">
                    <HardDrive className="text-orange" size={24} />
                  </div>
                  <h3 className="card-title">Account storage</h3>
                  <p className="card-description">
                    Your account storage is shared across BNX services, like BNX Mail and Drive.
                  </p>
                  
                  {/* Storage bar */}
                  <div className="storage-card-progress-wrapper">
                    <div className="progress-container-mini">
                      <div className="progress-bar-mini" style={{ width: `${storagePercentage}%` }}></div>
                    </div>
                    <div className="storage-text-mini">
                      {usedGB} GB of {totalGB} GB used
                    </div>
                  </div>
                </div>
                <div className="card-footer-link" onClick={() => setActiveTab('account-storage')}>
                  Manage storage
                </div>
              </div>

            </div>
          </div>
        );

      case 'personal-info':
        return (
          <div className="account-detail-panel">
            <h2 className="panel-title">Personal Information</h2>
            <p className="panel-subtitle">Manage details that other people see across BNX services.</p>
            
            <div className="profile-form-grid">
              <div className="form-section">
                <h3>Basic Profile info</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName" 
                    name="fullName" 
                    value={profile.fullName} 
                    onChange={handleProfileChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="username">Username</label>
                  <input 
                    type="text" 
                    id="username" 
                    name="username" 
                    value={profile.username} 
                    onChange={handleProfileChange}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label htmlFor="gender">Gender</label>
                    <select id="gender" name="gender" value={profile.gender} onChange={handleProfileChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Rather not say">Rather not say</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="birthday">Birthday</label>
                    <input 
                      type="date" 
                      id="birthday" 
                      name="birthday" 
                      value={profile.birthday} 
                      onChange={handleProfileChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input 
                    type="text" 
                    id="phone" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Contact Emails & Recovery</h3>
                
                <div className="email-list-container">
                  <div className="email-list-row primary">
                    <div>
                      <span className="email-tag primary">Primary</span>
                      <span className="email-val">{email}</span>
                    </div>
                    <span className="verified-badge">✓ Verified</span>
                  </div>

                  {profile.secondaryEmails.map((secEmail, idx) => (
                    <div className="email-list-row secondary" key={idx}>
                      <div>
                        <span className="email-tag secondary">Secondary</span>
                        <span className="email-val">{secEmail}</span>
                      </div>
                      <button 
                        type="button" 
                        className="email-delete-btn" 
                        onClick={() => handleRemoveSecondaryEmail(secEmail)}
                        title="Remove email"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddSecondaryEmail} className="add-email-form">
                  <label>Add Secondary Email</label>
                  <div className="input-group">
                    <input 
                      type="email" 
                      value={newSecEmail} 
                      onChange={(e) => setNewSecEmail(e.target.value)}
                      placeholder="e.g. secondary@bnxmail.com"
                    />
                    <button type="submit" className="btn-add-email">
                      <Plus size={16} /> Add
                    </button>
                  </div>
                  {emailError && <p className="form-error-msg">{emailError}</p>}
                </form>
              </div>
            </div>
            
            <div className="panel-footer-actions">
              <button 
                type="button" 
                className="btn-save-profile" 
                onClick={() => alert('Profile successfully updated!')}
              >
                Save Changes
              </button>
            </div>
          </div>
        );

      case 'payment-subscription':
        return (
          <div className="account-detail-panel">
            <h2 className="panel-title">Payments & Subscriptions</h2>
            <p className="panel-subtitle">Manage payment methods, transactions, and storage plan upgrades.</p>

            <div className="subscription-billing-grid">
              
              {/* Plan Card */}
              <div className="billing-card plan-info">
                <h3>Active Storage Plan</h3>
                <div className="plan-badge-container">
                  <span className="plan-title">BNX Storage Basic</span>
                  <span className="plan-price">Free</span>
                </div>
                <p className="plan-desc">Provides 5 GB allocation shared across BNX Mail, Drive, and collaboration tools.</p>
                <div className="plan-progress">
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${storagePercentage}%` }}></div>
                  </div>
                  <span className="progress-text">{usedGB} GB of {totalGB} GB consumed</span>
                </div>
                
                <hr className="billing-divider" />
                
                <h4 style={{ margin: '1rem 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>Upgrade to B2 Premium</h4>
                <div className="upgrade-options">
                  <button className="upgrade-btn-premium" onClick={() => alert('Simulated Upgrade: Expanded total pool size to 100 GB')}>
                    Upgrade to 100 GB ($1.99/mo)
                  </button>
                  <button className="upgrade-btn-premium secondary" onClick={() => alert('Simulated Upgrade: Expanded total pool size to 200 GB')}>
                    Upgrade to 200 GB ($2.99/mo)
                  </button>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="billing-card payment-info">
                <h3>Payment Methods</h3>
                <div className="credit-card-display">
                  <div className="cc-chip"></div>
                  <div className="cc-number">•••• •••• •••• 4242</div>
                  <div className="cc-footer">
                    <span className="cc-holder">{profile.fullName || 'Rahul Ram'}</span>
                    <span className="cc-exp">08/29</span>
                  </div>
                </div>
                <div className="payment-options">
                  <button className="btn-manage-pay" onClick={() => alert('Feature coming soon: Link credit card accounts.')}>
                    Update Card Details
                  </button>
                  <button className="btn-manage-pay secondary" onClick={() => alert('Feature coming soon: Add alternative payments.')}>
                    Add New Payment Method
                  </button>
                </div>
              </div>

            </div>
          </div>
        );

      case 'account-storage':
        return (
          <div className="account-detail-panel">
            <h2 className="panel-title">Account Storage Management</h2>
            <p className="panel-subtitle">Check your storage allocation and see details of space used by connected applications.</p>

            <div className="storage-detailed-dashboard">
              
              {/* Graph Breakdown */}
              <div className="storage-stat-banner">
                <div className="stat-circle">
                  <div className="stat-circle-inner">
                    <span className="stat-percent">{storagePercentage}%</span>
                    <span className="stat-label">Used</span>
                  </div>
                </div>
                <div className="stat-descriptions">
                  <div className="main-stat">{usedGB} GB used</div>
                  <div className="limit-stat">of {totalGB} GB limit</div>
                  <p className="storage-tip">
                    {storagePercentage > 85 
                      ? '⚠️ Storage space is running low. Consider deleting files in the recycle bin or upgrading your plan.' 
                      : '✓ You have plenty of available space in your storage pool.'
                    }
                  </p>
                </div>
              </div>

              <h3>Connected Applications</h3>
              <div className="storage-app-allocation-list">
                {apps.map(app => {
                  const appUsedMB = app.files.reduce((sum, f) => sum + f.size, 0);
                  const appUsedGB = (appUsedMB / 1024).toFixed(2);
                  const appAllocGB = (app.allocatedMB / 1024).toFixed(2);
                  const appPercent = app.allocatedMB > 0 ? Math.round((appUsedMB / app.allocatedMB) * 100) : 0;
                  
                  return (
                    <div className="app-storage-row" key={app.id}>
                      <div className="app-details">
                        <span className="app-name-bullet" style={{ backgroundColor: `rgb(${app.colorTheme})` }}></span>
                        <span className="app-name">{app.name}</span>
                        <span className="app-category">({app.category})</span>
                      </div>
                      <div className="app-progress-group">
                        <div className="progress-bar-container-mini">
                          <div 
                            className="progress-bar-mini" 
                            style={{ 
                              width: `${appPercent}%`,
                              backgroundColor: `rgb(${app.colorTheme})`
                            }}
                          ></div>
                        </div>
                        <span className="app-storage-numbers">
                          {appUsedGB} GB of {appAllocGB} GB
                        </span>
                        <span className="app-percent-label">{appPercent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="panel-footer-actions left-align">
                <button type="button" className="btn-dashboard-redirect" onClick={onBack}>
                  ← Back to Storage Dashboard
                </button>
              </div>

            </div>
          </div>
        );

      case 'b2auth':
        return (
          <div className="account-detail-panel">
            <h2 className="panel-title">B2Auth Security Settings</h2>
            <p className="panel-subtitle">Configure authentication rules, change passwords, and manage active sessions.</p>

            <div className="security-controls-grid">
              
              {/* Security Toggles */}
              <div className="security-card settings">
                <h3>Authentication Policies</h3>
                
                <div className="security-toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">2-Step Verification</span>
                    <span className="toggle-desc">Protect your account with double verification challenge.</span>
                  </div>
                  <label className="toggle-switch-container">
                    <input type="checkbox" checked={securitySettings.twoStepEnabled} onChange={toggleTwoStep} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="security-toggle-row">
                  <div className="toggle-info">
                    <span className="toggle-title">Publicly Visible Profile</span>
                    <span className="toggle-desc">Allow other users to check your file identity registry public profile.</span>
                  </div>
                  <label className="toggle-switch-container">
                    <input type="checkbox" checked={securitySettings.publicAccount} onChange={togglePublicAccount} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <hr className="billing-divider" />

                <h3>Reset Password</h3>
                <form onSubmit={handlePasswordChangeSubmit} className="password-change-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input 
                      type="password" 
                      value={passwordState.currentPassword}
                      onChange={(e) => setPasswordState(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input 
                      type="password" 
                      value={passwordState.newPassword}
                      onChange={(e) => setPasswordState(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Min 6 characters"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input 
                      type="password" 
                      value={passwordState.confirmPassword}
                      onChange={(e) => setPasswordState(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  {passMessage.text && (
                    <div className={`pass-message ${passMessage.type}`}>
                      {passMessage.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                      <span>{passMessage.text}</span>
                    </div>
                  )}
                  <button type="submit" className="btn-update-password">Update Password</button>
                </form>
              </div>

              {/* Sessions */}
              <div className="security-card sessions">
                <h3>Active Device Sessions</h3>
                <p className="card-description">These devices are currently logged in to your BNX account. Revoke unauthorized access.</p>
                
                <div className="sessions-list">
                  {securitySettings.sessions.map((sess) => (
                    <div className="session-item" key={sess.id}>
                      <div className="session-icon">
                        <Smartphone size={20} />
                      </div>
                      <div className="session-details">
                        <div className="session-device-name">
                          {sess.device} {sess.active && <span className="active-tag">Active Session</span>}
                        </div>
                        <div className="session-meta">
                          {sess.browser} • {sess.location}
                        </div>
                      </div>
                      {!sess.active && (
                        <button 
                          className="btn-revoke-session" 
                          onClick={() => handleRevokeSession(sess.id)}
                          title="Revoke session"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="account-mgmt-layout">
      {/* Top Navbar */}
      <header className="account-mgmt-navbar">
        <div className="navbar-brand-account">
          <img src="/logo.png" alt="Beta Logo" className="navbar-logo-account" />
          <span className="account-title-label">Account</span>
        </div>
        <div className="navbar-controls-account">
          <button className="navbar-btn-circle" title="Help">
            <HelpCircle size={20} />
          </button>
          <button className="navbar-btn-circle" title="BNX Ecosystem Apps">
            <Grid size={20} />
          </button>
          <div className="navbar-avatar-circle" onClick={onBack} title="Back to Storage Dashboard">
            {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : defaultUsername.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="account-mgmt-body">
        
        {/* Left Sidebar */}
        <aside className="account-mgmt-sidebar">
          <nav className="account-sidebar-nav">
            <div 
              className={`sidebar-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <Home size={18} />
              <span>Home</span>
            </div>

            <div 
              className={`sidebar-nav-item ${activeTab === 'personal-info' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal-info')}
            >
              <User size={18} />
              <span>Personal info</span>
            </div>

            <div 
              className={`sidebar-nav-item ${activeTab === 'payment-subscription' ? 'active' : ''}`}
              onClick={() => setActiveTab('payment-subscription')}
            >
              <CreditCard size={18} />
              <span>Payment & subscription</span>
            </div>

            <div 
              className={`sidebar-nav-item ${activeTab === 'account-storage' ? 'active' : ''}`}
              onClick={() => setActiveTab('account-storage')}
            >
              <HardDrive size={18} />
              <span>Account storage</span>
            </div>

            <div 
              className="sidebar-nav-item"
              onClick={() => window.location.href = 'https://www.b2auth.com/'}
            >
              <Shield size={18} />
              <span>B2Auth</span>
            </div>
          </nav>

          {/* Sign Out (at bottom) */}
          <div className="sidebar-nav-footer">
            <div className="sidebar-nav-item signout-btn" onClick={onLogout}>
              <LogOut size={18} />
              <span>Sign out</span>
            </div>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="account-mgmt-content">
          <div className="content-container">
            {renderTabContent()}
          </div>
        </main>

      </div>
    </div>
  );
}
