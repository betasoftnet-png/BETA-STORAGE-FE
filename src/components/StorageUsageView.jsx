import React, { useState } from 'react';
import { ChevronRight, BarChart3, Database, HardDrive, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';

export default function StorageUsageView({ totalPoolMB, apps, onBack, onTriggerCleanup }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Identify specific applications
  const bnxMail = apps.find(a => a.id === 'bnx-mail');
  const cliks = apps.find(a => a.id === 'cliks');
  const cliksBusiness = apps.find(a => a.id === 'cliks-business');

  // Compute used space for each app
  const bnxUsedMB = bnxMail ? bnxMail.files.reduce((sum, f) => sum + f.size, 0) : 0;
  const cliksUsedMB = cliks ? cliks.files.reduce((sum, f) => sum + f.size, 0) : 0;
  const cliksBusinessUsedMB = cliksBusiness ? cliksBusiness.files.reduce((sum, f) => sum + f.size, 0) : 0;

  const totalUsedMB = bnxUsedMB + cliksUsedMB + cliksBusinessUsedMB;
  const availableMB = Math.max(0, totalPoolMB - totalUsedMB);

  // Formatting helpers
  const formatGB = (mb) => {
    return (mb / 1024).toFixed(1) + ' GB';
  };

  const formatSmart = (mb) => {
    if (mb >= 1024) {
      return (mb / 1024).toFixed(1) + ' GB';
    }
    return Math.round(mb) + ' MB';
  };

  const totalUsedGBText = (totalUsedMB / 1024).toFixed(1);

  // Configure segments for the donut chart
  const segments = [
    { id: 'bnx-mail', name: 'BNX Mail', size: bnxUsedMB, color: '#2563eb', percent: (bnxUsedMB / totalPoolMB) * 100 },
    { id: 'cliks-business', name: 'Cliks Business', size: cliksBusinessUsedMB, color: '#8b5cf6', percent: (cliksBusinessUsedMB / totalPoolMB) * 100 },
    { id: 'cliks', name: 'Cliks', size: cliksUsedMB, color: '#0d9488', percent: (cliksUsedMB / totalPoolMB) * 100 },
    { id: 'available', name: 'Available', size: availableMB, color: '#10b981', percent: (availableMB / totalPoolMB) * 100 }
  ];

  // SVG dimensions & drawing constants
  const radius = 55;
  const circumference = 2 * Math.PI * radius; // ~345.58
  let accumulatedPercent = 0;

  return (
    <div className="details-container">
      {/* 1. Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="crumb-link" onClick={onBack}>Storage Management</span>
        <ChevronRight size={14} className="crumb-separator" />
        <span className="crumb-active">Storage Usage</span>
      </div>

      {/* 2. Header Area */}
      <div className="details-header" style={{ marginBottom: '2rem' }}>
        <div className="details-header-title">
          <h2>Storage Usage Tracking</h2>
          <p>Real-time analytics and detailed storage allocation breakdown across all Beta applications.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
        {/* Left Side: Premium Interactive Chart Card */}
        <div className="glass-card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '420px', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2.5rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={20} style={{ color: 'var(--accent-blue)' }} /> Breakdown Chart
          </h3>

          <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <svg width="220" height="220" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              {/* Render segments */}
              {segments.map((seg, idx) => {
                // Subtract 2.5px gap to make clean segment separation as in the design
                const strokeLength = Math.max(0, (seg.percent / 100) * circumference - 2.5);
                const dashOffset = -(accumulatedPercent / 100) * circumference;
                accumulatedPercent += seg.percent;

                const isHovered = hoveredIndex === idx;

                return (
                  <circle
                    key={seg.name}
                    cx="65"
                    cy="65"
                    r={radius}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeDasharray={`${strokeLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="butt"
                    style={{
                      transition: 'opacity 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.55
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Central Info Label inside Donut */}
            <div style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-main)', lineHeight: '1.1' }}>
                {hoveredIndex !== null ? (segments[hoveredIndex].size / 1024).toFixed(1) : totalUsedGBText} GB
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.1rem', marginTop: '0.25rem' }}>
                {hoveredIndex !== null ? segments[hoveredIndex].name.toUpperCase() : 'USED'}
              </span>
            </div>
          </div>

          {/* <div style={{ marginTop: '2rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>* Hover over sections to focus</span>
          </div> */}
        </div>

        {/* Right Side: Professional Legend and Detailed Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Legend Details Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Ecosystem App Breakdown</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {segments.map((seg, idx) => {
                const isHovered = hoveredIndex === idx;
                return (
                  <div
                    key={seg.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      backgroundColor: isHovered ? 'var(--border-light)' : 'transparent',
                      border: '1px solid transparent',
                      borderColor: isHovered ? 'var(--border-color)' : 'transparent',
                      transition: 'background-color 0.2s ease, border-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: seg.color,
                        display: 'inline-block'
                      }} />
                      <span style={{ fontSize: '0.9rem', fontWeight: '600', color: isHovered ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {seg.name}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {formatSmart(seg.size)}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: '500' }}>
                        {seg.percent.toFixed(0)}% of total pool
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>TOTAL CAPACITY</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)' }}>{formatGB(totalPoolMB)}</span>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>AVAILABLE</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>{formatGB(availableMB)}</span>
            </div>
          </div>

          {/* Storage Cleanup Action Box */}
          <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent-blue)' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Need to reclaim space?</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Run cleanups inside individual app details to clear temporary files and logs.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
