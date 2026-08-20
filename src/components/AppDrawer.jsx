import React, { useState } from 'react';
import { X, Search, Trash2, Upload, AlertCircle, Sparkles, FolderArchive, Eraser } from 'lucide-react';

export default function AppDrawer({ app, onClose, onUploadFile, onDeleteFile, onTriggerCleanup, onCompressLogs }) {
  const { id, name, category, allocatedMB, files, colorTheme } = app;
  const [searchTerm, setSearchTerm] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(15);
  const [fileType, setFileType] = useState('Document');
  const [uploadError, setUploadError] = useState('');

  // Calculate used storage
  const usedMB = files.reduce((acc, f) => acc + f.size, 0);
  const usedPercent = allocatedMB > 0 ? Math.round((usedMB / allocatedMB) * 100) : 0;
  
  // Format sizes
  const formatSize = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadError('');

    if (!fileName.trim()) {
      setUploadError('Please specify a file name.');
      return;
    }

    const size = parseFloat(fileSize);
    if (isNaN(size) || size <= 0) {
      setUploadError('File size must be a positive number.');
      return;
    }

    if (usedMB + size > allocatedMB) {
      setUploadError(`Failed: Adding this file would exceed the app's allocation limit of ${formatSize(allocatedMB)}.`);
      return;
    }

    onUploadFile(id, fileName.trim(), size, fileType);
    setFileName('');
    setUploadError('');
  };

  const handlePresetUpload = (presetName, presetSize, presetType) => {
    setUploadError('');
    if (usedMB + presetSize > allocatedMB) {
      setUploadError(`Failed: Adding this file would exceed the app's allocation limit of ${formatSize(allocatedMB)}.`);
      return;
    }
    onUploadFile(id, presetName, presetSize, presetType);
  };

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <div className="drawer-content">
        <div className="drawer-header">
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, textTransform: 'uppercase', color: `rgb(${colorTheme})` }}>
              {name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05rem' }}>
              {category}
            </p>
          </div>
          <button className="drawer-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Storage stats panel */}
        <div 
          className="glass-card" 
          style={{ 
            marginBottom: '1.5rem', 
            background: `rgba(${colorTheme}, 0.03)`, 
            border: `1px solid rgba(${colorTheme}, 0.2)` 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>App Allocation Usage</span>
            <span style={{ color: `rgb(${colorTheme})`, fontWeight: 'bold' }}>
              {formatSize(usedMB)} / {formatSize(allocatedMB)} ({usedPercent}%)
            </span>
          </div>
          <div className="progress-container">
            <div 
              className="progress-bar" 
              style={{ 
                width: `${Math.min(100, usedPercent)}%`,
                background: `rgb(${colorTheme})` 
              }}
            />
          </div>
        </div>

        {/* Simulated upload section */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
            <Upload size={16} style={{ color: 'var(--accent-cyan)' }} />
            SIMULATE FILE UPLOAD
          </h3>

          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>File Name</label>
              <input 
                type="text" 
                placeholder="e.g. backup_db_v2.sql, attachment_image.png" 
                className="form-control"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>File Size (MB)</label>
                <input 
                  type="number" 
                  className="form-control"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  min="1"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>File Type</label>
                <select 
                  className="form-control"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="Document">Document</option>
                  <option value="Database">Database Backup</option>
                  <option value="Logs">Logs / System Records</option>
                  <option value="Attachment">Attachment File</option>
                  <option value="Media">Media Content</option>
                </select>
              </div>
            </div>

            {uploadError && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: 'var(--color-critical)', 
                fontSize: '0.75rem', 
                background: 'rgba(255, 61, 0, 0.1)', 
                padding: '0.5rem', 
                borderRadius: '6px' 
              }}>
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span>{uploadError}</span>
              </div>
            )}

            <button type="submit" className="btn-primary">
              Upload File
            </button>
          </form>

          {/* Preset Buttons */}
          <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Quick Presets
            </span>
            <div className="quick-simulator-grid">
              <button 
                type="button" 
                className="btn-quick"
                onClick={() => handlePresetUpload(`logs_${Date.now().toString().slice(-4)}.log`, 12, 'Logs')}
              >
                +12 MB Log
              </button>
              <button 
                type="button" 
                className="btn-quick"
                onClick={() => handlePresetUpload(`db_dump_${Date.now().toString().slice(-4)}.sql`, 150, 'Database')}
              >
                +150 MB DB
              </button>
              <button 
                type="button" 
                className="btn-quick"
                onClick={() => handlePresetUpload(`attachment_${Date.now().toString().slice(-4)}.pdf`, 35, 'Attachment')}
              >
                +35 MB Attach
              </button>
            </div>
          </div>
        </div>

        {/* Maintenance Actions */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
            CLEANUP & OPTIMIZATION POLICIES
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button 
              type="button" 
              className="icon-btn" 
              onClick={() => onTriggerCleanup(id)}
              style={{ width: '100%', fontSize: '0.75rem', gap: '0.35rem', padding: '0.65rem 0.5rem' }}
              title="Deletes temporary files (temp_*, cache_*)"
            >
              <Eraser size={14} />
              Purge Temp Caches
            </button>
            <button 
              type="button" 
              className="icon-btn" 
              onClick={() => onCompressLogs(id)}
              style={{ width: '100%', fontSize: '0.75rem', gap: '0.35rem', padding: '0.65rem 0.5rem' }}
              title="Compresses log files (reducing their sizes by half)"
            >
              <FolderArchive size={14} />
              Compress SysLogs
            </button>
          </div>
        </div>

        {/* File inventory list */}
        <div className="glass-card">
          <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '0.75rem' }}>
            FILE STORAGE INVENTORY
          </h3>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Search files by name..." 
              className="form-control" 
              style={{ paddingLeft: '2.25rem', fontSize: '0.8rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search 
              size={14} 
              style={{ 
                position: 'absolute', 
                left: '0.85rem', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: 'var(--text-dim)' 
              }} 
            />
          </div>

          <div className="file-list">
            {filteredFiles.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.8rem' }}>
                No files found matching current criteria.
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div className="file-item" key={file.id}>
                  <div className="file-item-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-meta">
                      Type: {file.type} | Size: {formatSize(file.size)} | Uploaded: {file.time}
                    </span>
                  </div>
                  <button 
                    className="btn-danger-outline"
                    onClick={() => onDeleteFile(id, file.id, file.name, file.size)}
                    title="Delete file"
                    style={{ padding: '0.35rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
