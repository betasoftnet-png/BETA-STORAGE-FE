import React, { useState } from 'react';
import { ChevronRight, Folder, Info } from 'lucide-react';

// Classification helper
export const classifyFile = (file) => {
  const name = file.name.toLowerCase();
  const type = file.type ? file.type.toLowerCase() : '';

  if (name.endsWith('.pdf') || type.includes('pdf')) {
    return 'PDFs';
  }
  if (
    name.endsWith('.docx') ||
    name.endsWith('.doc') ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls') ||
    name.endsWith('.txt') ||
    name.endsWith('.db') ||
    name.endsWith('.json') ||
    type.includes('database') ||
    type.includes('document')
  ) {
    return 'Documents';
  }
  if (
    name.endsWith('.png') ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.gif') ||
    name.endsWith('.svg') ||
    name.endsWith('.fig') ||
    type.includes('images')
  ) {
    return 'Images';
  }
  if (name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.avi') || name.endsWith('.mkv') || type.includes('videos')) {
    return 'Videos';
  }
  if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.aac') || name.endsWith('.flac') || type.includes('audio')) {
    return 'Audio';
  }
  return 'Other';
};

export default function FileCategoriesView({ totalPoolMB, apps, onBack, decimalPrecision = 2, showUsagePercent = true }) {
  const [activeTab, setActiveTab] = useState('bnx-mail');

  const activeApp = apps.find(a => a.id === activeTab) || apps[0];
  const { name, colorTheme, files } = activeApp;

  // Calculate used storage for active product
  const appUsedMB = files.reduce((sum, f) => sum + f.size, 0);
  const allocatedMB = activeApp.allocatedMB || 1024;
  const usedPercentOfAllocation = Math.min(100, Math.round((appUsedMB / allocatedMB) * 100));
  const formatCapacity = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(decimalPrecision)} GB` : `${mb.toFixed(decimalPrecision)} MB`;
  };

  // Categories template for generic products (BNX Mail, Cliks)
  const categoryTemplates = {
    Documents: { icon: '📄', color: '#2563eb' },
    PDFs: { icon: '📕', color: '#ef4444' },
    Images: { icon: '🖼', color: '#10b981' },
    Videos: { icon: '🎬', color: '#8b5cf6' },
    Audio: { icon: '🎵', color: '#f59e0b' },
    Other: { icon: '📦', color: '#64748b' }
  };

  const isCliksBusiness = activeTab === 'cliks-business';
  let categories = [];

  if (isCliksBusiness) {
    // For Cliks Business, render only the 5 business-specific categories directly
    const clbCategories = [
      { name: 'Audit & Tax (FIN-PRO)', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
      { name: 'Sales & Purchases', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
      { name: 'Expenses', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
      { name: 'HR & Payroll', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
      { name: 'Inventory & Media', color: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.08)' }
    ];

    const categorySizes = {
      'Audit & Tax (FIN-PRO)': 0,
      'Sales & Purchases': 0,
      'Expenses': 0,
      'HR & Payroll': 0,
      'Inventory & Media': 0
    };

    files.forEach(file => {
      if (categorySizes[file.type] !== undefined) {
        categorySizes[file.type] += file.size;
      }
    });

    categories = clbCategories.map(cat => {
      const size = categorySizes[cat.name];
      const percent = appUsedMB > 0 ? ((size / appUsedMB) * 100).toFixed(1) : '0.0';
      return {
        ...cat,
        size,
        percent
      };
    });
  } else {
    // Standard generic file categories (BNX Mail, Cliks)
    const categorySizes = {
      Documents: 0,
      PDFs: 0,
      Images: 0,
      Videos: 0,
      Audio: 0,
      Other: 0
    };

    files.forEach(file => {
      const category = classifyFile(file);
      if (categorySizes[category] !== undefined) {
        categorySizes[category] += file.size;
      } else {
        categorySizes.Other += file.size;
      }
    });

    categories = Object.keys(categoryTemplates).map(catName => {
      const size = categorySizes[catName];
      const percent = appUsedMB > 0 ? ((size / appUsedMB) * 100).toFixed(1) : '0.0';
      return {
        name: catName,
        size,
        percent,
        ...categoryTemplates[catName]
      };
    });
  }

  const formatSize = (mb) => {
    return mb >= 1024 ? `${(mb / 1024).toFixed(decimalPrecision)} GB` : `${mb.toFixed(decimalPrecision)} MB`;
  };

  return (
    <div className="details-container">
      {/* 1. Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="crumb-link" onClick={onBack}>Storage Management</span>
        <ChevronRight size={14} className="crumb-separator" />
        <span className="crumb-active">File Categories</span>
      </div>

      {/* 2. Header Title */}
      <div className="details-header" style={{ marginBottom: '1.5rem' }}>
        <div className="details-header-title">
          <h2>File Categories</h2>
          <p>Track storage categories separately for each product</p>
        </div>
      </div>

      {/* 3. Product Switching Tab Bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '2rem',
        paddingBottom: '0.5rem',
        gap: '2rem'
      }}>
        {apps.map(app => {
          const isActive = activeTab === app.id;
          return (
            <button
              key={app.id}
              onClick={() => setActiveTab(app.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.5rem 1rem',
                fontSize: '0.95rem',
                fontWeight: '600',
                color: isActive ? `rgb(${app.colorTheme})` : 'var(--text-muted)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'color 0.2s ease',
                outline: 'none'
              }}
            >
              {app.name}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-9px',
                  left: 0,
                  right: 0,
                  height: '3px',
                  backgroundColor: `rgb(${app.colorTheme})`,
                  borderRadius: '2px'
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Product Storage Focus Banner */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
          {name} Storage
        </h3>
        <span style={{ display: 'block', fontSize: '1.5rem', fontWeight: '800', color: `rgb(${colorTheme})`, marginTop: '0.25rem' }}>
          {formatSize(appUsedMB)} Used
        </span>

        {/* Progress Bar out of Product Capacity */}
        <div style={{ marginTop: '1.5rem' }}>
          <div className="progress-container" style={{ height: '10px', borderRadius: '5px' }}>
            <div
              className="progress-bar"
              style={{
                width: `${usedPercentOfAllocation}%`,
                backgroundColor: `rgb(${colorTheme})`,
                borderRadius: '5px'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <span>{showUsagePercent ? `${usedPercentOfAllocation}% of ` : ''}{formatCapacity(allocatedMB)} Pool</span>
            <span>Total Capacity: {formatCapacity(allocatedMB)}</span>
          </div>
        </div>
      </div>

      {/* 5. Breakdown Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '750', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
          File Categories Breakdown
        </h3>

        {activeTab === 'bnx-mail' ? (
          /* Grid Card Layout for BNX Mail */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            {categories.map(cat => {
              const fillPercent = Math.min(100, Math.round(parseFloat(cat.percent)));
              return (
                <div
                  key={cat.name}
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '140px',
                    boxShadow: 'var(--shadow-card)',
                    transition: 'all 0.2s ease'
                  }}
                  className="category-card-hover"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.75rem' }}>{cat.icon}</span>
                    <span style={{
                      backgroundColor: `${cat.color}15`,
                      color: cat.color,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: '700'
                    }}>
                      {cat.percent}%
                    </span>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {cat.name}
                    </span>
                    <span style={{ display: 'block', fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)', marginTop: '0.15rem' }}>
                      {Math.round(cat.size)} MB
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="progress-container" style={{ height: '4px', marginTop: '0.75rem', borderRadius: '2px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${fillPercent}%`,
                        backgroundColor: cat.color,
                        borderRadius: '2px'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Clean Detail Table Layout for Cliks & Cliks Business */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1.5fr',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-color)',
              fontWeight: '700',
              fontSize: '0.75rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.05rem',
              marginBottom: '0.5rem'
            }}>
              <span>CATEGORY</span>
              <span style={{ textAlign: 'center' }}>USED</span>
              <span style={{ textAlign: 'right' }}>STORAGE USED</span>
            </div>

            {/* Table Rows */}
            {categories.map(cat => {
              const hasSubs = cat.subCategories && cat.subCategories.length > 0;
              return (
                <React.Fragment key={cat.name}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1.5fr',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: '8px',
                      borderBottom: '1px solid var(--border-light)',
                      transition: 'background-color 0.2s ease'
                    }}
                    className="category-list-row-hover"
                  >
                    {/* Category Name with Dot or Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {cat.icon ? (
                        <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                      ) : (
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: cat.color,
                          display: 'inline-block',
                          boxShadow: `0 0 6px ${cat.color}40`
                        }} />
                      )}
                      <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>
                        {cat.name}
                      </span>
                    </div>

                    {/* Percentage Badge */}
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <span style={{
                        backgroundColor: cat.bg || `${cat.color}12`,
                        color: cat.color,
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        minWidth: '55px',
                        textAlign: 'center'
                      }}>
                        {cat.percent}%
                      </span>
                    </div>

                    {/* Storage Used */}
                    <div style={{ textAlign: 'right', fontSize: '0.95rem', fontWeight: '750', color: '#0f172a', paddingRight: '2rem' }}>
                      {Math.round(cat.size)} MB
                    </div>
                  </div>

                  {/* Render nested sub-categories if any */}
                  {hasSubs && cat.subCategories.map(sub => {
                    return (
                      <div
                        key={sub.name}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1.5fr',
                          alignItems: 'center',
                          padding: '0.65rem 1rem 0.65rem 2.25rem', // Indented category name
                          borderBottom: '1px solid var(--border-light)',
                          backgroundColor: 'rgba(255, 255, 255, 0.25)'
                        }}
                      >
                        {/* Sub Category Dot + Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: sub.color,
                            display: 'inline-block'
                          }} />
                          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>
                            {sub.name}
                          </span>
                        </div>

                        {/* Percentage badge (pill) */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <span style={{
                            backgroundColor: sub.bg,
                            color: sub.color,
                            padding: '3px 10px',
                            borderRadius: '10px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            minWidth: '50px',
                            textAlign: 'center'
                          }}>
                            {sub.percent}%
                          </span>
                        </div>

                        {/* Storage Used */}
                        <div style={{ textAlign: 'right', fontSize: '0.9rem', fontWeight: '700', color: '#334155', paddingRight: '2rem' }}>
                          {Math.round(sub.size)} MB
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
