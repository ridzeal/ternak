'use client';

import React from 'react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { key: string; label: string; count: number }[];
}

export function Navigation({ activeTab, onTabChange, tabs }: NavigationProps) {
  return (
    <div style={{ background: '#2e2416', padding: '0 28px' }}>
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
          <span style={{ fontSize: 20 }}>🐄</span>
          <div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 9,
                letterSpacing: '0.2em',
                color: '#7a6a52',
                textTransform: 'uppercase',
              }}
            >
              Ranch OS
            </div>
            <div
              style={{
                fontFamily: 'Georgia, serif',
                fontWeight: 'bold',
                fontSize: 14,
                color: '#f5f0e8',
              }}
            >
              Cattle Farm Manager
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => onTabChange(t.key)}
              style={{
                background: activeTab === t.key ? '#f5f0e8' : 'transparent',
                color: activeTab === t.key ? '#2e2416' : '#9a8a72',
                border: 'none',
                padding: '7px 16px',
                borderRadius: 100,
                fontFamily: 'monospace',
                fontSize: 11,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {t.label} <span style={{ opacity: 0.5, fontSize: 10 }}>({t.count})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
