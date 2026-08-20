import React from 'react';
import { Activity, ExternalLink } from 'lucide-react';

export default function ActivityFeed({ activities, onViewActivity }) {
  return (
    <div className="glass-card activity-card">
      <div className="card-title">
        <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
        STORAGE ACTIVITY
      </div>
      
      <div className="activity-list">
        {activities.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 0', fontSize: '0.8rem' }}>
            No recent activity recorded.
          </div>
        ) : (
          activities.map((activity, index) => {
            const isPositive = activity.diff.startsWith('+');
            const diffClass = isPositive ? 'activity-diff positive' : 'activity-diff negative';
            
            return (
              <div className="activity-item" key={index}>
                <div className="activity-left">
                  <span 
                    className="activity-dot" 
                    style={{ backgroundColor: `rgb(${activity.colorTheme})` }} 
                  />
                  <span className="activity-app-name" style={{ color: `rgb(${activity.colorTheme})` }}>
                    {activity.appName}
                  </span>
                  <span className="activity-desc">{activity.description}</span>
                </div>
                
                <div className="activity-right">
                  <span className={diffClass}>{activity.diff}</span>
                  <span className="activity-time">{activity.time}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
        <button 
          onClick={onViewActivity}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-cyan)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.85rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            transition: 'var(--transition-smooth)'
          }}
          className="app-action-link"
        >
          View activity <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
