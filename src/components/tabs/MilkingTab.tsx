'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { sessionStyle } from '@/styles/theme';

interface MilkingTabProps {
  onAddMilking: () => void;
}

export function MilkingTab({ onAddMilking }: MilkingTabProps) {
  const { milking } = useFarm();

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>Milking Records</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b', marginTop: 3 }}>Production log per session</p>
        </div>
        <Button onClick={onAddMilking}>+ Log Session</Button>
      </div>

      <div style={{ 
        background: '#faf6ee', 
        borderRadius: 14, 
        border: '1px solid #e0d4c0', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 110px 100px 90px 70px 70px 1fr', 
          gap: 12, 
          padding: '10px 20px', 
          borderBottom: '1.5px solid #e8e0d4' 
        }}>
          {['Cow', 'Date', 'Session', 'Volume', 'Fat %', 'Protein %', 'Notes'].map((h, i) => (
            <div 
              key={i} 
              style={{ 
                fontFamily: 'monospace', 
                fontSize: 9, 
                letterSpacing: '0.12em', 
                textTransform: 'uppercase', 
                color: '#8a7d6b' 
              }}
            >
              {h}
            </div>
          ))}
        </div>
        {milking.map((record, i) => (
          <div 
            key={record.id} 
            className="row" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 110px 100px 90px 70px 70px 1fr', 
              gap: 12, 
              padding: '13px 20px', 
              alignItems: 'center', 
              borderBottom: i < milking.length - 1 ? '1px solid #ede7dc' : 'none' 
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>{record.cowName}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a7d6b' }}>{record.cowId}</div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6a5a48' }}>{record.date}</div>
            <div>
              <span style={{ 
                ...sessionStyle[record.session], 
                display: 'inline-block', 
                padding: '3px 9px', 
                borderRadius: 100, 
                fontFamily: 'monospace', 
                fontSize: 10 
              }}>
                {record.session}
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: 14, color: '#2e2416' }}>
              {record.volume}L
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a5a48' }}>{record.fat}%</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a5a48' }}>{record.protein}%</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b', fontStyle: 'italic' }}>
              {record.notes || '—'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
