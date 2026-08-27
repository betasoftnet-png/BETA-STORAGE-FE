import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Shield, Bell, LayoutGrid, ChevronRight, Save, 
  RotateCcw, Server, RefreshCw
} from 'lucide-react';

export default function SettingsView({ 
  totalPoolMB, 
  apps, 
  onResizePool, 
  onUpdateAllocation,
  onBack 
}) {
  const { t, i18n } = useTranslation();

  // 1. Navigation Category tab state
  const [activeCategory, setActiveCategory] = useState('general'); // general | privacy | notifications | apps

  // 2. Default state values (for Reset action)
  const defaultStates = {
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    storageUnit: 'GB',
    decimalPrecision: '2 digits',
    showUsagePercent: true,
    showAvailableStorage: true,
    defaultView: 'Storage Overview',
    showAppStatus: true,
    showRecentActivity: true,
    showStorageAlerts: true,
    theme: 'System',
    compactLayout: false,
  };

  // 3. General -> Regional state
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('storageLanguage') || 'en');
  // General -> Storage Display state
  const [storageUnit, setStorageUnit] = useState(() => localStorage.getItem('settings_storage_unit') || defaultStates.storageUnit);
  const [decimalPrecision, setDecimalPrecision] = useState(() => localStorage.getItem('settings_decimal_precision') || defaultStates.decimalPrecision);
  const [showUsagePercent, setShowUsagePercent] = useState(() => localStorage.getItem('settings_show_usage_percent') !== 'false');
  const [showAvailableStorage, setShowAvailableStorage] = useState(() => localStorage.getItem('settings_show_avail_storage') !== 'false');

  // General -> Dashboard state
  const [defaultView, setDefaultView] = useState(() => localStorage.getItem('settings_default_view') || defaultStates.defaultView);
  const [showAppStatus, setShowAppStatus] = useState(() => localStorage.getItem('settings_show_app_status') !== 'false');
  const [showRecentActivity, setShowRecentActivity] = useState(() => localStorage.getItem('settings_show_recent_activity') !== 'false');
  const [showStorageAlerts, setShowStorageAlerts] = useState(() => localStorage.getItem('settings_show_storage_alerts') !== 'false');

  // General -> Appearance state
  const [theme, setTheme] = useState(() => localStorage.getItem('settings_theme') || defaultStates.theme);
  const [compactLayout, setCompactLayout] = useState(() => localStorage.getItem('settings_compact_layout') === 'true');

  // Privacy States
  const [encryptionEnabled, setEncryptionEnabled] = useState(() => localStorage.getItem('settings_privacy_encryption') === 'true');
  const [activityLogging, setActivityLogging] = useState(() => localStorage.getItem('settings_privacy_logging') !== 'false');

  // Notifications States
  const [warningThreshold, setWarningThreshold] = useState(() => parseInt(localStorage.getItem('settings_warning_threshold') || '80'));
  const [criticalThreshold, setCriticalThreshold] = useState(() => parseInt(localStorage.getItem('settings_critical_threshold') || '95'));
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('settings_alert_email') !== 'false');

  // Manage Apps States
  const [poolGB, setPoolGB] = useState(() => Math.round(totalPoolMB / 1024));
  const [appAllocations, setAppAllocations] = useState(() => {
    const allocations = {};
    apps.forEach(app => {
      allocations[app.id] = Math.round(app.allocatedMB / 1024);
    });
    return allocations;
  });

  // Sync state if props change
  useEffect(() => {
    setPoolGB(Math.round(totalPoolMB / 1024));
    const allocations = {};
    apps.forEach(app => {
      allocations[app.id] = Math.round(app.allocatedMB / 1024);
    });
    setAppAllocations(allocations);
  }, [totalPoolMB, apps]);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('#10b981'); // Green

  useEffect(() => {
    setStatusMessage(t('settings.successMessage'));
  }, [t]);

  const totalAllocatedGB = Object.values(appAllocations).reduce((sum, val) => sum + val, 0);
  const unallocatedGB = Math.max(0, poolGB - totalAllocatedGB);

  const handleReset = () => {
    if (window.confirm(t('settings.resetMessage'))) {
      i18n.changeLanguage('en');
      localStorage.setItem('storageLanguage', 'en');
      setSelectedLanguage('en');
      setStorageUnit(defaultStates.storageUnit);
      setDecimalPrecision(defaultStates.decimalPrecision);
      setShowUsagePercent(defaultStates.showUsagePercent);
      setShowAvailableStorage(defaultStates.showAvailableStorage);
      setDefaultView(defaultStates.defaultView);
      setShowAppStatus(defaultStates.showAppStatus);
      setShowRecentActivity(defaultStates.showRecentActivity);
      setShowStorageAlerts(defaultStates.showStorageAlerts);
      setTheme(defaultStates.theme);
      setCompactLayout(defaultStates.compactLayout);

      document.documentElement.removeAttribute('data-theme');
      setStatusMessage(t('settings.resetMessage'));
      setStatusColor('#3b82f6');
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleLanguageChange = (lngCode) => {
    setSelectedLanguage(lngCode);
  };

  const handleSaveGeneral = () => {
    setIsSaving(true);
    setStatusMessage(t('settings.successMessage'));
    setStatusColor('#3b82f6');

    setTimeout(() => {
      localStorage.setItem('settings_storage_unit', storageUnit);
      localStorage.setItem('settings_decimal_precision', decimalPrecision);
      localStorage.setItem('settings_show_usage_percent', showUsagePercent.toString());
      localStorage.setItem('settings_show_avail_storage', showAvailableStorage.toString());
      localStorage.setItem('settings_default_view', defaultView);
      localStorage.setItem('settings_show_app_status', showAppStatus.toString());
      localStorage.setItem('settings_show_recent_activity', showRecentActivity.toString());
      localStorage.setItem('settings_show_storage_alerts', showStorageAlerts.toString());
      localStorage.setItem('settings_theme', theme);
      localStorage.setItem('settings_compact_layout', compactLayout.toString());

      // Apply theme changes to document
      if (theme === 'Dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else if (theme === 'Light') {
        document.documentElement.setAttribute('data-theme', 'light');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      // Apply language changes to i18n
      i18n.changeLanguage(selectedLanguage);
      localStorage.setItem('storageLanguage', selectedLanguage);

      setIsSaving(false);
      setStatusMessage(t('settings.successMessage'));
      setStatusColor('#10b981');
    }, 850);
  };

  const handleSavePrivacy = () => {
    setIsSaving(true);
    setStatusMessage(t('settings.successMessage'));
    setStatusColor('#3b82f6');

    setTimeout(() => {
      localStorage.setItem('settings_privacy_encryption', encryptionEnabled.toString());
      localStorage.setItem('settings_privacy_logging', activityLogging.toString());
      setIsSaving(false);
      setStatusMessage(t('settings.successMessage'));
      setStatusColor('#10b981');
    }, 800);
  };

  const handleSaveNotifications = () => {
    setIsSaving(true);
    setStatusMessage(t('settings.successMessage'));
    setStatusColor('#3b82f6');

    setTimeout(() => {
      localStorage.setItem('settings_warning_threshold', warningThreshold.toString());
      localStorage.setItem('settings_critical_threshold', criticalThreshold.toString());
      localStorage.setItem('settings_alert_email', emailAlerts.toString());
      setIsSaving(false);
      setStatusMessage(t('settings.successMessage'));
      setStatusColor('#10b981');
    }, 800);
  };

  const handleSaveAppAllocations = () => {
    setIsSaving(true);
    setStatusMessage(t('settings.successMessage'));
    setStatusColor('#3b82f6');

    setTimeout(() => {
      const targetPoolMB = poolGB * 1024;
      if (targetPoolMB < totalAllocatedGB * 1024) {
        setStatusMessage(`Error: Pool size cannot be smaller than total allocation (${totalAllocatedGB} GB)`);
        setStatusColor('#ef4444');
        setIsSaving(false);
        return;
      }
      
      onResizePool(targetPoolMB);

      Object.keys(appAllocations).forEach(appId => {
        const targetAllocationMB = appAllocations[appId] * 1024;
        const appObj = apps.find(a => a.id === appId);
        const currentUsedMB = appObj ? appObj.files.reduce((sum, f) => sum + f.size, 0) : 0;
        
        if (targetAllocationMB >= currentUsedMB) {
          onUpdateAllocation(appId, targetAllocationMB);
        }
      });

      setIsSaving(false);
      setStatusMessage(t('settings.successMessage'));
      setStatusColor('#10b981');
    }, 800);
  };

  const handleAppSliderChange = (appId, valGB, minGB) => {
    const nextAllocations = { ...appAllocations, [appId]: Math.max(minGB, valGB) };
    const nextTotalAllocatedGB = Object.values(nextAllocations).reduce((sum, val) => sum + val, 0);
    
    if (nextTotalAllocatedGB <= poolGB) {
      setAppAllocations(nextAllocations);
    }
  };

  // Common styling specs to match clean, borders-light look
  const rowItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid var(--border-light)',
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    fontWeight: '550'
  };

  const lastRowItemStyle = {
    ...rowItemStyle,
    borderBottom: 'none'
  };

  const sectionHeaderStyle = {
    fontSize: '0.72rem',
    fontWeight: '800',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05rem',
    padding: '0.75rem 1.25rem 0.5rem 1.25rem',
    margin: 0,
    backgroundColor: 'rgba(241, 245, 249, 0.35)',
    borderBottom: '1px solid var(--border-light)'
  };

  const selectStyle = {
    border: 'none',
    background: 'none',
    textAlign: 'right',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
    outline: 'none',
    paddingRight: '0.25rem'
  };

  const toggleBtnStyle = (active) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.8rem',
    color: active ? '#10b981' : '#94a3b8',
    outline: 'none',
    padding: 0
  });

  return (
    <div className="details-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="crumb-link" onClick={onBack}>{t('appStorageDetails.breadcrumbsTitle')}</span>
        <ChevronRight size={14} className="crumb-separator" />
        <span className="crumb-active">{t('sidebar.settings')}</span>
      </div>

      {/* Main Settings Panel */}
      <div className="glass-card" style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '620px', borderRadius: '16px', overflow: 'hidden', padding: 0, border: '1px solid var(--border-color)', background: 'rgba(255, 255, 255, 0.45)' }}>
        
        {/* Left Category Menu Sidebar */}
        <div style={{ borderRight: '1px solid var(--border-color)', padding: '1.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(248, 250, 252, 0.45)' }}>
          <h2 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06rem', paddingLeft: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            {t('settings.sidebarTitle')}
          </h2>

          {/* Tab 1: General */}
          <button
            onClick={() => setActiveCategory('general')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              width: '100%',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: activeCategory === 'general' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'none',
              color: activeCategory === 'general' ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
              <Settings size={15} />
              {t('settings.general.title')}
            </div>
            <span style={{ fontSize: '0.7rem', color: activeCategory === 'general' ? 'rgba(255,255,255,0.75)' : '#64748b', paddingLeft: '1.45rem', fontWeight: 500 }}>
              {t('settings.general.subtitle')}
            </span>
          </button>

          {/* Tab 2: Privacy */}
          <button
            onClick={() => setActiveCategory('privacy')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              width: '100%',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: activeCategory === 'privacy' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'none',
              color: activeCategory === 'privacy' ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
              <Shield size={15} />
              {t('settings.privacy.title')}
            </div>
            <span style={{ fontSize: '0.7rem', color: activeCategory === 'privacy' ? 'rgba(255,255,255,0.75)' : '#64748b', paddingLeft: '1.45rem', fontWeight: 500 }}>
              {t('settings.privacy.subtitle')}
            </span>
          </button>

          {/* Tab 3: Notifications */}
          <button
            onClick={() => setActiveCategory('notifications')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              width: '100%',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: activeCategory === 'notifications' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'none',
              color: activeCategory === 'notifications' ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
              <Bell size={15} />
              {t('settings.notifications.title')}
            </div>
            <span style={{ fontSize: '0.7rem', color: activeCategory === 'notifications' ? 'rgba(255,255,255,0.75)' : '#64748b', paddingLeft: '1.45rem', fontWeight: 500 }}>
              {t('settings.notifications.subtitle')}
            </span>
          </button>

          {/* Tab 4: Manage Apps */}
          <button
            onClick={() => setActiveCategory('apps')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.15rem',
              width: '100%',
              padding: '0.75rem 0.85rem',
              borderRadius: '10px',
              border: 'none',
              background: activeCategory === 'apps' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'none',
              color: activeCategory === 'apps' ? '#ffffff' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.88rem' }}>
              <LayoutGrid size={15} />
              {t('settings.manageApps.title')}
            </div>
            <span style={{ fontSize: '0.7rem', color: activeCategory === 'apps' ? 'rgba(255,255,255,0.75)' : '#64748b', paddingLeft: '1.45rem', fontWeight: 500 }}>
              {t('settings.manageApps.subtitle')}
            </span>
          </button>
        </div>

        {/* Right Settings Content Area */}
        <div style={{ padding: '2rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
          
          {/* GENERAL TAB CONTENT */}
          {activeCategory === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: 'var(--text-main)', margin: 0 }}>{t('settings.general.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>{t('settings.general.subtitle')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }} />
                  <span>{statusMessage}</span>
                </div>
              </div>

              {/* CARD 1: REGIONAL */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.general.regionalTitle')}</h3>
                {/* Language Row */}
                <div style={lastRowItemStyle}>
                  <span>{t('settings.general.languageLabel')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="en">English</option>
                      <option value="de">German</option>
                      <option value="es">Spanish</option>
                    </select>
                    <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                  </div>
                </div>
              </div>

              {/* CARD 2: STORAGE DISPLAY */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.general.storageDisplayTitle')}</h3>

                {/* Storage Unit Radio */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.storageUnitLabel')}</span>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      <input 
                        type="radio" 
                        name="storageUnit" 
                        checked={storageUnit === 'GB'} 
                        onChange={() => setStorageUnit('GB')} 
                      />
                      GB
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      <input 
                        type="radio" 
                        name="storageUnit" 
                        checked={storageUnit === 'TB'} 
                        onChange={() => setStorageUnit('TB')} 
                      />
                      TB
                    </label>
                  </div>
                </div>

                {/* Decimal Precision Row */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.decimalPrecisionLabel')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <select
                      value={decimalPrecision}
                      onChange={(e) => setDecimalPrecision(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="2 digits">2 digits</option>
                      <option value="1 digit">1 digit</option>
                      <option value="0 digits">0 digits</option>
                    </select>
                    <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                  </div>
                </div>

                {/* Show Usage Percentage Row */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.showUsagePercentLabel')}</span>
                  <button 
                    onClick={() => setShowUsagePercent(!showUsagePercent)}
                    style={toggleBtnStyle(showUsagePercent)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{showUsagePercent ? '●' : '○'}</span>
                    <span>{showUsagePercent ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>

                {/* Show Available Storage Row */}
                <div style={lastRowItemStyle}>
                  <span>{t('settings.general.showAvailableStorageLabel')}</span>
                  <button 
                    onClick={() => setShowAvailableStorage(!showAvailableStorage)}
                    style={toggleBtnStyle(showAvailableStorage)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{showAvailableStorage ? '●' : '○'}</span>
                    <span>{showAvailableStorage ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>
              </div>

              {/* CARD 3: DASHBOARD */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.general.dashboardTitle')}</h3>

                {/* Default View Row */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.defaultViewLabel')}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                    <select
                      value={defaultView}
                      onChange={(e) => setDefaultView(e.target.value)}
                      style={selectStyle}
                    >
                      <option value="Storage Overview">Storage Overview</option>
                      <option value="Recycle Bin">Recycle Bin</option>
                    </select>
                    <ChevronRight size={14} style={{ color: '#94a3b8' }} />
                  </div>
                </div>

                {/* Show Application Status Row */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.showAppStatusLabel')}</span>
                  <button 
                    onClick={() => setShowAppStatus(!showAppStatus)}
                    style={toggleBtnStyle(showAppStatus)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{showAppStatus ? '●' : '○'}</span>
                    <span>{showAppStatus ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>

                {/* Show Recent Activity Row */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.showRecentActivityLabel')}</span>
                  <button 
                    onClick={() => setShowRecentActivity(!showRecentActivity)}
                    style={toggleBtnStyle(showRecentActivity)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{showRecentActivity ? '●' : '○'}</span>
                    <span>{showRecentActivity ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>

                {/* Show Storage Alerts Row */}
                <div style={lastRowItemStyle}>
                  <span>{t('settings.general.showStorageAlertsLabel')}</span>
                  <button 
                    onClick={() => setShowStorageAlerts(!showStorageAlerts)}
                    style={toggleBtnStyle(showStorageAlerts)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{showStorageAlerts ? '●' : '○'}</span>
                    <span>{showStorageAlerts ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>
              </div>

              {/* CARD 4: APPEARANCE */}
              <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.general.appearanceTitle')}</h3>

                {/* Theme Radio */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.themeLabel')}</span>
                  <div style={{ display: 'flex', gap: '1.25rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={theme === 'Light'} 
                        onChange={() => handleThemeChange('Light')} 
                      />
                      {t('settings.general.light')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={theme === 'System'} 
                        onChange={() => handleThemeChange('System')} 
                      />
                      {t('settings.general.system')}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      <input 
                        type="radio" 
                        name="theme" 
                        checked={theme === 'Dark'} 
                        onChange={() => handleThemeChange('Dark')} 
                      />
                      {t('settings.general.dark')}
                    </label>
                  </div>
                </div>

                {/* Compact Layout Row */}
                <div style={lastRowItemStyle}>
                  <span>{t('settings.general.compactLayoutLabel')}</span>
                  <button 
                    onClick={() => setCompactLayout(!compactLayout)}
                    style={toggleBtnStyle(compactLayout)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{compactLayout ? '●' : '○'}</span>
                    <span>{compactLayout ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleReset}
                  className="btn-danger-outline"
                  style={{ width: 'auto', padding: '0.6rem 1.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                >
                  <RotateCcw size={14} />
                  {t('common.reset')}
                </button>
                <button 
                  onClick={handleSaveGeneral}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.65rem 1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                >
                  {isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                  {t('common.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* PRIVACY TAB CONTENT */}
          {activeCategory === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: 'var(--text-main)', margin: 0 }}>{t('settings.privacy.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>{t('settings.privacy.subtitle')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }} />
                  <span>{statusMessage}</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.privacy.securityPoliciesTitle')}</h3>

                <div style={rowItemStyle}>
                  <span>{t('settings.privacy.encryptionLabel')}</span>
                  <button 
                    onClick={() => setEncryptionEnabled(!encryptionEnabled)}
                    style={toggleBtnStyle(encryptionEnabled)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{encryptionEnabled ? '●' : '○'}</span>
                    <span>{encryptionEnabled ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>

                <div style={lastRowItemStyle}>
                  <span>{t('settings.privacy.loggingLabel')}</span>
                  <button 
                    onClick={() => setActivityLogging(!activityLogging)}
                    style={toggleBtnStyle(activityLogging)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{activityLogging ? '●' : '○'}</span>
                    <span>{activityLogging ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.65rem 1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                >
                  {isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                  {t('common.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB CONTENT */}
          {activeCategory === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: 'var(--text-main)', margin: 0 }}>{t('settings.notifications.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>{t('settings.notifications.subtitle')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }} />
                  <span>{statusMessage}</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  {t('settings.notifications.alertConfigTitle')}
                </h3>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    <span>{t('settings.notifications.warningThresholdLabel')}</span>
                    <span style={{ color: '#f59e0b' }}>{warningThreshold}%</span>
                  </div>
                  <input 
                    type="range"
                    min="50"
                    max="89"
                    value={warningThreshold}
                    onChange={(e) => setWarningThreshold(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#f59e0b' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700', marginBottom: '0.35rem' }}>
                    <span>{t('settings.notifications.criticalThresholdLabel')}</span>
                    <span style={{ color: '#ef4444' }}>{criticalThreshold}%</span>
                  </div>
                  <input 
                    type="range"
                    min="90"
                    max="99"
                    value={criticalThreshold}
                    onChange={(e) => setCriticalThreshold(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#ef4444' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
                  <span>{t('settings.notifications.emailAlertsLabel')}</span>
                  <button 
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    style={toggleBtnStyle(emailAlerts)}
                  >
                    <span style={{ fontSize: '0.65rem' }}>{emailAlerts ? '●' : '○'}</span>
                    <span>{emailAlerts ? t('common.on') : t('common.off')}</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleSaveNotifications}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.65rem 1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                >
                  {isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                  {t('common.saveChanges')}
                </button>
              </div>
            </div>
          )}

          {/* MANAGE APPS TAB CONTENT */}
          {activeCategory === 'apps' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '850', color: 'var(--text-main)', margin: 0 }}>{t('settings.manageApps.title')}</h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.15rem' }}>{t('settings.manageApps.subtitle')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: statusColor }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }} />
                  <span>{statusMessage}</span>
                </div>
              </div>

              {/* Pool Size Section */}
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', backgroundColor: 'rgba(37, 99, 235, 0.03)', padding: '1.25rem', borderRadius: '12px', border: '1px dashed rgba(37, 99, 235, 0.2)' }}>
                <Server size={28} style={{ color: '#2563eb' }} />
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 'bold', display: 'block', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>
                    {t('settings.manageApps.capacityPoolLabel')}
                  </label>
                  <input 
                    type="number"
                    min={Math.ceil(totalAllocatedGB)}
                    className="form-control"
                    value={poolGB}
                    onChange={(e) => setPoolGB(Math.max(Math.ceil(totalAllocatedGB), parseInt(e.target.value) || 1))}
                    style={{ width: '120px', padding: '6px 10px', fontSize: '0.85rem', fontWeight: 'bold', height: 'auto', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{t('settings.manageApps.unallocatedSpaceLabel')}:</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '900', display: 'block', color: '#10b981' }}>{unallocatedGB} GB</span>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  {t('settings.manageApps.appAllocationTitle')}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {apps.map(app => {
                    const currentUsedMB = app.files.reduce((acc, f) => acc + f.size, 0);
                    const currentLimitGB = appAllocations[app.id] || Math.round(app.allocatedMB / 1024);
                    const currentUsedGB = currentUsedMB / 1024;
                    const appPercent = currentLimitGB > 0 ? Math.round((currentUsedGB / currentLimitGB) * 100) : 0;
                    
                    const minSliderGB = Math.max(1, Math.ceil(currentUsedGB));
                    const maxSliderGB = poolGB - (totalAllocatedGB - currentLimitGB);

                    return (
                      <div key={app.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: `rgb(${app.colorTheme})` }}>{app.name}</span>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {t('settings.manageApps.appLimitLabel', { appLimit: currentLimitGB })}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                          <input 
                            type="range"
                            min={minSliderGB}
                            max={Math.max(minSliderGB, Math.floor(maxSliderGB))}
                            step="1"
                            value={currentLimitGB}
                            className="settings-slider"
                            onChange={(e) => handleAppSliderChange(app.id, parseInt(e.target.value), minSliderGB)}
                            style={{ accentColor: `rgb(${app.colorTheme})`, flex: 1 }}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, minWidth: '45px', textAlign: 'right' }}>
                            {t('settings.manageApps.limitUsedLabel', { percent: appPercent })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleSaveAppAllocations}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.65rem 1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}
                >
                  {isSaving ? <RefreshCw size={14} className="spin" /> : <Save size={14} />}
                  {t('common.saveChanges')}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
