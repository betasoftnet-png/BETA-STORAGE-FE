import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, LayoutGrid, Briefcase, HelpCircle, ArrowRight } from 'lucide-react';
import { formatBytes } from '../utils/storage';

export default function AppCard({ app, onManage, decimalPrecision = 2, showUsagePercent = true, showAppStatus = true }) {
  const { t } = useTranslation();
  const { id, name, category, allocatedMB, files, colorTheme, usedBytes, allocatedBytes, storagePercentage } = app;

  // Calculate sizes (prioritizing backend bytes if provided, otherwise file sum)
  const filesUsedMB = files ? files.reduce((acc, f) => acc + f.size, 0) : 0;
  const totalAllocatedBytes = allocatedBytes !== undefined ? allocatedBytes : allocatedMB * 1024 * 1024;
  const totalUsedBytes = usedBytes !== undefined ? usedBytes : filesUsedMB * 1024 * 1024;
  const freeBytes = Math.max(0, totalAllocatedBytes - totalUsedBytes);

  const usedDisplay = formatBytes(totalUsedBytes, decimalPrecision);
  const freeDisplay = formatBytes(freeBytes, decimalPrecision);
  const limitDisplay = formatBytes(totalAllocatedBytes, decimalPrecision);

  // Use storagePercentage directly from backend when available, or calculate fallback
  const usedPercent = storagePercentage !== undefined
    ? storagePercentage
    : (allocatedMB > 0 ? Math.round((filesUsedMB / allocatedMB) * 100) : 0);

  // App icon selection
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

  const isCritical = usedPercent >= 90;
  const isWarning = usedPercent >= 75 && usedPercent < 90;
  const healthStatus = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy';
  const healthColor = isCritical ? 'var(--color-critical)' : isWarning ? 'var(--color-warning)' : 'var(--color-healthy)';

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
          {limitDisplay}
        </span>
      </div>

      {/* Progress & Value stats */}
      <div style={{ marginTop: '0.5rem' }}>
        <div className="app-card-numbers">
          <span style={{ color: `rgb(${colorTheme})` }}>{usedDisplay} {t('dashboard.used')}</span>
          <span style={{ color: 'var(--text-muted)' }}>{freeDisplay} {t('storageUsage.free')}</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-container" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9', margin: '0.6rem 0' }}>
          <div
            className="progress-bar"
            style={{
              width: `${Math.min(100, Math.max(usedPercent, usedPercent > 0 ? 1 : 0))}%`,
              backgroundColor: `rgb(${colorTheme})`,
              borderRadius: '3px',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* Status indicator row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600 }}>
          {showUsagePercent ? (
            <span style={{ color: `rgb(${colorTheme})` }}>{usedPercent}% {t('dashboard.used')}</span>
          ) : (
            <span />
          )}
          {showAppStatus && (
            <span className="app-card-health" style={{ color: healthColor }}>
              <span className="app-card-health-dot" style={{ backgroundColor: healthColor }} />
              {t(`dashboard.health.status${healthStatus}`)}
            </span>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="app-card-footer">
        <span
          className="app-card-link"
          onClick={onManage}
          style={{ color: `rgb(${colorTheme})` }}
        >
          {t('common.viewDetails')}
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
