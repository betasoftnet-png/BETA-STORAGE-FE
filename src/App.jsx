import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Cloud, Home, Mail, Layers, Briefcase, BarChart3, Folder,
  Search, Trash2, Settings, Server, RefreshCw, Check, Menu, LogOut
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

// Load or return reference default state
const getInitialState = () => {
  const localData = localStorage.getItem('beta_storage_state_v5');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse state, using defaults.', e);
    }
  }

  // File structure tailored to match Category values exactly:
  // Documents (Database, Document) = 120 + 100 + 400 = 620 MB
  // Images (Images) = 50 + 430 = 480 MB
  // Attachments (Attachment) = 250 + 30 + 80 = 360 MB
  // Videos (Videos) = 220 MB
  // Others (Logs, Others) = 120 MB
  return {
    totalPoolMB: 5120, // 5.0 GB
    apps: [
      {
        id: 'bnx-mail',
        name: 'BNX Mail',
        category: 'Mail & Communication',
        allocatedMB: 1024,
        colorTheme: '37, 99, 235', // Blue rgb
        files: [
          { id: 'bnx-f1', name: 'Inbox_Archive.db', size: 420, type: 'Database', time: '5h ago' },
          { id: 'bnx-f2', name: 'Project_Brief.pdf', size: 350, type: 'Attachment', time: '2h ago' },
          { id: 'bnx-f3', name: 'header_background.jpg', size: 180, type: 'Images', time: '1d ago' },
          { id: 'bnx-f4', name: 'intro_tutorial.mp4', size: 20, type: 'Videos', time: '4h ago' },
          { id: 'bnx-f5', name: 'voicemail_clip.mp3', size: 30, type: 'Audio', time: '3d ago' },
          { id: 'bnx-f6', name: 'sent_invoice_archive.zip', size: 350, type: 'Sent', time: '1h ago' }
        ]
      },
      {
        id: 'cliks',
        name: 'Cliks',
        category: 'Workplace Collaboration',
        allocatedMB: 1024,
        colorTheme: '13, 148, 136', // Teal rgb
        files: [
          { id: 'cl-f1', name: 'notes.txt', size: 140, type: 'Attachment', time: '3d ago' },
          { id: 'cl-f2', name: 'meeting_pdf.pdf', size: 70, type: 'Attachment', time: '2d ago' },
          { id: 'cl-f3', name: 'cliks_logo.png', size: 140, type: 'Images', time: '12m ago' },
          { id: 'cl-f4', name: 'presentation_recording.mp4', size: 50, type: 'Videos', time: '1h ago' },
          { id: 'cl-f5', name: 'meeting_audio.mp3', size: 25, type: 'Audio', time: '5h ago' },
          { id: 'cl-f6', name: 'logs_archive.zip', size: 145, type: 'Logs', time: '4h ago' }
        ]
      },
      {
        id: 'cliks-business',
        name: 'Cliks Business',
        category: 'Business Management',
        allocatedMB: 1024,
        colorTheme: '139, 92, 246', // Purple rgb
        files: [
          { id: 'clb-f1', name: 'Vendor_Invoices_Q3.xlsx', size: 256, type: 'Sales & Purchases', time: '1h ago' },
          { id: 'clb-f2', name: 'FIN_PRO_Audit_Report.pdf', size: 92, type: 'Audit & Tax (FIN-PRO)', time: '10m ago' },
          { id: 'clb-f3', name: 'product_photo_1.jpg', size: 300, type: 'Inventory & Media', time: '1d ago' },
          { id: 'clb-f4', name: 'barcodes_metadata.json', size: 130, type: 'Inventory & Media', time: '2d ago' },
          { id: 'clb-f5', name: 'Receipt_Scans_Archive.zip', size: 143, type: 'Expenses', time: '3h ago' }
        ]
      }
    ],
    activities: [
      { appName: 'BNX Mail', description: 'Attachment uploaded: Project_Proposal.pdf', diff: '+12 MB', colorTheme: '37, 99, 235', time: '2m ago' },
      { appName: 'Cliks', description: 'File uploaded: Design_System.fig', diff: '+8 MB', colorTheme: '13, 148, 136', time: '12m ago' },
      { appName: 'Cliks Business', description: 'Document uploaded: Quarterly_Report.xlsx', diff: '+15 MB', colorTheme: '139, 92, 246', time: '24m ago' },
      { appName: 'BNX Mail', description: 'Deleted files from Trash', diff: '-32 MB', colorTheme: '37, 99, 235', time: '1h ago' }
    ],
    notifications: [],
    lastUpdatedTime: 'Just now',
    deletedFiles: [
      // BNX Mail: 14 deleted items, totaling 82 MB
      { id: 'del-1', name: 'invoice.pdf', size: 4.2, app: 'bnx-mail', appName: 'BNX Mail', type: 'PDF', icon: '📄', deletedTime: 'Deleted today', daysRemaining: 29, color: '#2563eb' },
      { id: 'del-2', name: 'customer_feedback_call.mp3', size: 12.0, app: 'bnx-mail', appName: 'BNX Mail', type: 'Audio', icon: '🎵', deletedTime: 'Deleted Aug 20', daysRemaining: 24, color: '#2563eb' },
      { id: 'del-3', name: 'notes_todo.txt', size: 1.5, app: 'bnx-mail', appName: 'BNX Mail', type: 'Text', icon: '📄', deletedTime: 'Deleted Aug 10', daysRemaining: 14, color: '#2563eb' },
      { id: 'del-4', name: 'contract_draft_final.docx', size: 14.0, app: 'bnx-mail', appName: 'BNX Mail', type: 'Document', icon: '📄', deletedTime: 'Deleted Aug 05', daysRemaining: 9, color: '#2563eb' },
      { id: 'del-5', name: 'annual_audit_draft.pdf', size: 50.3, app: 'bnx-mail', appName: 'BNX Mail', type: 'PDF', icon: '📄', deletedTime: 'Deleted Jul 28', daysRemaining: 2, color: '#2563eb' },
      ...Array.from({ length: 9 }, (_, i) => ({
        id: `del-bnx-gen-${i}`,
        name: `archive_part_${i + 1}.zip`,
        size: 0.0,
        app: 'bnx-mail',
        appName: 'BNX Mail',
        type: 'Archive',
        icon: '📦',
        deletedTime: 'Deleted Jul 25',
        daysRemaining: 5,
        color: '#2563eb'
      })),

      // Cliks Business: 16 deleted items, totaling 113 MB
      { id: 'del-6', name: 'sales.xlsx', size: 18.6, app: 'cliks-business', appName: 'Cliks Business', type: 'Spreadsheet', icon: '📊', deletedTime: 'Deleted yesterday', daysRemaining: 28, color: '#8b5cf6' },
      { id: 'del-7', name: 'Q2_Marketing_Plan.pptx', size: 14.5, app: 'cliks-business', appName: 'Cliks Business', type: 'Presentation', icon: '📊', deletedTime: 'Deleted Aug 21', daysRemaining: 25, color: '#8b5cf6' },
      { id: 'del-8', name: 'product_demo_v2.mp4', size: 42.0, app: 'cliks-business', appName: 'Cliks Business', type: 'Video', icon: '🎬', deletedTime: 'Deleted Aug 18', daysRemaining: 22, color: '#8b5cf6' },
      { id: 'del-9', name: 'database_backup.sql', size: 35.8, app: 'cliks-business', appName: 'Cliks Business', type: 'Database', icon: '📄', deletedTime: 'Deleted Aug 16', daysRemaining: 20, color: '#8b5cf6' },
      ...Array.from({ length: 12 }, (_, i) => ({
        id: `del-clb-gen-${i}`,
        name: `invoice_scan_${i + 1}.png`,
        size: 0.175,
        app: 'cliks-business',
        appName: 'Cliks Business',
        type: 'Image',
        icon: '🖼',
        deletedTime: 'Deleted Jul 20',
        daysRemaining: 15,
        color: '#8b5cf6'
      })),

      // Cliks: 8 deleted items, totaling 50 MB
      { id: 'del-10', name: 'project.png', size: 8.4, app: 'cliks', appName: 'Cliks', type: 'Image', icon: '🖼', deletedTime: 'Deleted Aug 22', daysRemaining: 26, color: '#0d9488' },
      { id: 'del-11', name: 'index_layout.fig', size: 8.0, app: 'cliks', appName: 'Cliks', type: 'Design', icon: '🖼', deletedTime: 'Deleted Aug 12', daysRemaining: 16, color: '#0d9488' },
      { id: 'del-12', name: 'audio_attachment.wav', size: 6.4, app: 'cliks', appName: 'Cliks', type: 'Audio', icon: '🎵', deletedTime: 'Deleted Aug 02', daysRemaining: 6, color: '#0d9488' },
      { id: 'del-13', name: 'brand_colors.png', size: 23.6, app: 'cliks', appName: 'Cliks', type: 'Image', icon: '🖼', deletedTime: 'Deleted Jul 27', daysRemaining: 1, color: '#0d9488' },
      ...Array.from({ length: 4 }, (_, i) => ({
        id: `del-cl-gen-${i}`,
        name: `temp_file_${i + 1}.log`,
        size: 0.9,
        app: 'cliks',
        appName: 'Cliks',
        type: 'Text',
        icon: '📄',
        deletedTime: 'Deleted Jul 15',
        daysRemaining: 12,
        color: '#0d9488'
      }))
    ]
  };
};

