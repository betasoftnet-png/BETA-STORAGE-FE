import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Server, Mail, Layers, Briefcase, Save, RefreshCw, ExternalLink } from 'lucide-react';

export default function ManageAppsView({
  totalPoolMB = 5120,
  apps = [],
  onResizePool,
  onUpdateAllocation,
  onSaveSuccess
}) {
  const { t } = useTranslation();

  // Manage Apps States
  const [poolGB, setPoolGB] = useState(() => Math.round(totalPoolMB / 1024));
  const [appAllocations, setAppAllocations] = useState(() => {
    const allocations = {};
    apps.forEach(app => {
      allocations[app.id] = Math.round(app.allocatedMB / 1024);
    });
    return allocations;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Preferences saved successfully');
  const [showStatus, setShowStatus] = useState(true);

  // Keep state synced with props
  useEffect(() => {
    setPoolGB(Math.round(totalPoolMB / 1024));
    const allocations = {};
    apps.forEach(app => {
      allocations[app.id] = Math.round(app.allocatedMB / 1024);
    });
    setAppAllocations(allocations);
  }, [totalPoolMB, apps]);

  const totalAllocatedGB = Object.values(appAllocations).reduce((sum, val) => sum + val, 0);
  const unallocatedGB = Math.max(0, poolGB - totalAllocatedGB);

  const handleAllocationChange = (appId, newLimitGB) => {
    const val = Math.max(1, parseInt(newLimitGB) || 1);
    setAppAllocations(prev => ({
      ...prev,
      [appId]: val
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      if (onResizePool) {
        onResizePool(poolGB * 1024);
      }
      if (onUpdateAllocation) {
        Object.entries(appAllocations).forEach(([appId, limitGB]) => {
          onUpdateAllocation(appId, limitGB * 1024);
        });
      }
      setIsSaving(false);
      setStatusMessage('Preferences saved successfully');
      setShowStatus(true);
      if (onSaveSuccess) onSaveSuccess();
    }, 600);
  };



  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', width: '100%', maxWidth: '1100px', margin: '0 auto', padding: '0.5rem 1rem 2rem 1rem' }}>
      {/* HEADER SECTION */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 850, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
          Manage Apps
        </h1>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '0.25rem', marginBottom: '0.4rem' }}>
          Manage storage boundaries and partition sizing limits
        </p>
        
        {showStatus && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, color: '#10b981' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* CAPACITY POOL CARD */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(248, 250, 252, 0.95)',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.75rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2563eb'
          }}>
            <Server size={22} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Total Capacity Pool Size (GB)
            </label>
            <input
              type="number"
              min={Math.max(1, Math.ceil(totalAllocatedGB))}
              value={poolGB}
              onChange={(e) => setPoolGB(Math.max(1, parseInt(e.target.value) || 1))}
              style={{
                width: '120px',
                padding: '0.45rem 0.75rem',
                fontSize: '1rem',
                fontWeight: 700,
                color: '#1e293b',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600, display: 'block' }}>
            Unallocated Space:
          </span>
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '0.1rem', display: 'block' }}>
            {unallocatedGB} GB
          </span>
        </div>
      </div>

      {/* CONNECTED APP ALLOCATION LIMITS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
        {/* Section Heading Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e293b', whiteSpace: 'nowrap' }}>
            Connected App Allocation Limits
          </span>
          <div style={{ height: '1px', backgroundColor: '#e2e8f0', flex: 1 }} />
        </div>

        {/* 3 APP CARDS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {apps.map((app) => {
            const currentUsedMB = app.files.reduce((acc, f) => acc + f.size, 0);
            const currentLimitGB = appAllocations[app.id] || Math.round(app.allocatedMB / 1024);
            const currentUsedGB = currentUsedMB / 1024;
            const appPercent = currentLimitGB > 0 ? Math.round((currentUsedGB / currentLimitGB) * 100) : 0;
            
            const isPurple = app.id === 'cliks-business';
            const themeColor = isPurple ? '#8b5cf6' : '#2563eb';
            const trackColor = isPurple ? '#ede9fe' : '#dbeafe';
            const iconBg = isPurple ? 'rgba(139, 92, 246, 0.12)' : 'rgba(37, 99, 235, 0.12)';

            const minSliderGB = Math.max(1, Math.ceil(currentUsedGB));
            const maxSliderGB = Math.max(minSliderGB, poolGB - (totalAllocatedGB - currentLimitGB));

            // Render matching icon from public directory
            const getAppIcon = () => {
              if (app.id === 'bnx-mail') {
                return <img src="/bnx_mail_logo.png" alt="BNX Mail" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />;
              }
              if (app.id === 'cliks') {
                return <img src="/cliks_logo.png" alt="Cliks" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />;
              }
              if (app.id === 'cliks-business') {
                return <img src="/cliks_business_logo.png" alt="Cliks Business" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />;
              }
              return <Briefcase size={18} style={{ color: '#8b5cf6' }} />;
            };

            // External links matching user request
            const getAppUrl = () => {
              if (app.id === 'bnx-mail') return 'https://bnxmail.com/';
              if (app.id === 'cliks') return 'https://cliks.beta-softnet.com/';
              if (app.id === 'cliks-business') return 'https://cliksbusiness.com/';
              return '#';
            };

            return (
              <a
                key={app.id}
                href={getAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.03)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                {/* Icon Badge & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    backgroundColor: iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getAppIcon()}
                  </div>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    {app.name}
                  </span>
                </div>

                <ExternalLink size={16} style={{ color: '#94a3b8' }} />
              </a>
            );
          })}
        </div>
      </div>

      {/* FOOTER ACTION BUTTON */}
      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.75rem 1.6rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
              transition: 'background-color 0.2s ease, transform 0.1s ease'
            }}
          >
            {isSaving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
            <span>Save Changes</span>
          </button>
        </div>
    </div>
  );
}
