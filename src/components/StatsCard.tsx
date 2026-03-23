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
        <span style={{ fontSize: 24 }}>{icon}</span>
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontFamily: 'monospace',
              fontWeight: 'bold',
              fontSize: 22,
              color: warn ? '#c0392b' : '#2e2416',
            }}
          >
            {value}
          </div>
          <div
            style={{
              fontFamily: 'monospace',
              fontSize: 9,
              color: '#8a7d6b',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
        </div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#b0a090', marginTop: 8 }}>
        {sub}
      </div>
    </div>
  );
}
