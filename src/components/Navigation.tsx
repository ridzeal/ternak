'use client';

import React from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { key: string; label: string; count: number }[];
}

export function Navigation({ activeTab, onTabChange, tabs }: NavigationProps) {
  return (
    <div style={{ background: '#2e2416', padding: '0 16px' }}>
      <div
        style={{
          maxWidth: 1060,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 58,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="nav-icon">🐄</span>
          <div>
            <div className="nav-subtitle">Ranch OS</div>
            <div className="nav-title">Manajer Peternakan Sapi</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', maxWidth: '60%' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              className="nav-tab"
              style={{
                background: activeTab === t.key ? '#f5f0e8' : 'transparent',
                color: activeTab === t.key ? '#2e2416' : '#9a8a72',
                borderRadius: 100,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {t.label} <span className="nav-tab-count">({t.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
