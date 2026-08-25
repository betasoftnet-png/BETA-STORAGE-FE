import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCw, ChevronDown, Camera, UserPlus, LogOut, User } from 'lucide-react';

export default function Header({ 
  lastUpdated, 
  isRefreshing, 
  onRefresh,
  currentUserEmail,
  onLogout
}) {
  const { t } = useTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const email = currentUserEmail || 'rahulram042@bnxmail.com';
  const username = email.split('@')[0];
  const avatarChar = username.charAt(0).toUpperCase();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="navbar-card">
      <div className="navbar-brand">
        <img src="/logo.png" alt="Beta Logo" className="navbar-logo" />
        <span className="navbar-title">{t('dashboard.title')}</span>
      </div>

      <div className="navbar-controls" ref={dropdownRef}>
        <button 
          className="navbar-login-btn" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <User size={16} />
          <span>{t('header.login')}</span>
        </button>

        {/* Dropdown Card matching screenshot layout */}
        {isDropdownOpen && (
          <div className="profile-dropdown-card">
            <div className="profile-card-header">
              
              <div className="profile-card-avatar-wrapper">
                <div className="profile-card-avatar">{avatarChar}</div>
                <button className="profile-card-camera-btn" title="Change profile picture">
                  <Camera size={12} />
                </button>
              </div>

              <h3 className="profile-card-username">{username}</h3>
              <p className="profile-card-email">{email}</p>

              <button 
                type="button" 
                className="profile-manage-btn" 
                onClick={() => alert('Simulated: Open Account Settings Dialog')}
              >
                <User size={14} />
                <span>{t('header.manageAccount')}</span>
              </button>
            </div>

            <hr className="profile-card-divider" />

            <div className="profile-card-menu">
              <button 
                type="button" 
                className="profile-menu-item" 
                onClick={() => onLogout()}
              >
                <UserPlus size={16} />
                <span>{t('header.addAnotherAccount')}</span>
              </button>
              
              <button 
                type="button" 
                className="profile-menu-item" 
                onClick={() => onLogout()}
              >
                <LogOut size={16} />
                <span>{t('header.signOutThis')}</span>
              </button>
              
              <button 
                type="button" 
                className="profile-menu-item danger" 
                onClick={() => onLogout()}
              >
                <LogOut size={16} />
                <span>{t('header.signOutAll')}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </header>
  );
}
