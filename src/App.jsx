import React, { useState, useEffect } from 'react';
import { 
  Cloud, Home, Mail, Layers, Briefcase, BarChart3, Folder, 
  Search, Trash2, Bell, Settings, Server, RefreshCw, Check 
} from 'lucide-react';
import Header from './components/Header';
import StorageOverview from './components/StorageOverview';
import AppCard from './components/AppCard';
import StorageInsights from './components/StorageInsights';
import ActivityFeed from './components/ActivityFeed';

// Load or return reference default state
const getInitialState = () => {
  const localData = localStorage.getItem('beta_storage_state_v2');
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
          { id: 'bnx-f1', name: 'Project_Proposal.pdf', size: 250, type: 'Attachment', time: '2h ago' },
          { id: 'bnx-f2', name: 'Mailbox_Backup.db', size: 120, type: 'Database', time: '5h ago' },
          { id: 'bnx-f3', name: 'Profile_Picture.png', size: 50, type: 'Images', time: '1d ago' }
        ]
      },
      {
        id: 'cliks',
        name: 'Cliks',
        category: 'Workplace Collaboration',
        allocatedMB: 1024,
        colorTheme: '13, 148, 136', // Teal rgb
        files: [
          { id: 'cl-f1', name: 'Design_System.fig', size: 430, type: 'Images', time: '12m ago' },
          { id: 'cl-f2', name: 'Session_Logs.log', size: 120, type: 'Logs', time: '1h ago' },
          { id: 'cl-f3', name: 'Workspace_Data.db', size: 100, type: 'Database', time: '2d ago' },
          { id: 'cl-f4', name: 'temp_scratch.txt', size: 30, type: 'Attachment', time: '3d ago' }
        ]
      },
      {
        id: 'cliks-business',
        name: 'Cliks Business',
        category: 'Business Management',
        allocatedMB: 1024,
        colorTheme: '139, 92, 246', // Purple rgb
        files: [
          { id: 'clb-f1', name: 'Quarterly_Report.xlsx', size: 400, type: 'Document', time: '24m ago' },
          { id: 'clb-f2', name: 'Promo_Video.mp4', size: 220, type: 'Videos', time: '4h ago' },
          { id: 'clb-f3', name: 'Client_Invoice.pdf', size: 80, type: 'Attachment', time: '3h ago' }
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
    lastUpdatedTime: 'Just now'
  };
};

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('beta_storage_state_v2', JSON.stringify(state));
  }, [state]);

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
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return { ...a, files: a.files.filter(f => f.id !== fileId) };
        }
        return a;
      });

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
      alert(`No temporary files found in ${targetApp.name}.`);
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
    alert(`Cleaned ${totalReleased} MB from cache.`);
  };

  const handleCompressLogs = (appId) => {
    const targetApp = state.apps.find(a => a.id === appId);
    const logsFiles = targetApp.files.filter(f => f.type === 'Logs');

    if (logsFiles.length === 0) {
      alert(`No logs files found in ${targetApp.name}.`);
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
    alert(`Compressed logs. Reclaimed ${totalReleased} MB.`);
  };

  const clearNotifications = () => {
    setState(prev => ({ ...prev, notifications: [] }));
  };

  const activeApp = state.apps.find(a => a.id === selectedAppId);

  return (
    <div className="dashboard-layout">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-section">
            <div className="logo-container">
              <Cloud size={28} fill="currentColor" />
            </div>
            <div>
              <h1>BETA</h1>
              <p>STORAGE ECOSYSTEM</p>
            </div>
          </div>

          <nav className="sidebar-navigation">
            <div className="menu-group">
              <span className="menu-item active">
                <Home size={16} /> Overview
              </span>
            </div>

            <div className="menu-group">
              <span className="menu-label">APPLICATIONS</span>
              {state.apps.map(app => (
                <span 
                  key={app.id} 
                  className="menu-item" 
                >
                  {app.id === 'bnx-mail' ? (
                    <Mail size={16} />
                  ) : app.id === 'cliks' ? (
                    <Layers size={16} />
                  ) : (
                    <Briefcase size={16} />
                  )}
                  {app.name}
                </span>
              ))}
            </div>

            <div className="menu-group">
              <span className="menu-label">STORAGE MANAGEMENT</span>
              <span className="menu-item"><BarChart3 size={16} /> Storage Usage</span>
              <span className="menu-item"><Folder size={16} /> File Categories</span>
              <span className="menu-item"><Search size={16} /> Large Files</span>
              <span className="menu-item"><Trash2 size={16} /> Recycle Bin</span>
            </div>

            <div className="menu-group">
              <span className="menu-label">SYSTEM</span>
              <span className="menu-item" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Bell size={16} /> Alerts
                </span>
              </span>
              <span className="menu-item">
                <Settings size={16} /> Settings
              </span>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Header */}
        <Header 
          lastUpdated={state.lastUpdatedTime}
          isRefreshing={isRefreshing}
          onRefresh={handleRefreshState}
        />

        {/* Total Ecosystem Storage wide card banner */}
        <StorageOverview 
          totalPoolMB={state.totalPoolMB} 
          usedStorageMB={totalUsedStorageMB} 
        />

        {/* Application Storage Cards Grid section */}
        <div className="section-header">
          <h3>Application Storage</h3>
          <p>Each application has 1 GB allocated storage</p>
        </div>

        <div className="apps-grid">
          {state.apps.map(app => (
            <AppCard 
              key={app.id} 
              app={app} 
              onManage={() => {}} 
            />
          ))}
        </div>

        {/* Insights Row (Storage Distribution, Category Breakdown, Status Security) */}
        <StorageInsights 
          totalPoolMB={state.totalPoolMB} 
          usedStorageMB={totalUsedStorageMB} 
          apps={state.apps}
        />

        {/* Recent Activity Table Ledger */}
        <ActivityFeed 
          activities={state.activities} 
          onViewActivity={() => {}}
        />
      </main>

      {/* Drawer sandbox panels Removed */}

      {/* Admin Settings Modal Removed */}
    </div>
  );
}
