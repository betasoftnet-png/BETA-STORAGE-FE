import React from 'react';
import { HardDrive, CheckCircle2, Cpu } from 'lucide-react';

export default function StorageInsights({ totalPoolMB, usedStorageMB, appsCount, maxAppsCount }) {
  const usedGB = (usedStorageMB / 1024).toFixed(1);
  const availableGB = ((totalPoolMB - usedStorageMB) / 1024).toFixed(1);
  
  const usedPercent = totalPoolMB > 0 ? Math.round((usedStorageMB / totalPoolMB) * 100) : 0;
  const availablePercent = 100 - usedPercent;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div className="card-title">
        <HardDrive size={18} style={{ color: 'var(--accent-cyan)' }} />
        STORAGE INSIGHTS
      </div>
      
      <div className="insights-grid">
        {/* Storage Used Card */}
        <div className="glass-card insight-card" style={{ borderLeft: '3px solid var(--accent-cyan)' }}>
          <span className="insight-label">STORAGE USED</span>
          <div className="insight-value-row">
            <span className="insight-value">{usedGB} GB</span>
          </div>
          <span className="insight-subtext" style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
            {usedPercent}%
          </span>
        </div>

        {/* Available Card */}
        <div className="glass-card insight-card" style={{ borderLeft: '3px solid var(--color-healthy)' }}>
          <span className="insight-label">AVAILABLE</span>
          <div className="insight-value-row">
            <span className="insight-value">{availableGB} GB</span>
          </div>
          <span className="insight-subtext" style={{ color: 'var(--color-healthy)', fontWeight: 'bold' }}>
            {availablePercent}%
          </span>
        </div>

        {/* Active Apps Card */}
        <div className="glass-card insight-card" style={{ borderLeft: '3px solid var(--accent-purple)' }}>
          <span className="insight-label">ACTIVE APPS</span>
          <div className="insight-value-row">
            <span className="insight-value">{appsCount}</span>
            <span className="insight-subtext" style={{ fontSize: '1.1rem', fontWeight: '600' }}>/ {maxAppsCount}</span>
          </div>
          <span className="insight-subtext" style={{ color: 'var(--text-muted)' }}>
            Ecosystem Capacity
          </span>
        </div>
      </div>
    </div>
  );
}
