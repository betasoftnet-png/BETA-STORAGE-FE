import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import StorageOverview from './components/StorageOverview';
import AppCard from './components/AppCard';
import AllocationTree from './components/AllocationTree';
import StorageInsights from './components/StorageInsights';
import ActivityFeed from './components/ActivityFeed';
import AppDrawer from './components/AppDrawer';
import AdminSettings from './components/AdminSettings';

// Helper to load localStorage state or return defaults
const getInitialState = () => {
  const localData = localStorage.getItem('beta_storage_state');
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse local storage state, using defaults.', e);
    }
  }

  // Reference Default values
  return {
    totalPoolMB: 5120, // 5.0 GB
    apps: [
      {
        id: 'bnx-mail',
        name: 'BNX MAIL',
        category: 'MAIL PLATFORM',
        allocatedMB: 1024, // 1 GB
        colorTheme: '0, 242, 254', // Neon Cyan
        files: [
          { id: 'bnx-f1', name: 'attachment_archives.zip', size: 250, type: 'Attachment', time: '2 hours ago' },
          { id: 'bnx-f2', name: 'incoming_mailbox.db', size: 120, type: 'Database', time: '5 hours ago' },
          { id: 'bnx-f3', name: 'temp_cache_data.tmp', size: 50, type: 'Document', time: '1 day ago' }
        ]
      },
      {
        id: 'cliks',
        name: 'CLIKS',
        category: 'WORKSPACE PLATFORM',
        allocatedMB: 1024, // 1 GB
        colorTheme: '127, 0, 255', // Purple
        files: [
          { id: 'cl-f1', name: 'workspace_records.db', size: 450, type: 'Database', time: '1 hour ago' },
          { id: 'cl-f2', name: 'session_records.log', size: 150, type: 'Logs', time: '12 mins ago' },
          { id: 'cl-f3', name: 'user_uploaded_sheet.xlsx', size: 80, type: 'Document', time: '2 days ago' }
        ]
      },
      {
        id: 'cliks-business',
        name: 'CLIKS BUSINESS',
        category: 'BUSINESS PLATFORM',
        allocatedMB: 1024, // 1 GB
        colorTheme: '0, 230, 118', // Emerald Green
        files: [
          { id: 'clb-f1', name: 'corporate_contracts.pdf', size: 380, type: 'Document', time: '24 mins ago' },
          { id: 'clb-f2', name: 'financial_ledger.db', size: 220, type: 'Database', time: '3 hours ago' },
          { id: 'clb-f3', name: 'marketing_banner.mp4', size: 100, type: 'Media', time: '4 hours ago' }
        ]
      }
    ],
    activities: [
      { appName: 'BNX Mail', description: 'Attachment uploaded', diff: '+12 MB', colorTheme: '0, 242, 254', time: '2 min ago' },
      { appName: 'CLIKS', description: 'File uploaded', diff: '+8 MB', colorTheme: '127, 0, 255', time: '12 min ago' },
      { appName: 'CLIKS Business', description: 'Document uploaded', diff: '+15 MB', colorTheme: '0, 230, 118', time: '24 min ago' },
      { appName: 'BNX Mail', description: 'Storage released', diff: '-32 MB', colorTheme: '0, 242, 254', time: '1 hour ago' }
    ],
    notifications: []
  };
};

