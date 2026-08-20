import React from 'react';
import { GitFork } from 'lucide-react';

export default function AllocationTree({ totalPoolMB, apps, onSelectApp, onAddApp }) {
  const totalPoolGB = (totalPoolMB / 1024).toFixed(0);
  
  // Calculate total allocated
  const totalAllocatedMB = apps.reduce((acc, app) => acc + app.allocatedMB, 0);
  const remainingMB = Math.max(0, totalPoolMB - totalAllocatedMB);
  
  // Prepare branches
  const branches = [];
  
  // Active App branches
  apps.forEach(app => {
    branches.push({
      type: 'app',
      id: app.id,
      name: app.name.replace('BETA ', '').replace('BNX ', 'BNX').split(' ')[0], // short name e.g. "BNX", "CLIKS"
      fullName: app.name,
      allocatedGB: (app.allocatedMB / 1024).toFixed(0) + ' GB',
      color: app.colorTheme,
      rawMB: app.allocatedMB
    });
  });
  
  // Calculate future app branches
  // Divide remaining space into 1GB chunks, or one chunk if less
  let tempRemainingMB = remainingMB;
  while (tempRemainingMB >= 1024) {
    branches.push({
      type: 'future',
      name: 'FUTURE APP',
      allocatedGB: '1 GB',
      color: '84, 101, 126', // muted gray
      rawMB: 1024
    });
    tempRemainingMB -= 1024;
  }
  
  // If there's some odd remaining space (e.g. 500MB), show a branch for it
  if (tempRemainingMB > 0) {
    branches.push({
      type: 'future',
      name: 'FUTURE APP',
      allocatedGB: `${(tempRemainingMB / 1024).toFixed(1)} GB`,
      color: '84, 101, 126',
      rawMB: tempRemainingMB
    });
  }

  // Ensure we have at least 5 slots to look nice, adding empty placeholder future slots if needed
  while (branches.length < 5) {
    branches.push({
      type: 'future',
      name: 'FUTURE SLOT',
      allocatedGB: '1 GB',
      color: '44, 57, 83',
      rawMB: 1024
    });
  }

  return (
    <div className="glass-card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
      <div className="card-title">
        <GitFork size={18} style={{ color: 'var(--accent-cyan)', transform: 'rotate(180deg)' }} />
        STORAGE ALLOCATION
      </div>
      
      <div className="tree-container">
        <div className="tree-flow">
          {/* Root Pool Node */}
          <div className="tree-node-pool">
            <div className="pool-title">BETA STORAGE POOL</div>
            <div className="pool-size">{totalPoolGB} GB</div>
          </div>
          
          {/* Vertical Stem */}
          <div className="tree-connector-vertical" />
          
          <div className="tree-connector-horizontal-row">
            {/* Left and right masks to align horizontal bar with branches */}
            <div 
              style={{
                position: 'absolute',
                top: 0,
                left: `${50 / branches.length}%`,
                right: `${50 / branches.length}%`,
                height: '1px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }}
            />
          </div>
          
          {/* Branch Grid */}
          <div className="tree-branches-wrapper">
            {branches.map((branch, index) => {
              const flexBasis = `${100 / branches.length}%`;
              const isApp = branch.type === 'app';
              
              return (
                <div 
                  key={index} 
                  className="tree-branch" 
                  style={{ 
                    flexBasis,
                    '--border-color': isApp ? `rgba(${branch.color}, 0.3)` : 'rgba(255, 255, 255, 0.08)'
                  }}
                >
                  {/* Stem downwards */}
                  <div 
                    style={{ 
                      width: '2px', 
                      height: '24px', 
                      backgroundColor: isApp ? `rgba(${branch.color}, 0.3)` : 'rgba(255, 255, 255, 0.08)' 
                    }} 
                  />
                  
                  {/* Leaf Content */}
                  <div 
                    className="tree-leaf-node"
                    onClick={() => {
                      if (isApp) {
                        onSelectApp(branch.id);
                      } else {
                        onAddApp();
                      }
                    }}
                    style={{
                      border: isApp 
                        ? `1px solid rgba(${branch.color}, 0.4)` 
                        : '1px solid var(--border-color)',
                      background: isApp 
                        ? `rgba(${branch.color}, 0.05)` 
                        : 'rgba(255, 255, 255, 0.02)',
                      boxShadow: isApp 
                        ? `0 4px 12px rgba(${branch.color}, 0.1)` 
                        : 'none'
                    }}
                  >
                    <div 
                      className="leaf-limit" 
                      style={{ color: isApp ? `rgb(${branch.color})` : 'var(--text-muted)' }}
                    >
                      {branch.allocatedGB}
                    </div>
                    <div className="leaf-name" title={branch.fullName || branch.name}>
                      {branch.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
