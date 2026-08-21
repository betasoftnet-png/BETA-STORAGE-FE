import React from 'react';
import { Mail, LayoutGrid, Briefcase, HelpCircle, ArrowRight } from 'lucide-react';

export default function AppCard({ app, onManage }) {
  const { id, name, category, allocatedMB, files, colorTheme } = app;

  // Calculate sizes
  const usedMB = files.reduce((acc, f) => acc + f.size, 0);
  const usedPercent = allocatedMB > 0 ? Math.round((usedMB / allocatedMB) * 100) : 0;
  const freeMB = Math.max(0, allocatedMB - usedMB);

  // App icon selection matching image
  const getIcon = () => {
    switch (id) {
      case 'bnx-mail':
        return <img src="/bnx_mail_logo.png" alt="BNX Mail" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />;
      case 'cliks':
        return <img src="/cliks_logo.png" alt="Cliks" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />;
      case 'cliks-business':
        return <img src="/cliks_business_logo.png" alt="Cliks Business" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />;
      default:
        return <HelpCircle size={18} />;
    }
  };

  return (
    <div className="glass-card app-card">
      {/* Top Header Row */}
      <div className="app-card-top">
        <div className="app-card-icon-title">
          <div
            className="app-card-icon"
            style={{
              backgroundColor: `rgba(${colorTheme}, 0.1)`,
              color: `rgb(${colorTheme})`
            }}
          >
            {getIcon()}
          </div>
          <div className="app-card-details">
            <span className="app-card-name">{name}</span>
            <span className="app-card-desc">{category}</span>
          </div>
        </div>
        <span className="app-card-badge">
          {(allocatedMB / 1024).toFixed(0)} GB Allocated
        </span>
      </div>

      {/* Progress & Value stats */}
      <div style={{ marginTop: '0.5rem' }}>
        <div className="app-card-numbers">
          <span style={{ color: `rgb(${colorTheme})` }}>{usedMB} MB Used</span>
          <span style={{ color: 'var(--text-muted)' }}>{freeMB} MB Free</span>
        </div>

        <div className="progress-container" style={{ marginBottom: '0.65rem' }}>
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(100, usedPercent)}%`,
              backgroundColor: `rgb(${colorTheme})`
            }}
          />
        </div>

        {/* Status indicator row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
          <span style={{ color: `rgb(${colorTheme})` }}>{usedPercent}% Used</span>
          <span className="app-card-health">
            <span className="app-card-health-dot" />
            Healthy
          </span>
        </div>
      </div>

      {/* Footer controls */}
      <div className="app-card-footer">
        <span
          className="app-card-link"
          onClick={onManage}
          style={{ color: `rgb(${colorTheme})` }}
        >
          View Details
        </span>
        <button
          onClick={onManage}
          style={{
            background: 'none',
            border: 'none',
            color: `rgb(${colorTheme})`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
