import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Trash2, Search, Check, MoreVertical } from 'lucide-react';

export default function RecycleBinView({ totalPoolMB, apps, deletedFiles, onRestoreFile, onPermanentDeleteFile, onBack }) {
  const { t } = useTranslation();
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'BNX_MAIL', 'CLIKS_BUSINESS', 'CLIKS', 'EXPIRING'
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuId, setActionMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Aggregate deleted file counts & sizes dynamically for display
  const bnxDelList = deletedFiles.filter(f => f.app === 'bnx-mail');
  const bnxCount = bnxDelList.length;
  const bnxSize = bnxDelList.reduce((sum, f) => sum + f.size, 0);

  const businessDelList = deletedFiles.filter(f => f.app === 'cliks-business');
  const businessCount = businessDelList.length;
  const businessSize = businessDelList.reduce((sum, f) => sum + f.size, 0);

  const cliksDelList = deletedFiles.filter(f => f.app === 'cliks');
  const cliksCount = cliksDelList.length;
  const cliksSize = cliksDelList.reduce((sum, f) => sum + f.size, 0);

  // Total sums
  const totalDeletedCount = deletedFiles.length;
  const totalDeletedMB = Math.round(bnxSize + businessSize + cliksSize);
  const totalCapacityGB = 5;
  const totalCapacityMB = totalCapacityGB * 1024;
  const freeGB = ((totalCapacityMB - totalDeletedMB) / 1024).toFixed(2);
  const usedPercent = Math.min(100, Math.round((totalDeletedMB / totalCapacityMB) * 100));

  // Handler to restore a file
  const handleRestore = (file) => {
    onRestoreFile(file);
    setActionMenuId(null);
    setToastMessage(t('recycleBin.restoreSuccess', { name: file.name }));
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Handler to permanently delete a file
  const handlePermanentDelete = (file) => {
    onPermanentDeleteFile(file);
    setActionMenuId(null);
    setToastMessage(t('recycleBin.deleteSuccess', { name: file.name }));
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter list
  const filteredFiles = deletedFiles.filter(file => {
    // Search filter
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.appName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.type.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'BNX_MAIL') return file.app === 'bnx-mail';
    if (activeTab === 'CLIKS_BUSINESS') return file.app === 'cliks-business';
    if (activeTab === 'CLIKS') return file.app === 'cliks';
    if (activeTab === 'EXPIRING') return file.daysRemaining <= 10;
    return true; // 'ALL'
  });

  // Pagination calculations: 3 items per page
  const itemsPerPage = 3;
  const totalItems = filteredFiles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, startIndex + itemsPerPage);

  const formatSize = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="details-container" style={{ position: 'relative' }}>
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 2000,
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          <Check size={16} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="crumb-link" onClick={onBack}>{t('appStorageDetails.breadcrumbsTitle')}</span>
        <ChevronRight size={14} className="crumb-separator" />
        <span className="crumb-active">{t('sidebar.recycleBin')}</span>
      </div>

      {/* 2. Header Area */}
      <div className="details-header" style={{ marginBottom: '1.75rem', gap: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="details-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justify: 'center', color: '#ef4444' }}>
              <Trash2 size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-main)', margin: 0 }}>{t('sidebar.recycleBin')}</h2>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('recycleBin.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input
            type="text"
            placeholder={t('recycleBin.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.25rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              color: 'var(--text-main)',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
          />
        </div>
      </div>

      {/* 3. Storage capacity gauge panel */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: '750', color: 'var(--text-dim)', letterSpacing: '0.08rem', textTransform: 'uppercase' }}>
          {t('recycleBin.title')}
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
          <span style={{ fontSize: '2.5rem', fontWeight: '800', color: '#ef4444', lineHeight: 1 }}>
            {totalDeletedMB} MB
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>{t('dashboard.used').toLowerCase()}</span>
        </div>

        {/* Custom Progress bar */}
        <div style={{ marginTop: '1.5rem' }}>
          <div className="progress-container" style={{ height: '8px', borderRadius: '4px', backgroundColor: '#f1f5f9' }}>
            <div
              className="progress-bar"
              style={{
                width: `${usedPercent}%`,
                backgroundColor: '#ef4444',
                borderRadius: '4px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <span>{totalCapacityGB} GB {t('storageUsage.allocatedSpace').toLowerCase()}</span>
            <span>{freeGB} GB {t('storageUsage.free').toLowerCase()}</span>
          </div>
        </div>
      </div>

      {/* 4. Sub-Applications Cards Grid */}
      <div style={{ marginBottom: '2.25rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: '750', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06rem', marginBottom: '1rem' }}>
          {t('dashboard.appStorage')}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {/* BNX Mail Card */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderLeft: '4px solid #2563eb'
            }}
            onClick={() => {
              setActiveTab('BNX_MAIL');
              setCurrentPage(1);
            }}
          >
            <div>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <img src="/bnx_mail_logo.png" alt="BNX Mail" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '750', color: '#0f172a', margin: '0 0 0.25rem 0' }}>BNX Mail</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                {t('recycleBin.deletedItemsCount', { count: bnxCount })}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#2563eb' }}>{Math.round(bnxSize)} MB</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('common.viewDetails')} →
              </span>
            </div>
          </div>

          {/* Cliks Business Card */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderLeft: '4px solid #8b5cf6'
            }}
            onClick={() => {
              setActiveTab('CLIKS_BUSINESS');
              setCurrentPage(1);
            }}
          >
            <div>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <img src="/cliks_business_logo.png" alt="Cliks Business" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '750', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Cliks Business</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                {t('recycleBin.deletedItemsCount', { count: businessCount })}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#8b5cf6' }}>{Math.round(businessSize)} MB</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('common.viewDetails')} →
              </span>
            </div>
          </div>

          {/* Cliks Card */}
          <div
            className="glass-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderLeft: '4px solid #0d9488'
            }}
            onClick={() => {
              setActiveTab('CLIKS');
              setCurrentPage(1);
            }}
          >
            <div>
              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <img src="/cliks_logo.png" alt="Cliks" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '750', color: '#0f172a', margin: '0 0 0.25rem 0' }}>Cliks</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>
                {t('recycleBin.deletedItemsCount', { count: cliksCount })}
              </p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0d9488' }}>{Math.round(cliksSize)} MB</span>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#0d9488', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('common.viewDetails')} →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Deleted Files List Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '750', color: 'var(--text-main)', margin: 0 }}>
            {t('recycleBin.title')}
          </h3>
          <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-dim)', letterSpacing: '0.04rem' }}>
            {t('recycleBin.itemsCount', { count: totalItems })}
          </span>
        </div>

        {/* Tab Filters Menu */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
          gap: '1.5rem',
          paddingBottom: '0.25rem'
        }}>
          {[
            { id: 'ALL', name: t('recycleBin.tabs.all') },
            { id: 'BNX_MAIL', name: 'BNX MAIL' },
            { id: 'CLIKS_BUSINESS', name: 'CLIKS BUSINESS' },
            { id: 'CLIKS', name: 'CLIKS' },
            { id: 'EXPIRING', name: t('recycleBin.tabs.expiringSoon') }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.5rem 0.5rem 0.75rem 0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  position: 'relative',
                  outline: 'none',
                  whiteSpace: 'nowrap',
                  transition: 'color 0.2s ease'
                }}
              >
                {tab.name}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: 'var(--text-main)',
                    borderRadius: '1px'
                  }} />
                )}
              </button>
            );
          })}
        </div>

        {/* File Cards Listing */}
        {paginatedFiles.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {paginatedFiles.map(file => {
              const maxRetentionDays = 30;
              const fillPercent = Math.min(100, Math.round((file.daysRemaining / maxRetentionDays) * 100));
              const isMenuOpen = actionMenuId === file.id;

              return (
                <div
                  key={file.id}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    boxShadow: 'var(--shadow-card)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    {/* Left side details */}
                    <div style={{ display: 'flex', gap: '0.85rem' }}>
                      <span style={{ fontSize: '1.85rem', lineHeight: '1' }}>{file.icon}</span>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '750', color: '#0f172a', margin: '0 0 0.15rem 0' }}>
                          {file.name}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                          <span style={{ color: file.color }}>{file.appName}</span>
                          <span>·</span>
                          <span>{file.type}</span>
                          <span>·</span>
                          <span>{file.deletedTime}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side Size */}
                    <span style={{ fontSize: '0.95rem', fontWeight: '750', color: '#0f172a' }}>
                      {formatSize(file.size)}
                    </span>
                  </div>

                  {/* Retention progress gauge */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                      <span>{t('recycleBin.retention')}</span>
                      <span style={{ color: file.daysRemaining <= 10 ? '#ef4444' : 'var(--text-muted)' }}>
                        {t('recycleBin.daysRemaining', { count: file.daysRemaining })}
                      </span>
                    </div>
                    <div className="progress-container" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#f1f5f9' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${fillPercent}%`,
                          backgroundColor: file.daysRemaining <= 10 ? '#ef4444' : file.color,
                          borderRadius: '3px',
                          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions Section */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', position: 'relative' }}>
                    <button
                      onClick={() => handleRestore(file)}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid var(--border-color)',
                        borderRadius: '6px',
                        padding: '0.45rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        color: 'var(--text-main)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        outline: 'none',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = 'var(--text-muted)';
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = 'var(--border-color)';
                        e.target.style.backgroundColor = '#ffffff';
                      }}
                    >
                      {t('common.restore')}
                    </button>

                    <div style={{ position: 'relative' }}>
                      <button
                        onClick={() => setActionMenuId(isMenuOpen ? null : file.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-dim)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {/* Dropdown Options Popup */}
                      {isMenuOpen && (
                        <>
                          <div
                            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                            onClick={() => setActionMenuId(null)}
                          />
                          <div style={{
                            position: 'absolute',
                            right: 0,
                            bottom: '100%',
                            marginBottom: '6px',
                            backgroundColor: '#ffffff',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                            padding: '4px',
                            minWidth: '150px',
                            zIndex: 11,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                          }}>
                            <button
                              onClick={() => handleRestore(file)}
                              style={{
                                border: 'none',
                                background: 'none',
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: 'var(--text-main)',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              {t('recycleBin.restore')}
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(file)}
                              style={{
                                border: 'none',
                                background: 'none',
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#ef4444',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                              {t('recycleBin.deletePermanently')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-dim)' }}>
            <Trash2 size={40} style={{ marginBottom: '0.75rem', strokeWidth: '1.5' }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: '500' }}>{t('recycleBin.noDeletedFiles')}</p>
          </div>
        )}

        {/* Footer info & Pagination */}
        {totalItems > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
              {t('recycleBin.showing', { start: startIndex + 1, end: Math.min(startIndex + itemsPerPage, totalItems), total: totalItems })}
            </span>

            {/* Pagination Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  border: '1px solid var(--border-color)',
                  background: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: currentPage === 1 ? 'var(--text-dim)' : 'var(--text-main)',
                  cursor: currentPage === 1 ? 'default' : 'pointer',
                  outline: 'none'
                }}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pNum => {
                const isCurrent = currentPage === pNum;
                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    style={{
                      border: isCurrent ? '1.5px solid var(--text-main)' : '1px solid var(--border-color)',
                      background: isCurrent ? 'var(--text-main)' : '#ffffff',
                      color: isCurrent ? '#ffffff' : 'var(--text-main)',
                      padding: '4px 10px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {pNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  border: '1px solid var(--border-color)',
                  background: '#ffffff',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  color: currentPage === totalPages ? 'var(--text-dim)' : 'var(--text-main)',
                  cursor: currentPage === totalPages ? 'default' : 'pointer',
                  outline: 'none'
                }}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
