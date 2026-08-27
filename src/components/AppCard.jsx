import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, LayoutGrid, Briefcase, HelpCircle, ArrowRight } from 'lucide-react';

export default function AppCard({ app, onManage, decimalPrecision = 2 }) {
  const { t } = useTranslation();
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
          {t('settings.manageApps.appLimitLabel', { appLimit: (allocatedMB / 1024).toFixed(decimalPrecision) })}
        </span>
      </div>

      {/* Progress & Value stats */}
      <div style={{ marginTop: '0.5rem' }}>
        <div className="app-card-numbers">
          <span style={{ color: `rgb(${colorTheme})` }}>{usedMB.toFixed(decimalPrecision)} MB {t('dashboard.used')}</span>
          <span style={{ color: 'var(--text-muted)' }}>{freeMB.toFixed(decimalPrecision)} MB {t('storageUsage.free')}</span>
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
          <span style={{ color: `rgb(${colorTheme})` }}>{usedPercent}% {t('dashboard.used')}</span>
          <span className="app-card-health" style={{ color: healthColor }}>
            <span className="app-card-health-dot" style={{ backgroundColor: healthColor }} />
            {t(`dashboard.health.status${healthStatus}`)}
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
