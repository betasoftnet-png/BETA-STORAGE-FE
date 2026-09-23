import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Cloud, Home, Mail, Layers, Briefcase, BarChart3, Folder, LayoutGrid,
  Search, Trash2, Settings, Server, RefreshCw, Check, Menu, LogOut, AlertCircle
} from 'lucide-react';
import Header from './components/Header';
import StorageOverview from './components/StorageOverview';
import AppCard from './components/AppCard';
import StorageInsights from './components/StorageInsights';
import ActivityFeed from './components/ActivityFeed';
import AppStorageDetails from './components/AppStorageDetails';
import AppDrawer from './components/AppDrawer';
import StorageUsageView from './components/StorageUsageView';
import FileCategoriesView from './components/FileCategoriesView';
import RecycleBinView from './components/RecycleBinView';
import SettingsView from './components/SettingsView';
import Login from './components/Login';
import AccountManagementView from './components/AccountManagementView';
import ManageAppsView from './components/ManageAppsView';
import { getStorageQuota } from './services/storageService';
import { refreshAccessToken } from './services/authService';
import { formatBytes } from './utils/storage';

// Load or return real-time storage state
const getInitialState = () => {
  // Purge legacy dummy state from older versions
  localStorage.removeItem('beta_storage_state_v5');

  const localData = localStorage.getItem('beta_storage_state_v6');
  if (localData) {
    try {
      const parsed = JSON.parse(localData);
      if (parsed && Array.isArray(parsed.apps)) {
        // Ensure no BNX Mail backend storage quota is restored from localStorage
        parsed.apps = parsed.apps.map(app => {
          if (app.id === 'bnx-mail') {
            const { usedBytes, allocatedBytes, storagePercentage, usedMB, ...rest } = app;
            return rest;
          }
          return app;
        });
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse state, using defaults.', e);
    }
  }

  return {
    totalPoolMB: 5120, // 5.0 GB
    apps: [
      {
        id: 'bnx-mail',
        name: 'BNX Mail',
        category: 'Mail & Communication',
        allocatedMB: 1024,
        colorTheme: '37, 99, 235', // Blue rgb
        files: []
      },
      {
        id: 'cliks',
        name: 'Cliks',
        category: 'Workplace Collaboration',
        allocatedMB: 1024,
        colorTheme: '13, 148, 136', // Teal rgb
        files: []
      },
      {
        id: 'cliks-business',
        name: 'Cliks Business',
        category: 'Business Management',
        allocatedMB: 1024,
        colorTheme: '139, 92, 246', // Purple rgb
        files: []
      }
    ],
    activities: [],
    notifications: [],
    lastUpdatedTime: 'Just now',
    deletedFiles: []
  };
};

function AppContent() {
  const [state, setState] = useState(getInitialState);
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('currentUserEmail') || '');
  const [signedInAccounts, setSignedInAccounts] = useState(() => {
    try {
      const stored = localStorage.getItem('signedInAccounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const current = localStorage.getItem('currentUserEmail');
      if (current && !accounts.includes(current)) {
        accounts.push(current);
        localStorage.setItem('signedInAccounts', JSON.stringify(accounts));
      }
      return accounts;
    } catch (e) {
      return [];
    }
  });
  const [isAddingAccount, setIsAddingAccount] = useState(false);

  // Route guarding and redirection checking
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && location.pathname === '/login' && !isAddingAccount) {
      navigate('/');
    } else if (isAuthenticated && location.pathname === '/dashboard') {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate, isAddingAccount]);

  // Reset isAddingAccount if navigating away from /login
  useEffect(() => {
    if (location.pathname !== '/login') {
      setIsAddingAccount(false);
    }
  }, [location.pathname]);

  const handleLoginSuccess = (email, accessToken, refreshToken) => {
    // 1. Immediately wipe any previous user storage state to ensure strict isolation
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => {
        if (app.id === 'bnx-mail') {
          const { usedBytes, allocatedBytes, storagePercentage, usedMB, ...rest } = app;
          return { ...rest, files: [] };
        }
        return app;
      }),
      activities: [],
      deletedFiles: []
    }));

    // 2. Set the newly authenticated user's access & refresh tokens in-memory
    if (accessToken) {
      setBnxToken(accessToken);
    }
    if (refreshToken) {
      setBnxRefreshToken(refreshToken);
    }

    setCurrentUserEmail(email);
    setIsAuthenticated(true);
    
    // Add account to list of signed-in accounts
    setSignedInAccounts(prev => {
      const updated = prev.includes(email) ? prev : [...prev, email];
      localStorage.setItem('signedInAccounts', JSON.stringify(updated));
      return updated;
    });

    setIsAddingAccount(false);
    navigate('/');
  };

  const handleSwitchAccount = (email) => {
    // Clear storage info on account switch until new token is loaded
    setBnxToken('');
    setBnxRefreshToken('');
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => {
        if (app.id === 'bnx-mail') {
          const { usedBytes, allocatedBytes, storagePercentage, usedMB, ...rest } = app;
          return { ...rest, files: [] };
        }
        return app;
      })
    }));
    setCurrentUserEmail(email);
    localStorage.setItem('currentUserEmail', email);
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const handleAddAccount = () => {
    setIsAddingAccount(true);
    navigate('/login');
  };

  const handleSignOutThis = () => {
    // Clear in-memory tokens and storage state
    setBnxToken('');
    setBnxRefreshToken('');
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => {
        if (app.id === 'bnx-mail') {
          const { usedBytes, allocatedBytes, storagePercentage, usedMB, ...rest } = app;
          return { ...rest, files: [] };
        }
        return app;
      }),
      activities: [],
      deletedFiles: []
    }));

    setSignedInAccounts(prev => {
      const updated = prev.filter(acc => acc !== currentUserEmail);
      localStorage.setItem('signedInAccounts', JSON.stringify(updated));
      
      if (updated.length > 0) {
        const nextEmail = updated[0];
        setCurrentUserEmail(nextEmail);
        localStorage.setItem('currentUserEmail', nextEmail);
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
      } else {
        setCurrentUserEmail('');
        setIsAuthenticated(false);
        localStorage.removeItem('currentUserEmail');
        localStorage.removeItem('isAuthenticated');
        navigate('/login');
      }
      
      return updated;
    });
  };

  const handleSignOutAll = () => {
    // Wipe all in-memory tokens and storage data
    setBnxToken('');
    setBnxRefreshToken('');
    setState(prev => ({
      ...prev,
      apps: prev.apps.map(app => {
        if (app.id === 'bnx-mail') {
          const { usedBytes, allocatedBytes, storagePercentage, usedMB, ...rest } = app;
          return { ...rest, files: [] };
        }
        return app;
      }),
      activities: [],
      deletedFiles: []
    }));
    setSignedInAccounts([]);
    setCurrentUserEmail('');
    setIsAuthenticated(false);
    localStorage.removeItem('signedInAccounts');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const handleLogout = handleSignOutAll;

  // Extract selectedAppId from URL pathname: e.g. /storage/bnx-mail -> bnx-mail
  const match = location.pathname.match(/^\/storage\/([^/]+)$/);
  const selectedAppId = match ? match[1] : null;

  const { t } = useTranslation();
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [decimalPrecision, setDecimalPrecision] = useState(() => {
    const precisionStr = localStorage.getItem('settings_decimal_precision') || '2 digits';
    if (precisionStr === '0 digits') return 0;
    if (precisionStr === '1 digit') return 1;
    if (precisionStr === '2 digits') return 2;
    if (precisionStr === '3 digits') return 3;
    return 2;
  });

  const [showUsagePercent, setShowUsagePercent] = useState(() => {
    return localStorage.getItem('settings_show_usage_percent') !== 'false';
  });

  const [showAppStatus, setShowAppStatus] = useState(() => {
    return localStorage.getItem('settings_show_app_status') !== 'false';
  });

  const [showRecentActivity, setShowRecentActivity] = useState(() => {
    return localStorage.getItem('settings_show_recent_activity') !== 'false';
  });

  const [showStorageAlerts, setShowStorageAlerts] = useState(() => {
    return localStorage.getItem('settings_show_storage_alerts') !== 'false';
  });

  const handleSettingsSave = (settings) => {
    if (settings) {
      if (settings.decimalPrecision) {
        const precisionStr = settings.decimalPrecision;
        let p = 2;
        if (precisionStr === '0 digits') p = 0;
        else if (precisionStr === '1 digit') p = 1;
        else if (precisionStr === '2 digits') p = 2;
        else if (precisionStr === '3 digits') p = 3;
        setDecimalPrecision(p);
      }
      if (settings.showUsagePercent !== undefined) {
        setShowUsagePercent(settings.showUsagePercent);
      }
      if (settings.showAppStatus !== undefined) {
        setShowAppStatus(settings.showAppStatus);
      }
      if (settings.showRecentActivity !== undefined) {
        setShowRecentActivity(settings.showRecentActivity);
      }
      if (settings.showStorageAlerts !== undefined) {
        setShowStorageAlerts(settings.showStorageAlerts);
      }
    }
  };

  // Sync UI state to local storage (strictly exclude BNX Mail storage values to keep backend as source of truth)
  useEffect(() => {
    const sanitizedState = {
      ...state,
      apps: state.apps.map(app => {
        if (app.id === 'bnx-mail') {
          const { usedBytes, allocatedBytes, storagePercentage, usedMB, ...rest } = app;
          return rest;
        }
        return app;
      })
    };
    localStorage.setItem('beta_storage_state_v6', JSON.stringify(sanitizedState));
  }, [state]);

  // Initialize theme from localStorage on load
  useEffect(() => {
    const savedTheme = localStorage.getItem('settings_theme') || 'System';
    if (savedTheme === 'Dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'Light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle default view routing on root path
  useEffect(() => {
    if (location.pathname === '/') {
      const defaultViewSetting = localStorage.getItem('settings_default_view') || 'Storage Overview';
      if (defaultViewSetting === 'Recycle Bin') {
        navigate('/recycle-bin', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  // In-memory secure BNX Mail tokens (never stored in localStorage/sessionStorage)
  const [bnxToken, setBnxToken] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token') || params.get('access_token') || params.get('bnx_token');
      if (urlToken) {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
        return urlToken;
      }
    } catch (_) {}
    const savedEmail = localStorage.getItem('currentUserEmail');
    if (savedEmail) {
      return `bnx_token_${btoa(savedEmail.trim())}`;
    }
    return '';
  });
  const [bnxRefreshToken, setBnxRefreshToken] = useState('');

  // Listen to secure postMessage token transfers from BNX Mail / ecosystem shell
  useEffect(() => {
    const handleTokenMessage = (event) => {
      if (event.data && typeof event.data === 'object' && event.data.type === 'BNX_AUTH_TOKEN' && event.data.token) {
        setBnxToken(event.data.token);
        if (event.data.refreshToken) {
          setBnxRefreshToken(event.data.refreshToken);
        }
      }
    };
    window.addEventListener('message', handleTokenMessage);
    return () => window.removeEventListener('message', handleTokenMessage);
  }, []);

  // BNX Mail API Quota State
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);
  const [quotaError, setQuotaError] = useState(null);

  const fetchQuota = async (tokenToUse = bnxToken) => {
    const activeToken = tokenToUse || bnxToken || (currentUserEmail ? `bnx_token_${btoa(currentUserEmail.trim())}` : '');
    if (!activeToken) {
      setQuotaError('BNX Mail access token is required to fetch storage quota');
      return;
    }
    setIsLoadingQuota(true);
    setQuotaError(null);
    try {
      let data;
      try {
        data = await getStorageQuota(activeToken);
      } catch (err) {
        // If 401 or token expired error occurs, attempt token refresh using in-memory refresh token
        const isAuthError = err.message && (err.message.includes('401') || err.message.includes('expired') || err.message.includes('unauthorized') || err.message.includes('Unauthorized'));
        if (isAuthError && bnxRefreshToken) {
          try {
            const refreshed = await refreshAccessToken(bnxRefreshToken);
            if (refreshed && refreshed.accessToken) {
              setBnxToken(refreshed.accessToken);
              if (refreshed.refreshToken) {
                setBnxRefreshToken(refreshed.refreshToken);
              }
              data = await getStorageQuota(refreshed.accessToken);
            }
          } catch (refreshErr) {
            console.warn('Token refresh failed, logging out:', refreshErr.message);
            handleLogout();
            throw new Error('Session expired. Please log in again.');
          }
        } else {
          throw err;
        }
      }

      if (data) {
        if (data.email) {
          setCurrentUserEmail(data.email);
        }
        setState(prev => {
          const updatedApps = prev.apps.map(app => {
            if (app.id === 'bnx-mail') {
              return {
                ...app,
                usedBytes: data.storageUsed,
                allocatedBytes: data.storageLimit,
                storagePercentage: data.storagePercentage,
                allocatedMB: data.storageLimit / (1024 * 1024),
                usedMB: data.storageUsed / (1024 * 1024)
              };
            }
            return app;
          });
          return {
            ...prev,
            apps: updatedApps,
            lastUpdatedTime: 'Just now'
          };
        });
      }
    } catch (err) {
      console.warn('Could not fetch storage quota:', err.message);
      setQuotaError(err.message || 'Failed to fetch storage quota');
    } finally {
      setIsLoadingQuota(false);
    }
  };

  // Fetch storage quota when authenticated and token is available
  useEffect(() => {
    if (isAuthenticated && bnxToken) {
      fetchQuota(bnxToken);
    }
  }, [isAuthenticated, bnxToken]);

  const handleRefreshState = () => {
    setIsRefreshing(true);
    fetchQuota(bnxToken).finally(() => {
      setIsRefreshing(false);
      setState(prev => ({
        ...prev,
        lastUpdatedTime: 'Just now'
      }));
    });
  };

  // derived variables
  const totalUsedStorageMB = state.apps.reduce((acc, app) => {
    if (app.usedBytes !== undefined) {
      return acc + (app.usedBytes / (1024 * 1024));
    }
    return acc + (app.files ? app.files.reduce((sum, f) => sum + f.size, 0) : 0);
  }, 0);

  // System Health
  let systemHealth = 'healthy';
  const hasCritical = state.apps.some(app => {
    const used = app.files.reduce((sum, f) => sum + f.size, 0);
    return app.allocatedMB > 0 && (used / app.allocatedMB) >= 0.9;
  });
  const hasWarning = state.apps.some(app => {
    const used = app.files.reduce((sum, f) => sum + f.size, 0);
    return app.allocatedMB > 0 && (used / app.allocatedMB) >= 0.75 && (used / app.allocatedMB) < 0.9;
  });
  if (hasCritical || (totalUsedStorageMB / state.totalPoolMB) >= 0.85) {
    systemHealth = 'critical';
  } else if (hasWarning || (totalUsedStorageMB / state.totalPoolMB) >= 0.7) {
    systemHealth = 'warning';
  }

  // Callbacks
  const handleUploadFile = (appId, name, size, type) => {
    const timestamp = 'Just now';
    const newFile = {
      id: `file-${Date.now()}`,
      name,
      size,
      type,
      time: timestamp
    };

    setState(prev => {
      const targetApp = prev.apps.find(a => a.id === appId);
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return { ...a, files: [newFile, ...a.files] };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `${type} uploaded: ${name}`,
        diff: `+${Math.round(size)} MB`,
        colorTheme: targetApp.colorTheme,
        time: 'Just now'
      };

      return {
        ...prev,
        apps: updatedApps,
        activities: [newLog, ...prev.activities.slice(0, 9)],
        lastUpdatedTime: 'Just now'
      };
    });
  };

  const handleDeleteFile = (appId, fileId, fileName, fileSize) => {
    setState(prev => {
      const targetApp = prev.apps.find(a => a.id === appId);
      const fileToDelete = targetApp.files.find(f => f.id === fileId);
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return { ...a, files: a.files.filter(f => f.id !== fileId) };
        }
        return a;
      });

      const newDeletedFile = {
        id: fileId,
        name: fileName,
        size: fileSize,
        app: appId,
        appName: targetApp.name,
        type: fileToDelete ? fileToDelete.type : 'Other',
        icon: '📄',
        deletedTime: 'Deleted today',
        daysRemaining: 30,
        color: appId === 'bnx-mail' ? '#2563eb' : appId === 'cliks-business' ? '#8b5cf6' : '#0d9488'
      };

      const newLog = {
        appName: targetApp.name,
        description: `Deleted files: ${fileName}`,
        diff: `-${Math.round(fileSize)} MB`,
        colorTheme: targetApp.colorTheme,
        time: 'Just now'
      };

      return {
        ...prev,
        apps: updatedApps,
        activities: [newLog, ...prev.activities.slice(0, 9)],
        deletedFiles: [newDeletedFile, ...(prev.deletedFiles || [])],
        lastUpdatedTime: 'Just now'
      };
    });
  };

  const handleRestoreFile = (file) => {
    setState(prev => {
      const updatedApps = prev.apps.map(a => {
        if (a.id === file.app) {
          const restoredFile = {
            id: file.id,
            name: file.name,
            size: file.size,
            type: file.type || 'Other',
            time: 'Just now'
          };
          return { ...a, files: [restoredFile, ...a.files] };
        }
        return a;
      });

      const newLog = {
        appName: file.appName,
        description: `Restored files: ${file.name}`,
        diff: `+${Math.round(file.size)} MB`,
        colorTheme: file.app === 'bnx-mail' ? '37, 99, 235' : file.app === 'cliks-business' ? '139, 92, 246' : '13, 148, 136',
        time: 'Just now'
      };

      return {
        ...prev,
        apps: updatedApps,
        deletedFiles: (prev.deletedFiles || []).filter(f => f.id !== file.id),
        activities: [newLog, ...prev.activities.slice(0, 9)],
        lastUpdatedTime: 'Just now'
      };
    });
  };

  const handlePermanentDeleteFile = (file) => {
    setState(prev => {
      const newLog = {
        appName: file.appName,
        description: `Permanently deleted: ${file.name}`,
        diff: `0 MB`,
        colorTheme: '100, 116, 139',
        time: 'Just now'
      };
      return {
        ...prev,
        deletedFiles: (prev.deletedFiles || []).filter(f => f.id !== file.id),
        activities: [newLog, ...prev.activities.slice(0, 9)],
        lastUpdatedTime: 'Just now'
      };
    });
  };

  const handleUpdateAllocation = (appId, valMB) => {
    setState(prev => {
      const targetApp = prev.apps.find(a => a.id === appId);
      const diffGB = ((valMB - targetApp.allocatedMB) / 1024).toFixed(0);
      const direction = valMB > targetApp.allocatedMB ? 'expanded' : 'shrunk';

      const newLog = {
        appName: targetApp.name,
        description: `Limit ${direction} by ${Math.abs(diffGB)} GB`,
        diff: `${valMB > targetApp.allocatedMB ? '+' : '-'}${Math.abs(diffGB) * 1024} MB`,
        colorTheme: targetApp.colorTheme,
        time: 'Just now'
      };

      return {
        ...prev,
        apps: prev.apps.map(a => (a.id === appId ? { ...a, allocatedMB: valMB } : a)),
        activities: [newLog, ...prev.activities.slice(0, 9)]
      };
    });
  };

  const handleResizePool = (poolMB) => {
    setState(prev => {
      const diffGB = ((poolMB - prev.totalPoolMB) / 1024).toFixed(0);

      const newLog = {
        appName: 'SYSTEM',
        description: `Total pool storage expanded`,
        diff: `+${diffGB} GB`,
        colorTheme: '148, 163, 184',
        time: 'Just now'
      };

      return {
        ...prev,
        totalPoolMB: poolMB,
        activities: [newLog, ...prev.activities.slice(0, 9)]
      };
    });
  };

  const handleAddNewApp = (newApp) => {
    setState(prev => {
      const newLog = {
        appName: newApp.name,
        description: `Registered app: ${newApp.name}`,
        diff: `+${(newApp.allocatedMB / 1024).toFixed(0)} GB`,
        colorTheme: newApp.colorTheme,
        time: 'Just now'
      };

      return {
        ...prev,
        apps: [...prev.apps, newApp],
        activities: [newLog, ...prev.activities.slice(0, 9)]
      };
    });
  };

  const handleTriggerCleanup = (appId) => {
    const targetApp = state.apps.find(a => a.id === appId);
    const tempFiles = targetApp.files.filter(f =>
      f.name.toLowerCase().includes('temp') ||
      f.name.toLowerCase().includes('cache') ||
      f.name.endsWith('.tmp')
    );

    if (tempFiles.length === 0) {
      alert(t('appStorageDetails.tips.noTempFiles', 'No temporary files found in {{appName}}.', { appName: targetApp.name }));
      return;
    }

    const totalReleased = tempFiles.reduce((sum, f) => sum + f.size, 0);

    setState(prev => {
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return { ...a, files: a.files.filter(f => !tempFiles.some(tf => tf.id === f.id)) };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `Purged cache files`,
        diff: `-${totalReleased} MB`,
        colorTheme: targetApp.colorTheme,
        time: 'Just now'
      };

      return {
        ...prev,
        apps: updatedApps,
        activities: [newLog, ...prev.activities.slice(0, 9)]
      };
    });
    alert(t('appStorageDetails.tips.cacheCleaned', 'Cleaned {{size}} MB from cache.', { size: totalReleased }));
  };

  const handleCompressLogs = (appId) => {
    const targetApp = state.apps.find(a => a.id === appId);
    const logsFiles = targetApp.files.filter(f => f.type === 'Logs');

    if (logsFiles.length === 0) {
      alert(t('appStorageDetails.tips.noLogsFiles', 'No logs files found in {{appName}}.', { appName: targetApp.name }));
      return;
    }

    let totalReleased = 0;

    setState(prev => {
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            files: a.files.map(f => {
              if (f.type === 'Logs') {
                const newSize = Math.max(1, Math.round(f.size * 0.5));
                totalReleased += (f.size - newSize);
                return { ...f, size: newSize, name: f.name.includes('_compressed') ? f.name : f.name.replace('.log', '_compressed.log') };
              }
              return f;
            })
          };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `Compressed logs`,
        diff: `-${totalReleased} MB`,
        colorTheme: targetApp.colorTheme,
        time: 'Just now'
      };

      return {
        ...prev,
        apps: updatedApps,
        activities: [newLog, ...prev.activities.slice(0, 9)]
      };
    });
    alert(t('appStorageDetails.tips.logsReclaimed', 'Compressed logs. Reclaimed {{size}} MB.', { size: totalReleased }));
  };

  const clearNotifications = () => {
    setState(prev => ({ ...prev, notifications: [] }));
  };

  const activeApp = state.apps.find(a => a.id === selectedAppId);
  const allSameAllocation = state.apps.length > 0 && state.apps.every(app => app.allocatedMB === state.apps[0].allocatedMB);
  const allocationText = allSameAllocation
    ? t('dashboard.allocationEach', { size: (state.apps[0].allocatedMB / 1024).toFixed(0) })
    : t('dashboard.allocationTrack');

  if (location.pathname === '/login' || !isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  if (location.pathname === '/security') {
    return (
      <AccountManagementView
        key={currentUserEmail}
        currentUserEmail={currentUserEmail}
        onBack={() => navigate('/')}
        onLogout={handleLogout}
        totalPoolMB={state.totalPoolMB}
        apps={state.apps}
      />
    );
  }

  return (
    <div className="app-layout-container">
      {/* Global Top Navbar */}
      <div className="navbar-wrapper">
        <Header
          lastUpdated={state.lastUpdatedTime}
          isRefreshing={isRefreshing || isLoadingQuota}
          onRefresh={handleRefreshState}
          currentUserEmail={currentUserEmail}
          signedInAccounts={signedInAccounts}
          onSwitchAccount={handleSwitchAccount}
          onAddAccount={handleAddAccount}
          onSignOutThis={handleSignOutThis}
          onSignOutAll={handleSignOutAll}
          onLogout={handleLogout}
          onManageAccount={() => navigate('/security')}
        />
      </div>

      <div className="dashboard-layout">
      {/* Mobile Top Bar */}
      <div className="mobile-header-bar">
        <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          <Menu size={20} />
        </button>
        <div className="mobile-brand">
          <img src="/logo.png" alt="BETA" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <span>BETA ECOSYSTEM</span>
        </div>
        <div style={{ width: '20px' }} /> {/* alignment balance */}
      </div>

      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Left Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div>
          <div className="brand-section mobile-only">
            <div className="logo-container">
              <img src="/logo.png" alt="BETA Logo" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
            </div>
            <div>
              <h1>BETA</h1>
              <p>STORAGE ECOSYSTEM</p>
            </div>
          </div>

          <nav className="sidebar-navigation">
            <div className="menu-group">
              <span
                className={`menu-item ${selectedAppId === null ? 'active' : ''}`}
                onClick={() => {
                  navigate('/');
                  setIsDrawerOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Home size={16} /> {t('sidebar.home')}
              </span>
            </div>

            <div className="menu-group">
              <span className="menu-label">{t('dashboard.appStorage').toUpperCase()}</span>
              {state.apps.map(app => (
                <span
                  key={app.id}
                  className={`menu-item ${selectedAppId === app.id ? 'active' : ''}`}
                  onClick={() => {
                    navigate(`/storage/${app.id}`);
                    setIsDrawerOpen(false);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {app.id === 'bnx-mail' ? (
                    <img src="/bnx_mail_logo.png" alt="BNX Mail" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  ) : app.id === 'cliks' ? (
                    <img src="/cliks_logo.png" alt="Cliks" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  ) : app.id === 'cliks-business' ? (
                    <img src="/cliks_business_logo.png" alt="Cliks Business" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  ) : (
                    <Briefcase size={16} />
                  )}
                  {app.name}
                </span>
              ))}
            </div>

            <div className="menu-group">
              <span className="menu-label">{t('appStorageDetails.breadcrumbsTitle').toUpperCase()}</span>
              <span
                className={`menu-item ${location.pathname === '/storage-usage' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/storage-usage');
                  setIsDrawerOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <BarChart3 size={16} /> {t('sidebar.storageUsage')}
              </span>
              <span
                className={`menu-item ${location.pathname === '/recycle-bin' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/recycle-bin');
                  setIsDrawerOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Trash2 size={16} /> {t('sidebar.recycleBin')}
              </span>
              <span
                className={`menu-item ${location.pathname === '/manage-apps' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/manage-apps');
                  setIsDrawerOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <LayoutGrid size={16} /> Manage Apps
              </span>
            </div>

            <div className="menu-group">
              <span className="menu-label">{t('sidebar.systemGroup')}</span>
              <span
                className={`menu-item ${location.pathname === '/settings' ? 'active' : ''}`}
                onClick={() => {
                  navigate('/settings');
                  setIsDrawerOpen(false);
                }}
                style={{ cursor: 'pointer' }}
              >
                <Settings size={16} /> {t('sidebar.settings')}
              </span>
            </div>

            <div className="menu-group mobile-only" style={{ marginTop: '1.5rem' }}>
              <span className="menu-label">{t('sidebar.accountGroup')}</span>
              <span 
                className="menu-item" 
                onClick={handleLogout}
                style={{ color: 'var(--color-critical)' }}
              >
                <LogOut size={16} /> {t('sidebar.signOut')} ({currentUserEmail ? currentUserEmail.split('@')[0] : 'User'})
              </span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Scrollable Page Body */}
        <div className="main-content-body">
          {location.pathname === '/storage-usage' ? (
            <StorageUsageView
              totalPoolMB={state.totalPoolMB}
              apps={state.apps}
              decimalPrecision={decimalPrecision}
              showUsagePercent={showUsagePercent}
              onBack={() => {
                navigate('/');
                setIsDrawerOpen(false);
              }}
            />
          ) : location.pathname === '/file-categories' ? (
            <FileCategoriesView
              totalPoolMB={state.totalPoolMB}
              apps={state.apps}
              decimalPrecision={decimalPrecision}
              showUsagePercent={showUsagePercent}
              onBack={() => {
                navigate('/');
                setIsDrawerOpen(false);
              }}
            />
          ) : location.pathname === '/recycle-bin' ? (
            <RecycleBinView
              totalPoolMB={state.totalPoolMB}
              apps={state.apps}
              deletedFiles={state.deletedFiles || []}
              decimalPrecision={decimalPrecision}
              onRestoreFile={handleRestoreFile}
              onPermanentDeleteFile={handlePermanentDeleteFile}
              onBack={() => {
                navigate('/');
                setIsDrawerOpen(false);
              }}
            />
          ) : location.pathname === '/settings' ? (
            <SettingsView
              totalPoolMB={state.totalPoolMB}
              apps={state.apps}
              onResizePool={handleResizePool}
              onUpdateAllocation={handleUpdateAllocation}
              onBack={() => {
                navigate('/');
                setIsDrawerOpen(false);
              }}
              onSaveSettings={handleSettingsSave}
            />
          ) : location.pathname === '/manage-apps' ? (
            <ManageAppsView
              totalPoolMB={state.totalPoolMB}
              apps={state.apps}
              onResizePool={handleResizePool}
              onUpdateAllocation={handleUpdateAllocation}
            />
          ) : selectedAppId && activeApp ? (
            <AppStorageDetails
              app={activeApp}
              decimalPrecision={decimalPrecision}
              showUsagePercent={showUsagePercent}
              showAppStatus={showAppStatus}
              onBack={() => {
                navigate('/');
                setIsDrawerOpen(false);
              }}
              onManage={() => setIsDrawerOpen(true)}
              lastUpdated={state.lastUpdatedTime}
              isRefreshing={isRefreshing || isLoadingQuota}
              onRefresh={handleRefreshState}
            />
          ) : (
            <>
              {/* Storage Alert Banner */}
              {showStorageAlerts && systemHealth !== 'healthy' && (
                <div style={{
                  padding: '1rem 1.5rem',
                  borderRadius: '12px',
                  backgroundColor: systemHealth === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                  border: `1px solid ${systemHealth === 'critical' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                  color: systemHealth === 'critical' ? '#991b1b' : '#92400e',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.88rem',
                  fontWeight: '600'
                }}>
                  <AlertCircle size={20} style={{ color: systemHealth === 'critical' ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: '800', textTransform: 'uppercase', marginRight: '0.5rem' }}>
                      {systemHealth === 'critical' ? t('dashboard.health.criticalTitle') : t('dashboard.health.warningTitle')}
                    </span>
                    <span>
                      {systemHealth === 'critical' ? t('dashboard.health.criticalDesc') : t('dashboard.health.warningDesc')}
                    </span>
                  </div>
                </div>
              )}

              {/* Total Ecosystem Storage wide card banner */}
              <StorageOverview
                totalPoolMB={state.totalPoolMB}
                usedStorageMB={totalUsedStorageMB}
                decimalPrecision={decimalPrecision}
                showUsagePercent={showUsagePercent}
              />

              {/* Application Storage Cards Grid section */}
              <div className="section-header">
                <h3>{t('dashboard.appStorage')}</h3>
                <p>{allocationText}</p>
              </div>

              <div className="apps-grid">
                {state.apps.map(app => (
                  <AppCard
                    key={app.id}
                    app={app}
                    decimalPrecision={decimalPrecision}
                    showUsagePercent={showUsagePercent}
                    showAppStatus={showAppStatus}
                    onManage={() => {
                      navigate(`/storage/${app.id}`);
                      setIsDrawerOpen(false);
                    }}
                  />
                ))}
              </div>

              {/* Insights Row (Storage Distribution, Category Breakdown, Status Security) */}
              <StorageInsights
                totalPoolMB={state.totalPoolMB}
                usedStorageMB={totalUsedStorageMB}
                apps={state.apps}
                decimalPrecision={decimalPrecision}
                showUsagePercent={showUsagePercent}
                showStorageAlerts={showStorageAlerts}
              />

              {/* Recent Activity Table Ledger */}
              {showRecentActivity && (
                <ActivityFeed
                  activities={state.activities}
                  onViewActivity={() => { }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Drawer sandbox panels */}
      {(activeApp && isDrawerOpen) && (
        <AppDrawer
          app={activeApp}
          decimalPrecision={decimalPrecision}
          showUsagePercent={showUsagePercent}
          onClose={() => setIsDrawerOpen(false)}
          onUploadFile={handleUploadFile}
          onDeleteFile={handleDeleteFile}
          onTriggerCleanup={handleTriggerCleanup}
          onCompressLogs={handleCompressLogs}
        />
      )}

      {/* Admin Settings Modal (Disabled) */}
      {/*
      {isAdminOpen && (
        <AdminSettings
          totalPoolMB={state.totalPoolMB}
          apps={state.apps}
          onClose={() => setIsAdminOpen(false)}
          onResizePool={handleResizePool}
          onUpdateAllocation={handleUpdateAllocation}
          onAddNewApp={handleAddNewApp}
        />
      )}
      */}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
