'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { eventIcon } from '@/styles/theme';
import { todayStr } from '@/lib/utils';

interface EventsTabProps {
  onAddEvent: () => void;
}

export function EventsTab({ onAddEvent }: EventsTabProps) {
  const { events } = useFarm();

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>Event Log</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b', marginTop: 3 }}>Health, breeding and farm events</p>
        </div>
        <Button onClick={onAddEvent}>+ Log Event</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map(ev => {
          const followUp = ev.followUp && ev.followUp !== '-' && ev.followUp < todayStr();
          const overdue = followUp;
          
          return (
            <div 
              key={ev.id} 
              style={{ 
                background: '#faf6ee', 
                borderRadius: 14, 
                border: '1px solid #e0d4c0', 
                borderLeft: overdue ? '4px solid #c0392b' : '4px solid #e0d4c0', 
                padding: '16px 20px', 
                display: 'grid', 
                gridTemplateColumns: '42px 1fr auto', 
                gap: 14, 
                alignItems: 'flex-start' 
              }}
            >
              <div style={{ 
                width: 38, 
                height: 38, 
                borderRadius: 10, 
                background: '#f0e4d0', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: 20, 
                border: '1.5px solid #e0d0b8', 
                flexShrink: 0 
              }}>
                {eventIcon[ev.type] || '📋'}
              </div>
              <div>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  flexWrap: 'wrap', 
                  marginBottom: 5 
                }}>
                  <span style={{ fontWeight: 'bold', fontSize: 14 }}>{ev.cowName}</span>
                  <span style={{ 
                    background: '#f0e4d0', 
                    color: '#7a5a3a', 
                    border: '1px solid #e0d0b8', 
                    padding: '2px 9px', 
                    borderRadius: 100, 
                    fontFamily: 'monospace', 
                    fontSize: 9, 
                    letterSpacing: '0.08em' 
                  }}>
                    {ev.type}
                  </span>
                  <span style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a7d6b' }}>
                    {ev.date}
                  </span>
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a5a48' }}>
                  {ev.description}
                </div>
                {ev.vet !== '-' && (
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a7d6b', marginTop: 5 }}>
                    👨‍⚕️ {ev.vet}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {ev.followUp && ev.followUp !== '-' && (
                  <div style={{ 
                    padding: '4px 10px', 
                    borderRadius: 8, 
                    fontFamily: 'monospace', 
                    fontSize: 10, 
                    background: overdue ? '#fdecea' : '#f0e8da', 
                    color: overdue ? '#c0392b' : '#8a7d6b', 
                    border: `1px solid ${overdue ? '#f1a1a1' : '#e0d4c0'}` 
                  }}>
                    {overdue ? '⚠️ ' : '📅 '}Follow-up: {ev.followUp}
                  </div>
                )}
                <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#c0b0a0', marginTop: 4 }}>
                  {ev.id}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
