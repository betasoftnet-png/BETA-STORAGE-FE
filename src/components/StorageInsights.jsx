import React from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';

export default function StorageInsights({ totalPoolMB, usedStorageMB, apps }) {
  const totalUsedGB = (usedStorageMB / 1024).toFixed(1);
  const totalCapacityGB = (totalPoolMB / 1024).toFixed(0);
  const availableGB = ((totalPoolMB - usedStorageMB) / 1024).toFixed(1);

  // 1. Storage Distribution Data
  const appStats = apps.map(app => {
    const used = app.files.reduce((sum, f) => sum + f.size, 0);
    const percent = usedStorageMB > 0 ? Math.round((used / usedStorageMB) * 100) : 0;
    return {
      name: app.name,
      usedMB: used,
      percent,
      color: app.colorTheme
    };
  });

  // Calculate segment arcs for the Distribution Donut
  const r = 24;
  const circumference = 2 * Math.PI * r; // ~150.8
  let accumulatedPercent = 0;

  // 2. Storage by Category Data (calculated from actual app files)
  const categoryMap = {
    Documents: { size: 0, color: '#2563eb' }, // Blue
    Images: { size: 0, color: '#10b981' }, // Green
    Attachments: { size: 0, color: '#f59e0b' }, // Orange/Yellow
    Videos: { size: 0, color: '#8b5cf6' }, // Purple
    Others: { size: 0, color: '#94a3b8' } // Grey
  };

  apps.forEach(app => {
    app.files.forEach(file => {
      const type = file.type ? file.type.toLowerCase() : '';
      const name = file.name.toLowerCase();

      if (type.includes('image') || type.includes('media') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.fig')) {
        categoryMap.Images.size += file.size;
      } else if (type.includes('video') || name.endsWith('.mp4') || name.endsWith('.mov')) {
        categoryMap.Videos.size += file.size;
      } else if (name.endsWith('.pdf') || type.includes('pdf') || type.includes('attachment')) {
        categoryMap.Attachments.size += file.size;
      } else if (type.includes('document') || type.includes('audit') || type.includes('tax') || type.includes('sales') || type.includes('purchase') || type.includes('payroll') || name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.docx') || name.endsWith('.doc')) {
        categoryMap.Documents.size += file.size;
      } else {
        categoryMap.Others.size += file.size;
      }
    });
  });

  const categories = Object.keys(categoryMap).map(key => {
    const size = categoryMap[key].size;
    const percent = usedStorageMB > 0 ? Math.round((size / usedStorageMB) * 100) : 0;
    return {
      name: key,
      size,
      percent,
      color: categoryMap[key].color
    };
  });

  const hasCritical = apps.some(app => {
    const used = app.files.reduce((sum, f) => sum + f.size, 0);
    return app.allocatedMB > 0 && (used / app.allocatedMB) >= 0.9;
  });
  const hasWarning = apps.some(app => {
    const used = app.files.reduce((sum, f) => sum + f.size, 0);
    return app.allocatedMB > 0 && (used / app.allocatedMB) >= 0.75 && (used / app.allocatedMB) < 0.9;
  });
  const overallUsedPercent = totalPoolMB > 0 ? (usedStorageMB / totalPoolMB) : 0;

  let healthTitle = 'All systems healthy';
  let healthDesc = 'All applications are within their storage limits.';
  let healthColor = '#10b981';
  let healthIconColor = '#10b981';
  let healthIconBg = '#d1fae5';
  let healthBg = '#ecfdf5';
  let healthBorder = '#d1fae5';
  let healthTitleColor = '#065f46';
  let healthDescColor = '#047857';
  let HealthIcon = ShieldCheck;

  if (hasCritical || overallUsedPercent >= 0.85) {
    healthTitle = 'System Critical';
    healthDesc = 'Some applications have critically low storage space.';
    healthColor = '#ef4444';
    healthIconColor = '#ef4444';
    healthIconBg = '#fee2e2';
    healthBg = '#fef2f2';
    healthBorder = '#fca5a5';
    healthTitleColor = '#991b1b';
    healthDescColor = '#b91c1c';
    HealthIcon = ShieldAlert;
  } else if (hasWarning || overallUsedPercent >= 0.7) {
    healthTitle = 'System Warning';
    healthDesc = 'Storage space running low for some applications.';
    healthColor = '#f59e0b';
    healthIconColor = '#d97706';
    healthIconBg = '#fef3c7';
    healthBg = '#fffbeb';
    healthBorder = '#fde68a';
    healthTitleColor = '#92400e';
    healthDescColor = '#b45309';
    HealthIcon = ShieldAlert;
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div className="insights-grid">
        {/* Card 1: Storage Distribution */}
        <div className="glass-card insight-card">
          <div className="card-title" style={{ border: 'none', padding: 0, marginBottom: '1rem' }}>
            Storage Distribution
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
            Used storage breakdown by application
          </span>

          <div className="distribution-layout">
            {/* SVG Donut */}
            <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
              <svg width="90" height="90" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background base */}
                <circle cx="30" cy="30" r={r} fill="none" stroke="#f1f5f9" strokeWidth="6" />

                {/* Render segments */}
                {appStats.map((app, index) => {
                  const strokeLength = (app.percent / 100) * circumference;
                  const strokeOffset = circumference - strokeLength;
                  const dashOffset = -(accumulatedPercent / 100) * circumference;
                  accumulatedPercent += app.percent;

                  return (
                    <circle
                      key={index}
                      cx="30"
                      cy="30"
                      r={r}
                      fill="none"
                      stroke={`rgb(${app.color})`}
                      strokeWidth="6"
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={dashOffset}
                    />
                  );
                })}
              </svg>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{totalUsedGB} GB</span>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Used</span>
              </div>
            </div>

            {/* Legends */}
            <div className="distribution-legends">
              {appStats.map((app, i) => (
                <div className="legend-row" key={i}>
                  <span className="legend-label">
                    <span className="legend-dot" style={{ backgroundColor: `rgb(${app.color})` }} />
                    {app.name}
                  </span>
                  <span className="legend-value">{app.usedMB} MB ({app.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Storage by Category */}
        <div className="glass-card insight-card">
          <div className="card-title" style={{ border: 'none', padding: 0, marginBottom: '1rem' }}>
            Storage by Category
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1.25rem', marginTop: '-0.5rem' }}>
            Distribution across file categories
          </span>

          <div className="category-list">
            {categories.map((cat, i) => (
              <div className="category-row" key={i}>
                <div className="category-row-top">
                  <span className="category-row-label">
                    <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cat.color }} />
                    {cat.name}
                  </span>
                  <span className="category-row-value">{cat.size} MB ({cat.percent}%)</span>
                </div>
                <div className="progress-container" style={{ height: '4px' }}>
                  <div
                    className="progress-bar"
                    style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Storage Health */}
        <div className="glass-card insight-card">
          <div className="card-title" style={{ border: 'none', padding: 0, marginBottom: '1.25rem' }}>
            Storage Health
          </div>

          <div className="health-layout">
            <div className="health-status-box" style={{ backgroundColor: healthBg, borderColor: healthBorder }}>
              <div className="health-status-icon" style={{ backgroundColor: healthIconBg, color: healthIconColor }}>
                <HealthIcon size={24} />
              </div>
              <div className="health-status-info">
                <h4 style={{ color: healthTitleColor }}>{healthTitle}</h4>
                <p style={{ color: healthDescColor }}>{healthDesc}</p>
              </div>
            </div>

            <div className="health-metrics-row">
              <div className="health-metric-col">
                <span className="health-metric-val">{apps.length}</span>
                <span className="health-metric-lbl">Active Apps</span>
              </div>
              <div className="health-metric-col" style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', flex: 1, padding: '0 0.5rem' }}>
                <span className="health-metric-val">{availableGB} GB</span>
                <span className="health-metric-lbl">Available</span>
              </div>
              <div className="health-metric-col">
                <span className="health-metric-val">{totalCapacityGB} GB</span>
                <span className="health-metric-lbl">Total Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
