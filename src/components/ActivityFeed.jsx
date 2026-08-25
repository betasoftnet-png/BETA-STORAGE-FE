import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, Mail, LayoutGrid, Briefcase, HelpCircle, ArrowRight } from 'lucide-react';

export default function ActivityFeed({ activities, onViewActivity }) {
  const { t } = useTranslation();

  // Map icons
  const getAppIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('mail')) {
      return <img src="/bnx_mail_logo.png" alt="BNX Mail" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />;
    } else if (lower.includes('business')) {
      return <img src="/cliks_business_logo.png" alt="Cliks Business" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />;
    } else if (lower.includes('cliks')) {
      return <img src="/cliks_logo.png" alt="Cliks" style={{ width: '14px', height: '14px', objectFit: 'contain' }} />;
    }
    return <HelpCircle size={12} />;
  };

  // Parser to separate activity description from file details
  const parseDescription = (desc) => {
    if (desc.includes(':')) {
      const parts = desc.split(':');
      return {
        activity: parts[0].trim(),
        detail: parts.slice(1).join(':').trim()
      };
    }
    return {
      activity: desc,
      detail: '--'
    };
  };

  // Translate action words in the feed
  const getActivityLabel = (act) => {
    const lower = act.toLowerCase();
    if (lower.includes('upload')) return t('appStorageDetails.uploaded');
    if (lower.includes('delet')) return t('common.delete');
    if (lower.includes('restor')) return t('common.restore');
    return act;
  };

  return (
    <div className="glass-card activity-card" style={{ height: '100%' }}>
      <div className="card-title" style={{ justifyContent: 'space-between', alignItems: 'center', border: 'none', padding: 0, marginBottom: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} style={{ color: 'var(--accent-blue)' }} />
          {t('activity.title')}
        </span>
      </div>

      <div style={{ flexGrow: 1, overflowX: 'auto' }}>
        <table className="activity-table">
          <thead>
            <tr>
              <th className="activity-th">{t('activity.app')}</th>
              <th className="activity-th">{t('activity.act')}</th>
              <th className="activity-th">{t('activity.details')}</th>
              <th className="activity-th" style={{ textAlign: 'left' }}>{t('activity.change')}</th>
              <th className="activity-th" style={{ textAlign: 'left' }}>{t('activity.time')}</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((activity, index) => {
              const isPositive = activity.diff.startsWith('+');
              const diffColor = isPositive ? '#2563eb' : '#ef4444'; // blue for +, red for -
              const parsed = parseDescription(activity.description);

              return (
                <tr className="activity-tr" key={index}>
                  {/* Application */}
                  <td className="activity-td" style={{ minWidth: '150px' }}>
                    <div className="activity-td-app">
                      <div 
                        className="activity-app-icon"
                        style={{ 
                          backgroundColor: `rgba(${activity.colorTheme}, 0.1)`, 
                          color: `rgb(${activity.colorTheme})` 
                        }}
                      >
                        {getAppIcon(activity.appName)}
                      </div>
                      <span className="activity-app-name">
                        {activity.appName}
                      </span>
                    </div>
                  </td>

                  {/* Activity */}
                  <td className="activity-td" style={{ minWidth: '140px' }}>
                    <span className="activity-td-desc">{getActivityLabel(parsed.activity)}</span>
                  </td>

                  {/* File / Details */}
                  <td className="activity-td" style={{ minWidth: '180px' }}>
                    <span className="activity-td-file">{parsed.detail}</span>
                  </td>

                  {/* Change */}
                  <td className="activity-td activity-td-diff" style={{ color: diffColor, width: '100px' }}>
                    {activity.diff}
                  </td>

                  {/* Time */}
                  <td className="activity-td activity-td-time" style={{ width: '90px' }}>
                    {activity.time}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1rem', marginTop: '1rem' }}>
        <button 
          onClick={onViewActivity}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-blue)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
          className="app-card-link"
        >
          {t('activity.viewAll')} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
