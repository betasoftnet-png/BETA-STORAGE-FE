import React from 'react';
import { Database, HardDrive } from 'lucide-react';

export default function StorageOverview({ totalPoolMB, usedStorageMB }) {
  const usedGB = (usedStorageMB / 1024).toFixed(1);
  const totalGB = (totalPoolMB / 1024).toFixed(0);
  const availableGB = ((totalPoolMB - usedStorageMB) / 1024).toFixed(1);
  const usedPercent = totalPoolMB > 0 ? Math.round((usedStorageMB / totalPoolMB) * 100) : 0;

  // Donut SVG constants
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const strokeDashoffset = circumference - (usedPercent / 100) * circumference;

  return (
    <div className="glass-card overview-card" style={{ marginBottom: '2rem' }}>
      {/* Left Spec (Used capacity focus) */}
      <div className="overview-left">
        <div className="label">Total Ecosystem Storage</div>
        <div className="value">{usedGB} GB</div>
        <div className="sub">of {totalGB} GB Used</div>
      </div>

      {/* Center SVG Donut */}
      <div className="overview-center" style={{ position: 'relative', width: '130px', height: '130px' }}>
        <svg width="120" height="120" className="donut-chart-svg">
          {/* Track */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            className="donut-track" 
          />
          {/* Segment */}
          <circle 
            cx="60" 
            cy="60" 
            r={radius} 
            className="donut-segment"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ stroke: 'rgba(37, 99, 235, 0.85)' }}
          />
        </svg>
        <div className="donut-inner-text">
          <span className="donut-inner-percent">{usedPercent}%</span>
          <span className="donut-inner-label">Used</span>
        </div>
      </div>

      {/* Right Metrics Grid */}
      <div className="overview-right">
        {/* Used Storage */}
        <div className="overview-metric-row">
          <div className="overview-metric-icon" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
            <HardDrive size={18} />
          </div>
          <div className="overview-metric-info">
            <span className="overview-metric-value">{usedGB} GB</span>
            <span className="overview-metric-label">Used Storage</span>
          </div>
        </div>

        {/* Available Storage */}
        <div className="overview-metric-row">
          <div className="overview-metric-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <Database size={18} />
          </div>
          <div className="overview-metric-info">
            <span className="overview-metric-value">{availableGB} GB</span>
            <span className="overview-metric-label">Available Storage</span>
          </div>
        </div>
      </div>

      {/* Far Right Cloud Server Graphics Illustration */}
      <div className="overview-graphic" style={{ opacity: 0.8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
        <svg width="150" height="60" viewBox="0 0 150 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cloud Outline */}
          <path d="M115 40C115 33.7 109.9 28.6 103.5 28.6C103 28.6 102.5 28.7 102 28.8C99.1 21.6 92 16.5 83.7 16.5C74 16.5 65.9 23.1 64.1 32C63.1 31.8 61.9 31.6 60.8 31.6C53.1 31.6 47 37.7 47 45.4C47 53.1 53.1 59.2 60.8 59.2H103.5H115C121.4 59.2 126.5 54.1 126.5 47.7C126.5 42 121.4 40.5 115 40Z" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="1.2" strokeLinejoin="round" />
          
          {/* Server Rack Box inside illustration */}
          <rect x="85" y="32" width="30" height="24" rx="3" fill="#ffffff" stroke="#93c5fd" strokeWidth="1.2" />
          <line x1="89" y1="38" x2="111" y2="38" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="91.5" cy="38" r="1" fill="#3b82f6" />
          <line x1="89" y1="44" x2="111" y2="44" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="91.5" cy="44" r="1" fill="#10b981" />
          <line x1="89" y1="50" x2="111" y2="50" stroke="#bfdbfe" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="91.5" cy="50" r="1" fill="#3b82f6" />
        </svg>
        <div style={{ textAlign: 'center', marginTop: '-0.25rem' }}>
          <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', fontFamily: 'var(--font-sans)', lineHeight: 1.1 }}>{totalGB} GB</div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Capacity</div>
        </div>
      </div>
    </div>
  );
}
