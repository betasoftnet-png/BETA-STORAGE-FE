import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ChevronDown, Camera, UserPlus, LogOut, User } from 'lucide-react';

export default function Header({ 
  lastUpdated, 
  isRefreshing, 
  onRefresh,
  currentUserEmail,
  onLogout
}) {
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
    <header style={{ position: 'relative' }}>
      <div className="header-info">
        <h2>Storage Overview</h2>
        <p>Track and manage storage across your Beta ecosystem</p>
      </div>

      <div className="header-controls" ref={dropdownRef}>
        {/* Refresh widget */}
        <div className="header-update-tag" onClick={onRefresh}>
          <span>Last updated: {lastUpdated}</span>
          <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
        </div>

        {/* Profile Pill Badge (toggles dropdown card) */}
        <div 
          className="header-profile-badge" 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="header-profile-badge-avatar">{avatarChar}</div>
          <span className="header-profile-badge-username">{username}</span>
          <span className={`header-profile-badge-chevron ${isDropdownOpen ? 'open' : ''}`}>
            <ChevronDown size={14} />
          </span>
        </div>

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
                <span>Manage your account</span>
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
                <span>Add another account</span>
              </button>
              
              <button 
                type="button" 
                className="profile-menu-item" 
                onClick={() => onLogout()}
              >
                <LogOut size={16} />
                <span>Sign out of this account</span>
              </button>
              
              <button 
                type="button" 
                className="profile-menu-item danger" 
                onClick={() => onLogout()}
              >
                <LogOut size={16} />
                <span>Sign out of all accounts</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </header>
  );
}
