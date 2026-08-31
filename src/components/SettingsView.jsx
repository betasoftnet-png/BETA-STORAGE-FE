import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Shield, Bell, LayoutGrid, ChevronRight, ChevronDown, Check, Save, 
  RotateCcw, Server, RefreshCw, Lock, Layers, Users, Mail, FileText, Briefcase, 
  Trash2, Download, Clock, AlertTriangle, X, Search, ShieldCheck
} from 'lucide-react';

export default function SettingsView({ 
  totalPoolMB, 
  apps, 
  onResizePool, 
  onUpdateAllocation,
  onBack,
  onSaveSettings
}) {
  const { t, i18n } = useTranslation();

  // Custom Dropdowns States, Refs & Lists
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const languagesList = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'German' },
    { code: 'es', label: 'Spanish' }
  ];

  const [isPrecisionOpen, setIsPrecisionOpen] = useState(false);
  const precisionRef = useRef(null);
  const precisionList = [
    { code: '3 digits', label: '3 digits' },
    { code: '2 digits', label: '2 digits' },
    { code: '1 digit', label: '1 digit' },
    { code: '0 digits', label: '0 digits' }
  ];

  const [isDefaultViewOpen, setIsDefaultViewOpen] = useState(false);
  const defaultViewRef = useRef(null);
  const defaultViewList = [
    { code: 'Storage Overview', label: 'Storage Overview' },
    { code: 'Recycle Bin', label: 'Recycle Bin' }
  ];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (precisionRef.current && !precisionRef.current.contains(event.target)) {
        setIsPrecisionOpen(false);
      }
      if (defaultViewRef.current && !defaultViewRef.current.contains(event.target)) {
        setIsDefaultViewOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectLanguage = (langCode) => {
    handleLanguageChange(langCode);
    setIsDropdownOpen(false);
  };

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

  // Privacy States
  const [encryptionEnabled, setEncryptionEnabled] = useState(() => localStorage.getItem('settings_privacy_encryption') === 'true');
  const [activityLogging, setActivityLogging] = useState(() => localStorage.getItem('settings_privacy_logging') !== 'false');
  const [storageAccess, setStorageAccess] = useState(() => localStorage.getItem('settings_privacy_storage_access') || 'only_me');

  const [appPermissions, setAppPermissions] = useState(() => {
    const saved = localStorage.getItem('settings_privacy_app_permissions');
    return saved ? JSON.parse(saved) : { 'BNX Mail': true, 'Cliks': true, 'Cliks Business': true };
  });

  const [retentionPolicyDays, setRetentionPolicyDays] = useState(() => {
    return localStorage.getItem('settings_privacy_retention_days') || '30';
  });

  const [activePrivacyModal, setActivePrivacyModal] = useState(null); // 'app_manage' | 'retention' | 'export' | 'activity' | null
  const [selectedAppForManage, setSelectedAppForManage] = useState(null);
  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const [activitySearchQuery, setActivitySearchQuery] = useState('');
  const [activityLogs, setActivityLogs] = useState([
    { id: 1, app: 'BNX Mail', action: 'Read File Attachment', time: '10 mins ago', ip: '192.168.1.45', status: 'Success' },
    { id: 2, app: 'Cliks', action: 'Uploaded Document', time: '1 hour ago', ip: '192.168.1.45', status: 'Success' },
    { id: 3, app: 'Cliks Business', action: 'Synced Financial Sheet', time: '3 hours ago', ip: '192.168.1.12', status: 'Success' },
    { id: 4, app: 'Storage Core', action: 'Access Permission Verified', time: 'Yesterday', ip: '127.0.0.1', status: 'Success' },
    { id: 5, app: 'BNX Mail', action: 'Exported Email Archive', time: '2 days ago', ip: '192.168.1.45', status: 'Success' },
  ]);

  const calculatePrivacyScore = () => {
    let score = 98;
    if (storageAccess === 'connected_apps') score -= 8;
    if (storageAccess === 'shared_users') score -= 16;
    
    const activeAppCount = Object.values(appPermissions).filter(Boolean).length;
    score -= (3 - activeAppCount) * 2;
    return Math.max(60, Math.min(98, score));
  };

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

      localStorage.setItem('settings_show_app_status', defaultStates.showAppStatus.toString());
      localStorage.setItem('settings_show_recent_activity', defaultStates.showRecentActivity.toString());
      localStorage.setItem('settings_show_storage_alerts', defaultStates.showStorageAlerts.toString());

      if (onSaveSettings) {
        onSaveSettings({
          decimalPrecision: defaultStates.decimalPrecision,
          showUsagePercent: defaultStates.showUsagePercent,
          showAppStatus: defaultStates.showAppStatus,
          showRecentActivity: defaultStates.showRecentActivity,
          showStorageAlerts: defaultStates.showStorageAlerts
        });
      }

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

      if (onSaveSettings) {
        onSaveSettings({
          decimalPrecision,
          showUsagePercent,
          showAppStatus,
          showRecentActivity,
          showStorageAlerts
        });
      }

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
      localStorage.setItem('settings_privacy_storage_access', storageAccess);
      localStorage.setItem('settings_privacy_app_permissions', JSON.stringify(appPermissions));
      localStorage.setItem('settings_privacy_retention_days', retentionPolicyDays);
      setIsSaving(false);
      setStatusMessage(t('settings.successMessage'));
      setStatusColor('#10b981');
    }, 800);
  };

  const handleStorageAccessChange = (optionId) => {
    setStorageAccess(optionId);
    localStorage.setItem('settings_privacy_storage_access', optionId);
    setStatusMessage(`Storage access set to: ${optionId === 'only_me' ? 'Only me' : optionId === 'connected_apps' ? 'Connected applications' : 'Shared users'}`);
    setStatusColor('#10b981');
  };

  const handleManageAppAccess = (appName) => {
    setSelectedAppForManage(appName);
    setActivePrivacyModal('app_manage');
  };

  const handleToggleAppPermission = (appName) => {
    const updated = { ...appPermissions, [appName]: !appPermissions[appName] };
    setAppPermissions(updated);
    localStorage.setItem('settings_privacy_app_permissions', JSON.stringify(updated));
    setStatusMessage(`${appName} storage access ${updated[appName] ? 'allowed' : 'revoked'}`);
    setStatusColor(updated[appName] ? '#10b981' : '#ef4444');
  };

  const handleDataControlAction = (action) => {
    if (action === 'retention') {
      setActivePrivacyModal('retention');
    } else if (action === 'export') {
      setActivePrivacyModal('export');
    } else if (action === 'activity') {
      setActivePrivacyModal('activity');
    }
  };

  const handleSaveRetentionPolicy = (days) => {
    setRetentionPolicyDays(days);
    localStorage.setItem('settings_privacy_retention_days', days);
    setStatusMessage(`Data retention policy updated to ${days === 'never' ? 'Keep Indefinitely' : days + ' Days'}`);
    setStatusColor('#10b981');
    setActivePrivacyModal(null);
  };

  const handleTriggerDataExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      const dataToExport = {
        account: 'Beta Storage Workspace',
        exportDate: new Date().toISOString(),
        storageUsageMB: totalPoolMB,
        privacySettings: {
          storageAccess,
          retentionPolicyDays,
          appPermissions,
        },
        apps: apps.map(a => ({ id: a.id, name: a.name, fileCount: a.files.length, sizeMB: a.files.reduce((sum, f) => sum + f.size, 0) }))
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `beta_storage_export_${Date.now()}.${exportFormat}`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setIsExporting(false);
      setStatusMessage('Data export archive downloaded successfully!');
      setStatusColor('#10b981');
      setActivePrivacyModal(null);
    }, 800);
  };

  const handleClearActivityLogs = () => {
    if (window.confirm('Are you sure you want to clear all storage access logs?')) {
      setActivityLogs([]);
      setStatusMessage('Activity history logs cleared');
      setStatusColor('#3b82f6');
    }
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
        <div style={{ padding: '2rem 3rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: 'rgba(255, 255, 255, 0.2)', overflowY: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
          
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
              <div className="glass-card" style={{ padding: 0, overflow: 'visible', border: '1px solid var(--border-color)' }}>
                <h3 style={{ ...sectionHeaderStyle, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>{t('settings.general.regionalTitle')}</h3>
                {/* Language Row */}
                <div style={lastRowItemStyle}>
                  <span>{t('settings.general.languageLabel')}</span>
                  <div className="lang-dropdown-container" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(prev => !prev)}
                      className="lang-dropdown-trigger"
                    >
                      <span>
                        {selectedLanguage === 'en' ? 'English' : selectedLanguage === 'de' ? 'German' : 'Spanish'}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`lang-dropdown-chevron ${isDropdownOpen ? 'open' : ''}`}
                      />
                    </button>

                    {isDropdownOpen && (
                      <div className="lang-dropdown-menu">
                        {languagesList.map((lang) => {
                          const isSelected = selectedLanguage === lang.code;
                          return (
                            <button
                              key={lang.code}
                              type="button"
                              onClick={() => handleSelectLanguage(lang.code)}
                              className={`lang-dropdown-item ${isSelected ? 'selected' : ''}`}
                            >
                              {isSelected ? (
                                <span className="lang-dropdown-checkmark">
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              ) : (
                                <span className="lang-dropdown-checkmark-placeholder" />
                              )}
                              <span>{lang.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CARD 2: STORAGE DISPLAY */}
              <div className="glass-card" style={{ padding: 0, overflow: 'visible', border: '1px solid var(--border-color)' }}>
                <h3 style={{ ...sectionHeaderStyle, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>{t('settings.general.storageDisplayTitle')}</h3>

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
                  <div className="lang-dropdown-container" ref={precisionRef}>
                    <button
                      type="button"
                      onClick={() => setIsPrecisionOpen(prev => !prev)}
                      className="lang-dropdown-trigger"
                    >
                      <span>{decimalPrecision}</span>
                      <ChevronDown
                        size={14}
                        className={`lang-dropdown-chevron ${isPrecisionOpen ? 'open' : ''}`}
                      />
                    </button>

                    {isPrecisionOpen && (
                      <div className="lang-dropdown-menu">
                        {precisionList.map((item) => {
                          const isSelected = decimalPrecision === item.code;
                          return (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setDecimalPrecision(item.code);
                                setIsPrecisionOpen(false);
                              }}
                              className={`lang-dropdown-item ${isSelected ? 'selected' : ''}`}
                            >
                              {isSelected ? (
                                <span className="lang-dropdown-checkmark">
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              ) : (
                                <span className="lang-dropdown-checkmark-placeholder" />
                              )}
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
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
              <div className="glass-card" style={{ padding: 0, overflow: 'visible', border: '1px solid var(--border-color)' }}>
                <h3 style={{ ...sectionHeaderStyle, borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>{t('settings.general.dashboardTitle')}</h3>

                {/* Default View Row */}
                <div style={rowItemStyle}>
                  <span>{t('settings.general.defaultViewLabel')}</span>
                  <div className="lang-dropdown-container" ref={defaultViewRef}>
                    <button
                      type="button"
                      onClick={() => setIsDefaultViewOpen(prev => !prev)}
                      className="lang-dropdown-trigger"
                    >
                      <span>{defaultView}</span>
                      <ChevronDown
                        size={14}
                        className={`lang-dropdown-chevron ${isDefaultViewOpen ? 'open' : ''}`}
                      />
                    </button>

                    {isDefaultViewOpen && (
                      <div className="lang-dropdown-menu">
                        {defaultViewList.map((item) => {
                          const isSelected = defaultView === item.code;
                          return (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => {
                                setDefaultView(item.code);
                                setIsDefaultViewOpen(false);
                              }}
                              className={`lang-dropdown-item ${isSelected ? 'selected' : ''}`}
                            >
                              {isSelected ? (
                                <span className="lang-dropdown-checkmark">
                                  <Check size={14} strokeWidth={3} />
                                </span>
                              ) : (
                                <span className="lang-dropdown-checkmark-placeholder" />
                              )}
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
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
                <div style={lastRowItemStyle}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.45rem', fontWeight: '850', color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                    {t('settings.privacy.title')}
                  </h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem', margin: 0 }}>
                    {t('settings.privacy.subtitle')}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 700, color: statusColor }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusColor, display: 'inline-block' }} />
                    <span>{statusMessage}</span>
                  </div>
                </div>
                
                {/* Protected Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#059669',
                  padding: '0.45rem 1rem',
                  borderRadius: '30px',
                  fontSize: '0.8rem',
                  fontWeight: 750,
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                }}>
                  <div className="privacy-pulse-dot" />
                  <Shield size={15} style={{ color: '#10b981' }} />
                  <span>{t('settings.privacy.protected')}</span>
                </div>
              </div>

              {/* 1. PRIVACY OVERVIEW */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.privacy.privacyOverview')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.25rem' }}>
                  {/* Left score card */}
                  <div className="privacy-card" style={{ 
                    padding: '1.5rem 1.25rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      width: '56px', 
                      height: '56px', 
                      borderRadius: '50%', 
                      background: calculatePrivacyScore() >= 90 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))' 
                        : 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.05))', 
                      border: calculatePrivacyScore() >= 90 ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: calculatePrivacyScore() >= 90 ? '#10b981' : '#f59e0b',
                      marginBottom: '0.6rem',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                    }}>
                      <Shield size={28} />
                    </div>
                    <div style={{ 
                      fontSize: '2rem',
                      fontWeight: '900',
                      color: 'var(--text-main)',
                      letterSpacing: '-0.02em',
                      lineHeight: 1
                    }}>
                      {calculatePrivacyScore()}%
                    </div>
                    <span style={{ 
                      fontSize: '0.78rem', 
                      fontWeight: '750', 
                      color: calculatePrivacyScore() >= 90 ? '#10b981' : '#f59e0b', 
                      marginTop: '0.35rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Check size={13} strokeWidth={3} />
                      {t('settings.privacy.privacyProtected')}
                    </span>
                  </div>

                  {/* Right detail card */}
                  <div className="privacy-card" style={{ 
                    padding: '1.4rem 1.6rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justify: 'space-between'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Lock size={16} style={{ color: '#2563eb' }} />
                        <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>
                          {t('settings.privacy.storagePrivacy')}
                        </h4>
                      </div>
                      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                        {storageAccess === 'only_me' 
                          ? t('settings.privacy.storagePrivacyDesc') 
                          : storageAccess === 'connected_apps' 
                          ? 'Storage is accessible by allowed connected applications.' 
                          : 'Storage access is open to shared organization members.'}
                      </p>
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      color: 'var(--text-dim)', 
                      fontWeight: 600, 
                      marginTop: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      paddingTop: '0.75rem',
                      borderTop: '1px dashed var(--border-color)'
                    }}>
                      <Clock size={13} />
                      <span>{t('settings.privacy.lastChecked')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. STORAGE ACCESS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.privacy.storageAccess')}</h3>
                <div className="privacy-card" style={{ padding: '1.4rem 1.6rem' }}>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: '800', color: 'var(--text-main)', margin: '0 0 1rem 0' }}>
                    {t('settings.privacy.whoCanAccess')}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[
                      { id: 'only_me', label: t('settings.privacy.onlyMe'), icon: Lock, badge: 'Recommended' },
                      { id: 'connected_apps', label: t('settings.privacy.connectedApps'), icon: Layers },
                      { id: 'shared_users', label: t('settings.privacy.sharedUsers'), icon: Users },
                    ].map(option => {
                      const OptionIcon = option.icon;
                      const isSelected = storageAccess === option.id;
                      return (
                        <div 
                          key={option.id}
                          onClick={() => handleStorageAccessChange(option.id)}
                          className={`privacy-option-card ${isSelected ? 'selected' : ''}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(148, 163, 184, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? '#2563eb' : 'var(--text-muted)'
                            }}>
                              <OptionIcon size={16} />
                            </div>
                            <span style={{ fontWeight: isSelected ? 750 : 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                              {option.label}
                            </span>
                            {option.badge && (
                              <span style={{ 
                                fontSize: '0.68rem', 
                                fontWeight: 700, 
                                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                                color: '#2563eb', 
                                padding: '0.15rem 0.5rem', 
                                borderRadius: '12px' 
                              }}>
                                {option.badge}
                              </span>
                            )}
                          </div>
                          
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid #2563eb' : '2px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            boxSizing: 'border-box',
                            transition: 'all 0.15s ease'
                          }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. APPLICATION ACCESS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.privacy.applicationAccess')}</h3>
                <div className="privacy-card" style={{ padding: 0, overflow: 'hidden' }}>
                  {[
                    { name: 'BNX Mail', desc: 'Emails & attachments', icon: Mail, type: 'mail' },
                    { name: 'Cliks', desc: 'Files & documents', icon: FileText, type: 'cliks' },
                    { name: 'Cliks Business', desc: 'Business files', icon: Briefcase, type: 'business' },
                  ].map((app, index, array) => {
                    const AppIcon = app.icon;
                    const isLast = index === array.length - 1;
                    const isAppAllowed = appPermissions[app.name] !== false;
                    return (
                      <div 
                        key={app.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '1rem 1.4rem',
                          borderBottom: isLast ? 'none' : '1px solid var(--border-light)',
                          transition: 'background-color 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '10px', 
                            backgroundColor: app.type === 'mail' ? 'rgba(37, 99, 235, 0.1)' : app.type === 'cliks' ? 'rgba(14, 165, 233, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: app.type === 'mail' ? '#2563eb' : app.type === 'cliks' ? '#0ea5e9' : '#8b5cf6',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                          }}>
                            <AppIcon size={20} />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 750, color: 'var(--text-main)' }}>{app.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>{app.desc}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.1rem' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                              {t('settings.privacy.storageAccessStatus')}
                            </span>
                            <span style={{ 
                              fontSize: '0.75rem', 
                              fontWeight: 750, 
                              color: isAppAllowed ? '#10b981' : '#ef4444', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '0.35rem',
                              backgroundColor: isAppAllowed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              padding: '0.15rem 0.55rem',
                              borderRadius: '12px',
                              border: isAppAllowed ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)'
                            }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isAppAllowed ? '#10b981' : '#ef4444', display: 'inline-block' }} />
                              {isAppAllowed ? t('settings.privacy.allowed') : 'Revoked'}
                            </span>
                          </div>

                          <button 
                            onClick={() => handleManageAppAccess(app.name)}
                            className="privacy-action-btn"
                          >
                            <span>{t('settings.privacy.manage')}</span>
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. DATA CONTROLS */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <h3 style={sectionHeaderStyle}>{t('settings.privacy.dataControls')}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                  {/* Card 1: Retention */}
                  <div className="privacy-card privacy-card-interactive" style={{ 
                    padding: '1.25rem 1.4rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justify: 'space-between',
                    minHeight: '140px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={16} />
                        </div>
                        <span>{t('settings.privacy.retention')}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {retentionPolicyDays === 'never' ? 'Keeping data indefinitely' : `Retention limit: ${retentionPolicyDays} days`}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDataControlAction('retention')}
                      className="privacy-action-btn"
                      style={{ paddingLeft: 0, marginTop: '0.85rem' }}
                    >
                      <span>{t('settings.privacy.manage')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Card 2: Data Export */}
                  <div className="privacy-card privacy-card-interactive" style={{ 
                    padding: '1.25rem 1.4rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justify: 'space-between',
                    minHeight: '140px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Download size={16} />
                        </div>
                        <span>{t('settings.privacy.dataExport')}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {t('settings.privacy.dataExportDesc')}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDataControlAction('export')}
                      className="privacy-action-btn"
                      style={{ paddingLeft: 0, marginTop: '0.85rem' }}
                    >
                      <span>{t('settings.privacy.export')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Card 3: Activity */}
                  <div className="privacy-card privacy-card-interactive" style={{ 
                    padding: '1.25rem 1.4rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justify: 'space-between',
                    minHeight: '140px'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Clock size={16} />
                        </div>
                        <span>{t('settings.privacy.activity')}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                        {activityLogs.length} audit log entries
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDataControlAction('activity')}
                      className="privacy-action-btn"
                      style={{ paddingLeft: 0, marginTop: '0.85rem' }}
                    >
                      <span>{t('settings.privacy.view')}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Save changes footer button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '0.7rem 1.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '10px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)' }}
                >
                  {isSaving ? <RefreshCw size={15} className="spin" /> : <Save size={15} />}
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

      {/* PRIVACY MODALS OVERLAY */}
      {activePrivacyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: activePrivacyModal === 'activity' ? '680px' : '500px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.25)',
            padding: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            maxHeight: '85vh',
            overflowY: 'auto'
          }}>
            {/* MODAL 1: APP ACCESS MANAGE */}
            {activePrivacyModal === 'app_manage' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Manage {selectedAppForManage} Storage Access
                  </h3>
                  <button onClick={() => setActivePrivacyModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.04)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.15)' }}>
                  <ShieldCheck size={28} style={{ color: '#2563eb' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 750, fontSize: '0.95rem', color: 'var(--text-main)' }}>{selectedAppForManage}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Current Permission: <strong style={{ color: appPermissions[selectedAppForManage] !== false ? '#10b981' : '#ef4444' }}>{appPermissions[selectedAppForManage] !== false ? 'Allowed' : 'Revoked'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>Allow Storage Partition Access</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>Permits this application to access files within its storage quota.</div>
                  </div>
                  <button 
                    onClick={() => handleToggleAppPermission(selectedAppForManage)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      backgroundColor: appPermissions[selectedAppForManage] !== false ? '#ef4444' : '#10b981',
                      color: '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {appPermissions[selectedAppForManage] !== false ? 'Revoke Access' : 'Grant Access'}
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setActivePrivacyModal(null)} className="btn-primary" style={{ width: 'auto', padding: '0.55rem 1.25rem' }}>
                    Done
                  </button>
                </div>
              </>
            )}

            {/* MODAL 2: RETENTION POLICY */}
            {activePrivacyModal === 'retention' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Data Retention Policy
                  </h3>
                  <button onClick={() => setActivePrivacyModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Select how many days deleted data and temp files remain in the Recycle Bin before permanent deletion.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { days: '30', label: '30 Days', badge: 'Recommended Default' },
                    { days: '60', label: '60 Days' },
                    { days: '90', label: '90 Days' },
                    { days: '180', label: '180 Days' },
                    { days: 'never', label: 'Keep Indefinitely (Manual Purge Only)' }
                  ].map(opt => (
                    <div
                      key={opt.days}
                      onClick={() => handleSaveRetentionPolicy(opt.days)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: retentionPolicyDays === opt.days ? '1.5px solid #2563eb' : '1px solid var(--border-color)',
                        backgroundColor: retentionPolicyDays === opt.days ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: retentionPolicyDays === opt.days ? 750 : 600, fontSize: '0.88rem' }}>
                        <span>{opt.label}</span>
                        {opt.badge && <span style={{ fontSize: '0.68rem', fontWeight: 700, backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>{opt.badge}</span>}
                      </div>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: retentionPolicyDays === opt.days ? '5px solid #2563eb' : '2px solid #cbd5e1',
                        backgroundColor: '#ffffff'
                      }} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* MODAL 3: DATA EXPORT */}
            {activePrivacyModal === 'export' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                    Export Storage Data
                  </h3>
                  <button onClick={() => setActivePrivacyModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                  Download a structured export file containing all application storage metrics, partition limits, and file inventories.
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setExportFormat('json')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '10px',
                      border: exportFormat === 'json' ? '2px solid #2563eb' : '1px solid var(--border-color)',
                      backgroundColor: exportFormat === 'json' ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 750, fontSize: '0.9rem', color: exportFormat === 'json' ? '#2563eb' : 'var(--text-main)' }}>JSON Archive</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Full raw metadata dump</div>
                  </button>

                  <button 
                    onClick={() => setExportFormat('csv')}
                    style={{
                      flex: 1,
                      padding: '1rem',
                      borderRadius: '10px',
                      border: exportFormat === 'csv' ? '2px solid #2563eb' : '1px solid var(--border-color)',
                      backgroundColor: exportFormat === 'csv' ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ fontWeight: 750, fontSize: '0.9rem', color: exportFormat === 'csv' ? '#2563eb' : 'var(--text-main)' }}>CSV Spreadsheet</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Tabular storage inventory</div>
                  </button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button onClick={() => setActivePrivacyModal(null)} className="btn-danger-outline" style={{ padding: '0.55rem 1.25rem' }}>
                    Cancel
                  </button>
                  <button 
                    onClick={handleTriggerDataExport}
                    disabled={isExporting}
                    className="btn-primary" 
                    style={{ padding: '0.55rem 1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  >
                    {isExporting ? <RefreshCw size={15} className="spin" /> : <Download size={15} />}
                    <span>{isExporting ? 'Generating...' : 'Download Export'}</span>
                  </button>
                </div>
              </>
            )}

            {/* MODAL 4: ACCESS ACTIVITY HISTORY */}
            {activePrivacyModal === 'activity' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                      Storage Access History
                    </h3>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                      Real-time audit log of storage access requests and permissions
                    </p>
                  </div>
                  <button onClick={() => setActivePrivacyModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Search bar */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                    <input 
                      type="text"
                      placeholder="Filter logs by app, action, or IP..."
                      value={activitySearchQuery}
                      onChange={(e) => setActivitySearchQuery(e.target.value)}
                      className="form-control"
                      style={{ paddingLeft: '32px', fontSize: '0.82rem', height: '36px' }}
                    />
                  </div>
                  {activityLogs.length > 0 && (
                    <button onClick={handleClearActivityLogs} className="btn-danger-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                      Clear Logs
                    </button>
                  )}
                </div>

                {/* Logs list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                  {activityLogs.filter(log => log.app.toLowerCase().includes(activitySearchQuery.toLowerCase()) || log.action.toLowerCase().includes(activitySearchQuery.toLowerCase()) || log.ip.includes(activitySearchQuery)).length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No matching access log events.
                    </div>
                  ) : (
                    activityLogs.filter(log => log.app.toLowerCase().includes(activitySearchQuery.toLowerCase()) || log.action.toLowerCase().includes(activitySearchQuery.toLowerCase()) || log.ip.includes(activitySearchQuery)).map(log => (
                      <div 
                        key={log.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(241, 245, 249, 0.4)',
                          border: '1px solid var(--border-light)',
                          fontSize: '0.82rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Clock size={16} style={{ color: '#2563eb' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{log.app} - {log.action}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>IP: {log.ip} • {log.time}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '10px' }}>
                          {log.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setActivePrivacyModal(null)} className="btn-primary" style={{ width: 'auto', padding: '0.55rem 1.4rem' }}>
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
