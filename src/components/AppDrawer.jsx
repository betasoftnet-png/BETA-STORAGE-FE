import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Search, Trash2, Upload, AlertCircle, Sparkles, FolderArchive, Eraser, FileText, CheckCircle2, UploadCloud } from 'lucide-react';

export default function AppDrawer({ app, onClose, onUploadFile, onDeleteFile, onTriggerCleanup, onCompressLogs, decimalPrecision = 2, showUsagePercent = true }) {
  const { t } = useTranslation();
  const { id, name, category, allocatedMB, files, colorTheme } = app;
  const [searchTerm, setSearchTerm] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState(id === 'cliks-business' ? 'Audit & Tax (FIN-PRO)' : 'Document');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Calculate used storage
  const usedMB = files.reduce((acc, f) => acc + f.size, 0);
  const usedPercent = allocatedMB > 0 ? Math.round((usedMB / allocatedMB) * 100) : 0;
  
  // Format sizes
  const formatSize = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(decimalPrecision)} GB` : `${mb.toFixed(decimalPrecision)} MB`;
  };

  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.type && f.type.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Auto detect category from file name / mime
  const detectFileType = (fName) => {
    const lower = fName.toLowerCase();
    if (id === 'cliks-business') {
      if (lower.endsWith('.xlsx') || lower.endsWith('.csv') || lower.endsWith('.pdf')) {
        return 'Sales & Purchases';
      }
      if (lower.endsWith('.sql') || lower.endsWith('.db') || lower.includes('tax') || lower.includes('audit')) {
        return 'Audit & Tax (FIN-PRO)';
      }
      if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg')) {
        return 'Inventory & Media';
      }
      if (lower.includes('receipt') || lower.includes('expense') || lower.endsWith('.zip')) {
        return 'Expenses';
      }
      return 'HR & Payroll';
    }

    if (lower.endsWith('.pdf')) return 'Attachment';
    if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.gif') || lower.endsWith('.svg')) return 'Images';
    if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.avi')) return 'Videos';
    if (lower.endsWith('.mp3') || lower.endsWith('.wav')) return 'Audio';
    if (lower.endsWith('.db') || lower.endsWith('.sql')) return 'Database';
    if (lower.endsWith('.log')) return 'Logs';
    return 'Document';
  };

  const handleNativeFileSelect = (selectedFile) => {
    if (!selectedFile) return;
    setUploadError('');
    setUploadSuccess('');

    const sizeInMB = Math.max(0.01, parseFloat((selectedFile.size / (1024 * 1024)).toFixed(3)));
    const detectedType = detectFileType(selectedFile.name);

    if (usedMB + sizeInMB > allocatedMB) {
      setUploadError(t('drawer.errorExceedLimit', { limit: formatSize(allocatedMB) }));
      return;
    }

    onUploadFile(id, selectedFile.name, sizeInMB, detectedType);
    setUploadSuccess(`Uploaded "${selectedFile.name}" (${sizeInMB >= 1 ? sizeInMB.toFixed(2) + ' MB' : (selectedFile.size / 1024).toFixed(1) + ' KB'}) successfully.`);
    setTimeout(() => setUploadSuccess(''), 4000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleNativeFileSelect(file);
      e.target.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) {
      handleNativeFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!fileName.trim()) {
      setUploadError(t('drawer.errorName'));
      return;
    }

    const size = parseFloat(fileSize);
    if (isNaN(size) || size <= 0) {
      setUploadError(t('drawer.errorSize'));
      return;
    }

    if (usedMB + size > allocatedMB) {
      setUploadError(t('drawer.errorExceedLimit', { limit: formatSize(allocatedMB) }));
      return;
    }

    onUploadFile(id, fileName.trim(), size, fileType);
    setUploadSuccess(`Added "${fileName.trim()}" (${size} MB) successfully.`);
    setFileName('');
    setFileSize('');
    setUploadError('');
    setTimeout(() => setUploadSuccess(''), 4000);
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
            <span style={{ fontWeight: 600 }}>{t('drawer.allocationUsage')}</span>
            <span style={{ color: `rgb(${colorTheme})`, fontWeight: 'bold' }}>
              {formatSize(usedMB)} / {formatSize(allocatedMB)}{showUsagePercent && ` (${usedPercent}%)`}
            </span>
          </div>
          <div className="progress-container" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }}>
            <div
              className="progress-bar"
              style={{
                width: `${Math.min(100, usedPercent)}%`,
                backgroundColor: `rgb(${colorTheme})`,
                borderRadius: '3px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Real-time File Upload Section */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
            <Upload size={16} style={{ color: 'var(--accent-blue)' }} />
            {t('appStorageDetails.uploadNewFile')}
          </h3>

          {/* Native Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              border: `2px dashed ${isDragging ? `rgb(${colorTheme})` : 'var(--border-color)'}`,
              borderRadius: '10px',
              padding: '1.25rem',
              textAlign: 'center',
              backgroundColor: isDragging ? `rgba(${colorTheme}, 0.05)` : 'rgba(248, 250, 252, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '1rem'
            }}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <UploadCloud size={28} style={{ color: `rgb(${colorTheme})`, margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Choose a file from your computer
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              or drag and drop here (auto-calculates real size & category)
            </div>
          </div>

          {/* Manual Entry Form */}
          <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              <span>Or enter file details manually:</span>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <input 
                type="text" 
                placeholder="File name (e.g. document_archive.pdf)" 
                className="form-control"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                style={{ fontSize: '0.85rem' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <input 
                  type="number" 
                  className="form-control"
                  placeholder="Size in MB (e.g. 25)"
                  value={fileSize}
                  onChange={(e) => setFileSize(e.target.value)}
                  min="0.1"
                  step="any"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <select 
                  className="form-control"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  style={{ fontSize: '0.85rem' }}
                >
                  {id === 'cliks-business' ? (
                    <>
                      <option value="Audit & Tax (FIN-PRO)">{t('appStorageDetails.businessCategories.auditAndTax')}</option>
                      <option value="Sales & Purchases">{t('appStorageDetails.businessCategories.salesAndPurchases')}</option>
                      <option value="Expenses">{t('appStorageDetails.businessCategories.expenses')}</option>
                      <option value="HR & Payroll">{t('appStorageDetails.businessCategories.hrAndPayroll')}</option>
                      <option value="Inventory & Media">{t('appStorageDetails.businessCategories.inventoryAndMedia')}</option>
                    </>
                  ) : (
                    <>
                      <option value="Document">{t('drawer.document', 'Document')}</option>
                      <option value="Database">{t('drawer.dbBackup', 'Database Backup')}</option>
                      <option value="Logs">{t('drawer.logsRecords', 'Logs / Records')}</option>
                      <option value="Attachment">{t('drawer.attachmentFile', 'Attachment File')}</option>
                      <option value="Images">Images</option>
                      <option value="Videos">Videos</option>
                      <option value="Audio">Audio</option>
                    </>
                  )}
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

            {uploadSuccess && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                color: '#10b981', 
                fontSize: '0.75rem', 
                background: 'rgba(16, 185, 129, 0.1)', 
                padding: '0.5rem', 
                borderRadius: '6px' 
              }}>
                <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
                <span>{uploadSuccess}</span>
              </div>
            )}

            <button type="submit" className="btn-primary" style={{ marginTop: '0.25rem' }}>
              Add File
            </button>
          </form>
        </div>

        {/* Maintenance Actions */}
        <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ fontSize: '0.95rem', marginBottom: '1rem' }}>
            <Sparkles size={16} style={{ color: 'var(--accent-cyan)' }} />
            {t('drawer.cleanupPolicies')}
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
              {t('drawer.purgeCaches')}
            </button>
            <button 
              type="button" 
              className="icon-btn" 
              onClick={() => onCompressLogs(id)}
              style={{ width: '100%', fontSize: '0.75rem', gap: '0.35rem', padding: '0.65rem 0.5rem' }}
              title="Compresses log files (reducing their sizes by half)"
            >
              <FolderArchive size={14} />
              {t('drawer.compressLogs')}
            </button>
          </div>
        </div>

        {/* File inventory list */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 className="card-title" style={{ fontSize: '0.95rem', margin: 0 }}>
              {t('drawer.storageInventory')}
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {files.length} {files.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder={t('drawer.searchPlaceholder')}
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
                <FileText size={32} style={{ opacity: 0.5, margin: '0 auto 0.5rem auto' }} />
                <div>{searchTerm ? t('drawer.noFilesFound') : 'No files stored in this app yet.'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Upload a file above to add storage usage in real time.
                </div>
              </div>
            ) : (
              filteredFiles.map((file) => (
                <div className="file-item" key={file.id}>
                  <div className="file-item-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-meta">
                      {t('drawer.fileMeta', { type: file.type || 'File', size: formatSize(file.size), time: file.time || 'Just now' })}
                    </span>
                  </div>
                  <button 
                    className="btn-danger-outline"
                    onClick={() => onDeleteFile(id, file.id, file.name, file.size)}
                    title="Move to Recycle Bin"
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
