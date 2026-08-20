import React, { useState, useRef, useEffect } from 'react';
import { Bell, Settings, Shield, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

export default function Header({ systemHealth, notifications, clearNotifications, openAdminSettings }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const healthMeta = {
    healthy: { text: 'Healthy', color: 'var(--color-healthy)', bg: 'rgba(0, 230, 118, 0.1)', border: 'rgba(0, 230, 118, 0.2)' },
    warning: { text: 'Warning', color: 'var(--color-warning)', bg: 'rgba(255, 159, 0, 0.1)', border: 'rgba(255, 159, 0, 0.2)' },
    critical: { text: 'Critical', color: 'var(--color-critical)', bg: 'rgba(255, 61, 0, 0.1)', border: 'rgba(255, 61, 0, 0.2)' }
  };

  const status = healthMeta[systemHealth] || healthMeta.healthy;

  return (
    <header>
      <div className="brand-section">
        <h1>
          <span>BETA</span> STORAGE ECOSYSTEM
        </h1>
        <p>Centralized storage infrastructure for BETA applications</p>
      </div>

      <div className="header-controls">
        {/* Health status badge */}
        <div 
          className="status-badge" 
          style={{ 
            color: status.color, 
            backgroundColor: status.bg, 
            borderColor: status.border 
          }}
        >
          <span 
            className="status-dot-active" 
            style={{ 
              backgroundColor: status.color,
              animationName: systemHealth === 'critical' ? 'pulse-green' : 'pulse-green' // css handles animation
            }}
          />
          {status.text}
        </div>

        {/* Notifications Center */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="badge">{notifications.length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <span>SYSTEM ALERTS</span>
                {notifications.length > 0 && (
                  <button 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--accent-cyan)', 
                      fontSize: '0.7rem', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }} 
                    onClick={() => {
                      clearNotifications();
                      setShowNotifications(false);
                    }}
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="notification-body">
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    <CheckCircle size={24} style={{ color: 'var(--color-healthy)', margin: '0 auto 0.5rem', display: 'block' }} />
                    No active storage warnings
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div className="notification-item" key={i}>
                      {n.type === 'critical' ? (
                        <AlertCircle size={14} style={{ color: 'var(--color-critical)', flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <AlertTriangle size={14} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <div>
                        <div className="notification-msg">{n.message}</div>
                        <div className="notification-time">{n.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button className="icon-btn" onClick={openAdminSettings} title="Admin settings">
          <Settings size={18} />
        </button>

        {/* Admin role indicator */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15) 0%, rgba(79, 172, 254, 0.15) 100%)',
            border: '1px solid rgba(0, 242, 254, 0.25)',
            color: 'var(--accent-cyan)',
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            letterSpacing: '0.05rem'
          }}
        >
          <Shield size={14} />
          ADMIN
        </div>
      </div>
    </header>
  );
}
