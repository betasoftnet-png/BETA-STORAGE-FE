import React from 'react';
import { ArrowRight, Mail, LayoutGrid, Briefcase, HelpCircle, ShieldAlert } from 'lucide-react';

export default function AppCard({ app, onManage }) {
  const { id, name, category, allocatedMB, files, colorTheme } = app;
  
  // Calculate total used size
  const usedMB = files.reduce((acc, f) => acc + f.size, 0);
  const usedMBFormatted = usedMB >= 1024 ? `${(usedMB / 1024).toFixed(1)} GB` : `${Math.round(usedMB)} MB`;
  const allocatedGB = (allocatedMB / 1024).toFixed(0);
  const allocatedMBFormatted = allocatedMB >= 1024 ? `${allocatedGB} GB` : `${allocatedMB} MB`;
  
  const usedPercent = allocatedMB > 0 ? Math.round((usedMB / allocatedMB) * 100) : 0;
  const availableMB = Math.max(0, allocatedMB - usedMB);
  const availableMBFormatted = availableMB >= 1024 ? `${(availableMB / 1024).toFixed(1)} GB` : `${Math.round(availableMB)} MB`;

  // Dynamic Health status
  let healthStatus = 'HEALTHY';
  let healthColor = 'var(--color-healthy)';
  let healthBg = 'rgba(0, 230, 118, 0.1)';
  
  if (usedPercent >= 90) {
    healthStatus = 'CRITICAL';
    healthColor = 'var(--color-critical)';
    healthBg = 'rgba(255, 61, 0, 0.1)';
  } else if (usedPercent >= 75) {
    healthStatus = 'WARNING';
    healthColor = 'var(--color-warning)';
    healthBg = 'rgba(255, 159, 0, 0.1)';
  }

  // App icons mapping
  const getIcon = () => {
    switch (id) {
      case 'bnx-mail':
        return <Mail size={18} />;
      case 'cliks':
        return <LayoutGrid size={18} />;
      case 'cliks-business':
        return <Briefcase size={18} />;
      default:
        return <HelpCircle size={18} />;
    }
  };

  return (
    <div className="glass-card app-card" style={{ color: `rgb(${colorTheme})` }}>
      <div className="app-header">
        <div className="app-icon-title">
          <div 
            className="app-icon" 
            style={{ 
              backgroundColor: `rgba(${colorTheme}, 0.15)`, 
              color: `rgb(${colorTheme})`,
              border: `1px solid rgba(${colorTheme}, 0.3)`
            }}
          >
            {getIcon()}
          </div>
          <div className="app-info">
            <span className="app-name">{name}</span>
            <span className="app-category">{category}</span>
          </div>
        </div>
      </div>

      <div className="app-body">
        <div>
          <div className="app-storage-nums">
            <span className="app-storage-value">{usedMBFormatted}</span>
            <span className="app-storage-max">/ {allocatedMBFormatted}</span>
          </div>
          
          <div className="progress-container" style={{ margin: '0.5rem 0' }}>
            <div 
              className="progress-bar" 
              style={{ 
                width: `${Math.min(100, usedPercent)}%`,
                background: `rgb(${colorTheme})`,
                boxShadow: `0 0 8px rgba(${colorTheme}, 0.3)`
              }}
            />
          </div>

          <div className="app-health-row">
            <span style={{ color: `rgb(${colorTheme})` }}>{usedPercent}% USED</span>
            <span style={{ color: 'var(--text-muted)' }}>{availableMBFormatted} AVAILABLE</span>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '0.75rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <div 
            className="app-health-badge"
            style={{
              color: healthColor,
              backgroundColor: healthBg,
              border: `1px solid ${healthColor}20`,
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <span className="app-health-dot" style={{ backgroundColor: healthColor }} />
            {healthStatus}
          </div>

          <button 
            className="app-action-link" 
            onClick={onManage}
            style={{ background: 'none', border: 'none', font: 'inherit', padding: 0 }}
          >
            Manage <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