export default function App() {
  const [state, setState] = useState(getInitialState);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('beta_storage_state', JSON.stringify(state));
  }, [state]);

  // Periodic automatic activity simulator to make UI feel alive
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate minor cleanup or background actions 20% of the time
      if (Math.random() > 0.8) {
        const randomAppIndex = Math.floor(Math.random() * state.apps.length);
        const targetApp = state.apps[randomAppIndex];
        
        // Random actions
        const isUpload = Math.random() > 0.5;
        if (isUpload) {
          // Sync upload
          const uploadSize = Math.floor(Math.random() * 8) + 2; // 2 - 10 MB
          const newFile = {
            id: `sim-${Date.now()}`,
            name: `bg_sync_${Date.now().toString().slice(-4)}.tmp`,
            size: uploadSize,
            type: 'Document',
            time: 'Just now'
          };
          
          // Check limits
          const appUsed = targetApp.files.reduce((sum, f) => sum + f.size, 0);
          if (appUsed + uploadSize <= targetApp.allocatedMB) {
            setState(prev => {
              const updatedApps = prev.apps.map(a => {
                if (a.id === targetApp.id) {
                  return { ...a, files: [newFile, ...a.files] };
                }
                return a;
              });

              const newActivity = {
                appName: targetApp.name,
                description: 'Background Sync completed',
                diff: `+${uploadSize} MB`,
                colorTheme: targetApp.colorTheme,
                time: 'Just now'
              };

              return {
                ...prev,
                apps: updatedApps,
                activities: [newActivity, ...prev.activities.slice(0, 9)]
              };
            });
          }
        } else {
          // Log compression release
          const logsFiles = targetApp.files.filter(f => f.type === 'Logs');
          if (logsFiles.length > 0) {
            const fileToCompress = logsFiles[Math.floor(Math.random() * logsFiles.length)];
            const releaseSize = Math.round(fileToCompress.size * 0.3); // free up 30%
            
            if (releaseSize > 1) {
              setState(prev => {
                const updatedApps = prev.apps.map(a => {
                  if (a.id === targetApp.id) {
                    return {
                      ...a,
                      files: a.files.map(f => {
                        if (f.id === fileToCompress.id) {
                          return { ...f, size: Math.max(1, f.size - releaseSize), name: f.name.replace('.log', '_compressed.log') };
                        }
                        return f;
                      })
                    };
                  }
                  return a;
                });

                const newActivity = {
                  appName: targetApp.name,
                  description: `SysLogs optimized`,
                  diff: `-${releaseSize} MB`,
                  colorTheme: targetApp.colorTheme,
                  time: 'Just now'
                };

                return {
                  ...prev,
                  apps: updatedApps,
                  activities: [newActivity, ...prev.activities.slice(0, 9)]
                };
              });
            }
          }
        }
      }
    }, 25000); // Trigger check every 25 seconds

    return () => clearInterval(interval);
  }, [state.apps]);

  // Check app utilization thresholds and append warning notifications
  useEffect(() => {
    const newNotifications = [];
    state.apps.forEach(app => {
      const appUsed = app.files.reduce((sum, f) => sum + f.size, 0);
      const usedPercent = app.allocatedMB > 0 ? (appUsed / app.allocatedMB) * 100 : 0;
      
      if (usedPercent >= 90) {
        newNotifications.push({
          type: 'critical',
          message: `${app.name} is running out of space! (${usedPercent.toFixed(0)}% used)`,
          time: 'Just now'
        });
      } else if (usedPercent >= 80) {
        newNotifications.push({
          type: 'warning',
          message: `${app.name} storage allocation exceeds threshold (${usedPercent.toFixed(0)}% used)`,
          time: 'Just now'
        });
      }
    });

    // Check overall pool utilization
    const totalUsed = state.apps.reduce((sum, app) => sum + app.files.reduce((acc, f) => acc + f.size, 0), 0);
    const poolPercent = state.totalPoolMB > 0 ? (totalUsed / state.totalPoolMB) * 100 : 0;
    if (poolPercent >= 85) {
      newNotifications.push({
        type: 'critical',
        message: `Beta Storage Pool capacity critical (${poolPercent.toFixed(0)}% used)`,
        time: 'Just now'
      });
    }

    // Set warnings if they differ
    if (JSON.stringify(newNotifications.map(n => n.message)) !== JSON.stringify(state.notifications.map(n => n.message))) {
      setState(prev => ({ ...prev, notifications: newNotifications }));
    }
  }, [state.apps, state.totalPoolMB]);

  // Derived variables
  const totalUsedStorageMB = state.apps.reduce((acc, app) => {
    return acc + app.files.reduce((sum, f) => sum + f.size, 0);
  }, 0);

  // Overall ecosystem health determination
  let systemHealth = 'healthy';
  const highCapacityApps = state.apps.filter(app => {
    const appUsed = app.files.reduce((sum, f) => sum + f.size, 0);
    return app.allocatedMB > 0 && (appUsed / app.allocatedMB) >= 0.9;
  });
  const warnCapacityApps = state.apps.filter(app => {
    const appUsed = app.files.reduce((sum, f) => sum + f.size, 0);
    const ratio = appUsed / app.allocatedMB;
    return app.allocatedMB > 0 && ratio >= 0.75 && ratio < 0.9;
  });

  if (highCapacityApps.length > 0 || (totalUsedStorageMB / state.totalPoolMB) >= 0.85) {
    systemHealth = 'critical';
  } else if (warnCapacityApps.length > 0 || (totalUsedStorageMB / state.totalPoolMB) >= 0.7) {
    systemHealth = 'warning';
  }

  // Operations
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
          return {
            ...a,
            files: [newFile, ...a.files]
          };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `${type} uploaded`,
        diff: `+${Math.round(size)} MB`,
        colorTheme: targetApp.colorTheme,
        time: timestamp
      };

      return {
        ...prev,
        apps: updatedApps,
        activities: [newLog, ...prev.activities.slice(0, 9)]
      };
    });
  };

  const handleDeleteFile = (appId, fileId, fileName, fileSize) => {
    const timestamp = 'Just now';
    setState(prev => {
      const targetApp = prev.apps.find(a => a.id === appId);
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            files: a.files.filter(f => f.id !== fileId)
          };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `Storage released`,
        diff: `-${Math.round(fileSize)} MB`,
        colorTheme: targetApp.colorTheme,
        time: timestamp
      };

      return {
        ...prev,
        apps: updatedApps,
        activities: [newLog, ...prev.activities.slice(0, 9)]
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
        apps: prev.apps.map(a => {
          if (a.id === appId) {
            return { ...a, allocatedMB: valMB };
          }
          return a;
        }),
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
        colorTheme: '255, 255, 255',
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
        description: `Registered inside Ecosystem`,
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
    // Find files matching "temp" or "cache" or ".tmp"
    const tempFiles = targetApp.files.filter(f => 
      f.name.toLowerCase().includes('temp') || 
      f.name.toLowerCase().includes('cache') ||
      f.name.endsWith('.tmp')
    );

    if (tempFiles.length === 0) {
      alert(`No temporary files or caches identified in ${targetApp.name}.`);
      return;
    }

    const totalReleased = tempFiles.reduce((sum, f) => sum + f.size, 0);

    setState(prev => {
      const updatedApps = prev.apps.map(a => {
        if (a.id === appId) {
          return {
            ...a,
            files: a.files.filter(f => !tempFiles.some(tf => tf.id === f.id))
          };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `Purged ${tempFiles.length} cache files`,
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

    alert(`Cleanup policy completed. Released ${totalReleased} MB from cache.`);
  };

  const handleCompressLogs = (appId) => {
    const targetApp = state.apps.find(a => a.id === appId);
    const logsFiles = targetApp.files.filter(f => f.type === 'Logs');

    if (logsFiles.length === 0) {
      alert(`No log files identified in ${targetApp.name}.`);
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
                const newSize = Math.max(1, Math.round(f.size * 0.5)); // half size
                totalReleased += (f.size - newSize);
                return { 
                  ...f, 
                  size: newSize,
                  name: f.name.includes('_compressed') ? f.name : f.name.replace('.log', '_compressed.log') 
                };
              }
              return f;
            })
          };
        }
        return a;
      });

      const newLog = {
        appName: targetApp.name,
        description: `Compressed syslogs (50% reduction)`,
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

    alert(`Compression complete. Reclaimed ${totalReleased} MB.`);
  };

  const clearNotifications = () => {
    setState(prev => ({ ...prev, notifications: [] }));
  };

  // Find active app for drawer
  const activeApp = state.apps.find(a => a.id === selectedAppId);

  return (
    <div className="dashboard-container">
      {/* Background aurora lights */}
      <div className="aurora-emitter-1" />
      <div className="aurora-emitter-2" />

      {/* Header */}
      <Header 
        systemHealth={systemHealth} 
        notifications={state.notifications}
        clearNotifications={clearNotifications}
        openAdminSettings={() => setIsAdminOpen(true)}
      />

      {/* Main Grid: Overview + Activity */}
      <div className="dashboard-grid">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <StorageOverview 
            totalPoolMB={state.totalPoolMB} 
            usedStorageMB={totalUsedStorageMB} 
          />
        </div>
        
        <div>
          <ActivityFeed 
            activities={state.activities} 
            onViewActivity={() => setIsAdminOpen(true)}
          />
        </div>
      </div>

      {/* Apps Section Title */}
      <div className="card-title" style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
        BETA APPLICATIONS
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>
        Storage allocation across the BETA ecosystem
      </p>

      {/* Applications Cards Grid */}
      <div className="apps-grid">
        {state.apps.map(app => (
          <AppCard 
            key={app.id} 
            app={app} 
            onManage={() => setSelectedAppId(app.id)} 
          />
        ))}
      </div>

      {/* Interactive Allocation Tree Section */}
      <AllocationTree 
        totalPoolMB={state.totalPoolMB} 
        apps={state.apps}
        onSelectApp={(appId) => setSelectedAppId(appId)}
        onAddApp={() => {
          setIsAdminOpen(true);
        }}
      />

      {/* Analytics Insights */}
      <StorageInsights 
        totalPoolMB={state.totalPoolMB} 
        usedStorageMB={totalUsedStorageMB} 
        appsCount={state.apps.length} 
        maxAppsCount={Math.floor(state.totalPoolMB / 1024)} 
      />

      {/* App sandbox drawer */}
      {activeApp && (
        <AppDrawer 
          app={activeApp} 
          onClose={() => setSelectedAppId(null)}
          onUploadFile={handleUploadFile}
          onDeleteFile={handleDeleteFile}
          onTriggerCleanup={handleTriggerCleanup}
          onCompressLogs={handleCompressLogs}
        />
      )}

      {/* Configuration admin modal */}
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
    </div>
  );
}
