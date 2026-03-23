import React from 'react';

interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  sub: string;
  warn?: boolean;
}

export function StatsCard({ icon, label, value, sub, warn }: StatsCardProps) {
  return (
    <div
      style={{
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
        padding: '16px 18px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stats-icon">{icon}</span>
        <div style={{ textAlign: 'right' }}>
          <div
            className="stats-value"
            style={{ color: warn ? '#c0392b' : '#2e2416' }}
          >
            {value}
          </div>
          <div className="stats-label">{label}</div>
        </div>
      </div>
      <div className="stats-sub">{sub}</div>
    </div>
  );
}
