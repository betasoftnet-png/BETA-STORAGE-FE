import React from 'react';
import {
  ChevronRight, RefreshCw, Mail, Paperclip, Trash2,
  Send, FileText, Folder, Info, ChevronLeft, HelpCircle,
  LayoutGrid, Briefcase, Scale, Receipt, CreditCard, Users, Image
} from 'lucide-react';

export default function AppStorageDetails({ app, onBack, onManage, lastUpdated, isRefreshing, onRefresh }) {
  const { id, name, category, allocatedMB, files, colorTheme } = app;

  // Calculate used storage
  const usedMB = files.reduce((acc, f) => acc + f.size, 0);
  const usedPercent = allocatedMB > 0 ? Math.min(100, Math.round((usedMB / allocatedMB) * 100)) : 0;
  const freeMB = Math.max(0, allocatedMB - usedMB);

  // Dynamic formatting helpers
  const formatSize = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`;
  };

  const usedText = formatSize(usedMB);
  const freeText = formatSize(freeMB);
  const allocatedText = allocatedMB >= 1024 ? `${(allocatedMB / 1024).toFixed(0)} GB` : `${allocatedMB} MB`;

  // Health evaluations
  const isCritical = usedPercent >= 90;
  const isWarning = usedPercent >= 75 && usedPercent < 90;
  const healthStatus = isCritical ? 'Critical' : isWarning ? 'Warning' : 'Healthy';
  const healthDesc = isCritical
    ? 'Storage critically full. Action required.'
    : isWarning
      ? 'Storage space running low.'
      : 'Plenty of space available';
  const healthColor = isCritical ? 'var(--color-critical)' : isWarning ? 'var(--color-warning)' : 'var(--color-healthy)';

  // Category Configuration maps dynamically depending on the active app
  const getCategoryBreakdown = () => {
    if (id === 'bnx-mail') {
      const catMap = {
        Emails: { size: 0, color: '#2563eb', icon: <Mail size={16} />, desc: 'Mail database archives' },
        Attachments: { size: 0, color: '#10b981', icon: <Paperclip size={16} />, desc: 'PDFs, ZIPs, Document attachments' },
        Trash: { size: 0, color: '#8b5cf6', icon: <Trash2 size={16} />, desc: 'Spam, deleted items' },
        Sent: { size: 0, color: '#ef4444', icon: <Send size={16} />, desc: 'Sent mail documents' },
        Drafts: { size: 0, color: '#f59e0b', icon: <FileText size={16} />, desc: 'Unsent drafts' },
        Other: { size: 0, color: '#94a3b8', icon: <Folder size={16} />, desc: 'Miscellaneous application files' }
      };
      files.forEach(f => {
        if (f.type === 'Database' || f.type === 'Email') catMap.Emails.size += f.size;
        else if (f.type === 'Attachment') catMap.Attachments.size += f.size;
        else if (f.type === 'Trash') catMap.Trash.size += f.size;
        else if (f.type === 'Sent') catMap.Sent.size += f.size;
        else if (f.type === 'Draft') catMap.Drafts.size += f.size;
        else catMap.Other.size += f.size;
      });
      return Object.keys(catMap).map(name => ({ name, ...catMap[name] }));
    } else if (id === 'cliks') {
      const catMap = {
        Designs: { size: 0, color: '#139488', icon: <LayoutGrid size={16} />, desc: 'Figma files, mockups' },
        Logs: { size: 0, color: '#94a3b8', icon: <FileText size={16} />, desc: 'Server transaction logs' },
        Workspace: { size: 0, color: '#2563eb', icon: <Folder size={16} />, desc: 'Active workspace databases' },
        Other: { size: 0, color: '#f59e0b', icon: <HelpCircle size={16} />, desc: 'Temp and cache files' }
      };
      files.forEach(f => {
        if (f.type === 'Images') catMap.Designs.size += f.size;
        else if (f.type === 'Logs') catMap.Logs.size += f.size;
        else if (f.type === 'Database') catMap.Workspace.size += f.size;
        else catMap.Other.size += f.size;
      });
      return Object.keys(catMap).map(name => ({ name, ...catMap[name] }));
    } else {
      // cliks-business
      const catMap = {
        'Audit & Tax (FIN-PRO)': { size: 0, color: '#2563eb', icon: <Scale size={16} />, desc: 'PDFs, XLS, Signed Certificates' },
        'Sales & Purchases': { size: 0, color: '#10b981', icon: <Receipt size={16} />, desc: 'PDF Invoices, Vendor Bills' },
        'Expenses': { size: 0, color: '#8b5cf6', icon: <CreditCard size={16} />, desc: 'Receipt Scans, Images' },
        'HR & Payroll': { size: 0, color: '#f59e0b', icon: <Users size={16} />, desc: 'ID Documents, Payslip PDFs' },
        'Inventory & Media': { size: 0, color: '#0ea5e9', icon: <Image size={16} />, desc: 'Product Photos, Barcodes' }
      };
      files.forEach(f => {
        if (f.type === 'Audit & Tax (FIN-PRO)') catMap['Audit & Tax (FIN-PRO)'].size += f.size;
        else if (f.type === 'Sales & Purchases') catMap['Sales & Purchases'].size += f.size;
        else if (f.type === 'Expenses') catMap['Expenses'].size += f.size;
        else if (f.type === 'HR & Payroll') catMap['HR & Payroll'].size += f.size;
        else if (f.type === 'Inventory & Media') catMap['Inventory & Media'].size += f.size;
      });
      return Object.keys(catMap).map(name => ({ name, ...catMap[name] }));
    }
  };

  const categories = getCategoryBreakdown();

  return (
    <div className="details-container">
      {/* 1. Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="crumb-link" onClick={onBack}>Storage Management</span>
        <ChevronRight size={14} className="crumb-separator" />
        <span className="crumb-active">{name}</span>
      </div>

      {/* 2. Header Title Area */}
      <div className="details-header">
        <div className="details-header-title">
          <h2>{name} Storage</h2>
          <p>Track how your {allocatedText} storage is used in {name}.</p>
        </div>
        <div className="details-header-controls">
          <div className="header-update-tag" onClick={onRefresh} style={{ cursor: 'pointer' }}>
            <span>Last updated: {lastUpdated}</span>
            <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
          </div>
        </div>
      </div>

      {/* 3. Summary Panel Card */}
      <div className="glass-card details-summary-card">
        <div className="summary-left-donut">
          <div style={{ position: 'relative', width: '110px', height: '110px' }}>
            <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={`rgb(${colorTheme})`}
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (usedPercent / 100) * 251.2}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div className="donut-inner-text">
              <span className="donut-inner-percent">{usedPercent}%</span>
              <span className="donut-inner-label">Used</span>
            </div>
          </div>
        </div>

        <div className="summary-right-metrics">
          <div className="details-metrics-grid">
            <div className="metric-col">
              <span className="val" style={{ color: `rgb(${colorTheme})` }}>{usedText}</span>
              <span className="lbl">Used</span>
            </div>
            <div className="metric-col">
              <span className="val" style={{ color: '#10b981' }}>{freeText}</span>
              <span className="lbl">Available</span>
            </div>
            <div className="metric-col">
              <span className="val">{allocatedText}</span>
              <span className="lbl">Total Allocated</span>
            </div>
            <div className="metric-col">
              <span className="val" style={{ color: healthColor, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: healthColor, display: 'inline-block' }} />
                {healthStatus}
              </span>
              <span className="lbl">{healthDesc}</span>
            </div>
          </div>

          <div className="progress-bar-wrapper">
            <div className="progress-container" style={{ height: '8px', borderRadius: '4px' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${usedPercent}%`,
                  backgroundColor: `rgb(${colorTheme})`,
                  borderRadius: '4px'
                }}
              />
            </div>
            <div className="progress-bar-label">
              You're using {usedText} of {allocatedText} storage
            </div>
          </div>
        </div>
      </div>

      {/* 4. Categorized Breakdown Card */}
      <div className="glass-card category-breakdown-card">
        <div className="category-header-row">
          <h3>Storage by Category</h3>
          {id !== 'cliks-business' && (
            <div className="category-header-labels">
              <span>Used</span>
              <span>% of {allocatedText}</span>
            </div>
          )}
        </div>

        <div className="category-list-wrapper">
          {categories.map((cat, idx) => {
            const catPercent = allocatedMB > 0 ? Math.round((cat.size / allocatedMB) * 100) : 0;

            if (id === 'cliks-business') {
              return (
                <div className="category-row-item" key={idx} style={{ justifyContent: 'space-between', padding: '0.75rem 0' }}>
                  {/* Left: Dot icon + Category Name */}
                  <div className="category-title-section" style={{ width: 'auto', flexGrow: 1 }}>
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: cat.color,
                        display: 'inline-block',
                        marginRight: '12px'
                      }}
                    />
                    <span className="category-name-lbl" style={{ fontSize: '0.9rem' }}>{cat.name}</span>
                  </div>

                  {/* Middle: Percentage badge */}
                  <div style={{ width: '120px', display: 'flex', justifyContent: 'center' }}>
                    <span
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        textAlign: 'center',
                        minWidth: '55px'
                      }}
                    >
                      {catPercent}%
                    </span>
                  </div>

                  {/* Right: Description Text */}
                  <div style={{ width: '250px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>
                    {cat.desc}
                  </div>
                </div>
              );
            }

            return (
              <div className="category-row-item" key={idx}>
                {/* Left side category title & icon */}
                <div className="category-title-section">
                  <div className="category-icon-box" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                    {cat.icon}
                  </div>
                  <span className="category-name-lbl">{cat.name}</span>
                </div>

                {/* Progress bar fill */}
                <div className="category-progress-container">
                  <div className="progress-container" style={{ height: '6px', borderRadius: '3px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${catPercent}%`,
                        backgroundColor: cat.color,
                        borderRadius: '3px'
                      }}
                    />
                  </div>
                </div>

                {/* Right side metrics & chevron */}
                <div className="category-value-section">
                  <span className="val-mb">{Math.round(cat.size)} MB</span>
                  <span className="val-pct">{catPercent}%</span>
                  <ChevronRight size={16} className="chevron-link" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Tips Info banner */}
      <div className="details-tips-banner">
        <div className="tips-message">
          <Info size={18} />
          <span>
            {id === 'bnx-mail'
              ? 'Keep your mailbox light! Review and remove large attachments or empty trash to free up more space.'
              : `Keep your storage light! Review cache logs, large attachments, or database backups inside ${name}.`
            }
          </span>
        </div>
      </div>
    </div>
  );
}
