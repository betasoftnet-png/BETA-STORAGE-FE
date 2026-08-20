import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function Header({ 
  lastUpdated, 
  isRefreshing, 
  onRefresh
}) {
  return (
    <header>
      <div className="header-info">
        <h2>Storage Overview</h2>
        <p>Track and manage storage across your Beta ecosystem</p>
      </div>

      <div className="header-controls">
        {/* Refresh widget */}
        <div className="header-update-tag" onClick={onRefresh}>
          <span>Last updated: {lastUpdated}</span>
          <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
        </div>
      </div>
    </header>
  );
}
