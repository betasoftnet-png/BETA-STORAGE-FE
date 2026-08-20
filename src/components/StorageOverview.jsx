import React from 'react';
import { Database } from 'lucide-react';

export default function StorageOverview({ totalPoolMB, usedStorageMB }) {
  const usedGB = (usedStorageMB / 1024).toFixed(1);
  const totalGB = (totalPoolMB / 1024).toFixed(1);
  const availableGB = ((totalPoolMB - usedStorageMB) / 1024).toFixed(1);
  const usedPercent = totalPoolMB > 0 ? Math.round((usedStorageMB / totalPoolMB) * 100) : 0;

  // Determine progress color gradient based on percentage
  const getProgressBarColor = () => {
    if (usedPercent >= 90) return 'linear-gradient(90deg, #ff3d00 0%, #d50000 100%)';
    if (usedPercent >= 75) return 'linear-gradient(90deg, #ff9f00 0%, #ff6d00 100%)';
    return 'linear-gradient(90deg, #00f2fe 0%, #4facfe 100%)';
  };

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
      <div className="card-title">
        <Database size={18} style={{ color: 'var(--accent-cyan)' }} />
        ECOSYSTEM OVERVIEW
      </div>
      
      <div className="overview-content">
        <div className="overview-gauge">
          <div className="overview-text">
            <div className="overview-total-label">Total Storage</div>
            <div className="overview-total-value">{totalGB} GB</div>
            <div className="overview-used-label">{usedGB} GB Used</div>
          </div>
          
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${usedPercent}%`,
                background: getProgressBarColor(),
                boxShadow: usedPercent > 75 
                  ? '0 0 10px rgba(255, 159, 0, 0.4)' 
                  : '0 0 10px rgba(0, 242, 254, 0.4)'
              }}
            />
          </div>
          
          <div className="overview-stats">
            <span style={{ color: usedPercent > 75 ? 'var(--color-warning)' : 'var(--text-main)' }}>
              {usedPercent}% USED
            </span>
            <span style={{ color: 'var(--text-muted)' }}>
              {availableGB} GB AVAILABLE
            </span>
          </div>
          
          <div style={{
            borderTop: '1px solid var(--border-color)',
            marginTop: '1.25rem',
            paddingTop: '0.75rem',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: 'var(--text-muted)'
          }}>
            <span>BETA STORAGE POOL</span>
            <span>{totalGB} GB</span>
          </div>
        </div>
      </div>
    </div>
  );
}
