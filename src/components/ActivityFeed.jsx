import React from 'react';
import { Activity, Mail, LayoutGrid, Briefcase, HelpCircle, ArrowRight } from 'lucide-react';

export default function ActivityFeed({ activities, onViewActivity }) {
  // Map icons
  const getAppIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('mail')) {
      return <Mail size={12} />;
    } else if (lower.includes('business')) {
      return <Briefcase size={12} />;
    } else if (lower.includes('cliks')) {
      return <LayoutGrid size={12} />;
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

  return (
    <div className="glass-card activity-card" style={{ height: '100%' }}>
      <div className="card-title" style={{ justifyContent: 'space-between', alignItems: 'center', border: 'none', padding: 0, marginBottom: '0.75rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} style={{ color: 'var(--accent-blue)' }} />
          Recent Storage Activity
        </span>
      </div>

      <div style={{ flexGrow: 1, overflowX: 'auto' }}>
        <table className="activity-table">
          <thead>
            <tr>
              <th className="activity-th">Application</th>
              <th className="activity-th">Activity</th>
              <th className="activity-th">File / Details</th>
              <th className="activity-th" style={{ textAlign: 'left' }}>Change</th>
              <th className="activity-th" style={{ textAlign: 'left' }}>Time</th>
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
                    <span className="activity-td-desc">{parsed.activity}</span>
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
          View All Activity <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
