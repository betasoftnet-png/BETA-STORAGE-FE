import React, { useState } from 'react';
import { X, Plus, PlusCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function AdminSettings({ 
  totalPoolMB, 
  apps, 
  onClose, 
  onResizePool, 
  onUpdateAllocation, 
  onAddNewApp,
  decimalPrecision = 2
}) {
  const [activeTab, setActiveTab] = useState('allocations'); // allocations | add-app
  const [newPoolGB, setNewPoolGB] = useState(totalPoolMB / 1024);
  const [poolError, setPoolError] = useState('');

  // Add app form states
  const [appName, setAppName] = useState('');
  const [appCategory, setAppCategory] = useState('');
  const [appAllocationGB, setAppAllocationGB] = useState(1);
  const [selectedColor, setSelectedColor] = useState('0, 242, 254'); // Cyan rgb
  const [addAppError, setAddAppError] = useState('');

  // Calculate allocations totals
  const totalAllocatedMB = apps.reduce((acc, app) => acc + app.allocatedMB, 0);
  const remainingAllocatedMB = Math.max(0, totalPoolMB - totalAllocatedMB);

  // Preset colors
  const colorPresets = [
    { label: 'Cyan', value: '0, 242, 254' },
    { label: 'Purple', value: '127, 0, 255' },
    { label: 'Green', value: '0, 230, 118' },
    { label: 'Amber', value: '255, 159, 0' },
    { label: 'Red', value: '255, 61, 0' }
  ];

  const handleResizePoolSubmit = (e) => {
    e.preventDefault();
    setPoolError('');

    const newSizeGB = parseFloat(newPoolGB);
    if (isNaN(newSizeGB) || newSizeGB <= 0) {
      setPoolError('Pool size must be a positive number.');
      return;
    }

    const newSizeMB = newSizeGB * 1024;
    if (newSizeMB < totalAllocatedMB) {
      setPoolError(`Failed: The new pool size (${newSizeGB} GB) is smaller than the current total allocated space of ${(totalAllocatedMB / 1024).toFixed(decimalPrecision)} GB.`);
      return;
    }

    onResizePool(newSizeMB);
    alert(`Storage Pool size updated to ${newSizeGB} GB successfully.`);
  };

  const handleSliderChange = (appId, valGB, currentUsedMB) => {
    const valMB = valGB * 1024;
    
    // Check if new allocation is less than current files used space
    if (valMB < currentUsedMB) {
      // Don't allow setting allocation below current used
      return;
    }

    // Check if new total allocated exceeds pool size
    const otherAllocationsMB = apps
      .filter(a => a.id !== appId)
      .reduce((acc, a) => acc + a.allocatedMB, 0);

    if (otherAllocationsMB + valMB > totalPoolMB) {
      // Allocation exceeds pool size
      return;
    }

    onUpdateAllocation(appId, valMB);
  };

  const handleAddAppSubmit = (e) => {
    e.preventDefault();
    setAddAppError('');

    if (!appName.trim()) {
      setAddAppError('Please enter an application name.');
      return;
    }

    if (!appCategory.trim()) {
      setAddAppError('Please enter an app category.');
      return;
    }

    const allocationMB = parseFloat(appAllocationGB) * 1024;
    if (isNaN(allocationMB) || allocationMB <= 0) {
      setAddAppError('Allocation size must be positive.');
      return;
    }

    // Check pool capacity
    if (totalAllocatedMB + allocationMB > totalPoolMB) {
      setAddAppError(`Failed: Not enough storage pool space. You are trying to allocate ${appAllocationGB} GB, but only ${(remainingAllocatedMB / 1024).toFixed(decimalPrecision)} GB is unallocated.`);
      return;
    }

    // Check duplicate name
    const cleanId = appName.toLowerCase().replace(/\s+/g, '-');
    if (apps.some(a => a.id === cleanId)) {
      setAddAppError('An application with a similar name already exists.');
      return;
    }

    onAddNewApp({
      id: cleanId,
      name: appName.trim(),
      category: appCategory.trim(),
      allocatedMB: allocationMB,
      colorTheme: selectedColor,
      files: []
    });

    // Reset Form
    setAppName('');
    setAppCategory('');
    setAppAllocationGB(1);
    setActiveTab('allocations');
    alert(`Successfully registered "${appName}" inside the BETA storage ecosystem.`);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase' }}>
            ECOSYSTEM CONFIGURATION
          </h2>
          <button className="drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--bg-primary)'
        }}>
          <button
            onClick={() => setActiveTab('allocations')}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'allocations' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === 'allocations' ? '2px solid var(--accent-cyan)' : 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            App Allocations
          </button>
          <button
            onClick={() => setActiveTab('add-app')}
            style={{
              flex: 1,
              padding: '1rem',
              background: 'none',
              border: 'none',
              color: activeTab === 'add-app' ? 'var(--accent-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === 'add-app' ? '2px solid var(--accent-cyan)' : 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            Register Application
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'allocations' ? (
            <div>
              {/* Pool Resizing Section */}
              <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'var(--bg-primary)' }}>
                <h3 className="card-title" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                  EXPAND STORAGE POOL SIZE
                </h3>
                <form onSubmit={handleResizePoolSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ margin: 0, flex: 1 }}>
                    <label>Ecosystem Pool Capacity (GB)</label>
                    <input 
                      type="number" 
                      className="form-control"
                      value={newPoolGB}
                      onChange={(e) => setNewPoolGB(e.target.value)}
                      min="1"
                      step="1"
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                    Save Size
                  </button>
                </form>
                {poolError && (
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-critical)', fontSize: '0.75rem', marginTop: '0.5rem', alignItems: 'center' }}>
                    <AlertCircle size={14} />
                    <span>{poolError}</span>
                  </div>
                )}
              </div>

              {/* Individual App Sliders */}
              <div className="card-title" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
                ADJUST APPLICATION LIMITS
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.75rem' }}>
                <span>Unallocated Pool Space</span>
                <span style={{ color: remainingAllocatedMB > 0 ? 'var(--color-healthy)' : 'var(--text-muted)' }}>
                  {(remainingAllocatedMB / 1024).toFixed(decimalPrecision)} GB Available
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {apps.map(app => {
                  const currentUsedMB = app.files.reduce((acc, f) => acc + f.size, 0);
                  const currentLimitGB = app.allocatedMB / 1024;
                  const currentUsedGB = currentUsedMB / 1024;
                  
                  // Slider limits
                  const minSliderGB = Math.max(1, Math.ceil(currentUsedGB)); // Cannot drop below rounded used GB
                  const maxSliderGB = currentLimitGB + (remainingAllocatedMB / 1024);

                  return (
                    <div className="settings-slider-row" key={app.id}>
                      <div className="settings-slider-header">
                        <span style={{ color: `rgb(${app.colorTheme})` }}>{app.name}</span>
                        <span>
                          {currentLimitGB.toFixed(decimalPrecision)} GB limit
                        </span>
                      </div>
                      
                      <input 
                        type="range" 
                        min={minSliderGB} 
                        max={Math.max(minSliderGB, Math.floor(maxSliderGB))} 
                        step="1"
                        value={currentLimitGB}
                        className="settings-slider"
                        onChange={(e) => handleSliderChange(app.id, parseInt(e.target.value), currentUsedMB)}
                        style={{ accentColor: `rgb(${app.colorTheme})` }}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                        <span>Min (used): {currentUsedGB.toFixed(decimalPrecision)} GB</span>
                        <span>Max (pool): {Math.floor(maxSliderGB)} GB</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Add app panel */
            <form onSubmit={handleAddAppSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Application Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. BETA CODE, BNX DRIVE" 
                  className="form-control"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Category / Platform Type</label>
                <input 
                  type="text" 
                  placeholder="e.g. CODING INTERFACE, FILE STORAGE" 
                  className="form-control"
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Initial Allocation (GB)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={appAllocationGB}
                  onChange={(e) => setAppAllocationGB(e.target.value)}
                  min="1"
                  max={Math.floor(totalPoolMB / 1024)}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.25rem', display: 'block' }}>
                  Available Pool space: {(remainingAllocatedMB / 1024).toFixed(decimalPrecision)} GB
                </span>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>UI Theme Accent Color</label>
                <div className="color-select-row">
                  {colorPresets.map(color => (
                    <div 
                      key={color.value} 
                      className={`color-dot-opt ${selectedColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: `rgb(${color.value})` }}
                      onClick={() => setSelectedColor(color.value)}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>

              {addAppError && (
                <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--color-critical)', fontSize: '0.75rem', alignItems: 'center', background: 'rgba(255, 61, 0, 0.1)', padding: '0.5rem', borderRadius: '6px' }}>
                  <AlertCircle size={14} />
                  <span>{addAppError}</span>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>
                <PlusCircle size={16} /> Register Application
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