function AppContent() {
  const [state, setState] = useState(getInitialState);
  const location = useLocation();
  const navigate = useNavigate();

  // Authentication & Current User State
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('isAuthenticated') === 'true');
  const [currentUserEmail, setCurrentUserEmail] = useState(() => localStorage.getItem('currentUserEmail') || '');

  // Route guarding and redirection checking
  useEffect(() => {
    if (!isAuthenticated && location.pathname !== '/login') {
      navigate('/login');
    } else if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/dashboard')) {
      navigate('/');
    }
  }, [isAuthenticated, location.pathname, navigate]);

  const handleLoginSuccess = (email) => {
    setCurrentUserEmail(email);
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('currentUserEmail');
    setIsAuthenticated(false);
    setCurrentUserEmail('');
    navigate('/login');
  };

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
    }
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('beta_storage_state_v5', JSON.stringify(state));
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

  const handleRefreshState = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setState(prev => ({
        ...prev,
        lastUpdatedTime: 'Just now'
      }));
    }, 800);
  };

  // derived variables
  const totalUsedStorageMB = state.apps.reduce((acc, app) => {
    return acc + app.files.reduce((sum, f) => sum + f.size, 0);
  }, 0);

  // System Health
  let systemHealth = 'healthy';
  const hasCritical = state.apps.some(app => {
    const used = app.files.reduce((sum, f) => sum + f.size, 0);
    return app.allocatedMB > 0 && (used / app.allocatedMB) >= 0.9;
  });
  if (hasCritical || (totalUsedStorageMB / state.totalPoolMB) >= 0.85) {
    systemHealth = 'critical';
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

  return (
    <div className="app-layout-container">
      {/* Global Top Navbar */}
      <div className="navbar-wrapper">
        <Header
          lastUpdated={state.lastUpdatedTime}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshState}
          currentUserEmail={currentUserEmail}
          onLogout={handleLogout}
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
          ) : selectedAppId && activeApp ? (
            <AppStorageDetails
              app={activeApp}
              decimalPrecision={decimalPrecision}
              showUsagePercent={showUsagePercent}
              onBack={() => {
                navigate('/');
                setIsDrawerOpen(false);
              }}
              onManage={() => setIsDrawerOpen(true)}
              lastUpdated={state.lastUpdatedTime}
              isRefreshing={isRefreshing}
              onRefresh={handleRefreshState}
            />
          ) : (
            <>
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
              />

              {/* Recent Activity Table Ledger */}
              <ActivityFeed
                activities={state.activities}
                onViewActivity={() => { }}
              />
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
