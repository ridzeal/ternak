'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { eventIcon } from '@/styles/theme';
import { todayStr } from '@/lib/utils';
import { FarmEvent } from '@/types';

interface EventsTabProps {
  onAddEvent: () => void;
  onEditEvent: (event: FarmEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export function EventsTab({ onAddEvent, onEditEvent, onDeleteEvent }: EventsTabProps) {
  const { events } = useFarm();

  return (
    <div className="fade" style={{ width: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Catatan Kegiatan</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--fs-lg)', color: '#8a7d6b', marginTop: 3 }}>Kegiatan kesehatan, pengawinan, dan peternakan</p>
        </div>
        <Button onClick={onAddEvent}>+ Catat Kegiatan</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {events.map(ev => {
          const followUp = ev.followUp && ev.followUp !== '-' && ev.followUp < todayStr();
          const overdue = followUp;

          return (
            <div
              key={ev.id}
              className="event-card"
              style={{
                background: '#faf6ee',
                borderRadius: 14,
                border: '1px solid #e0d4c0',
                borderLeft: overdue ? '4px solid #c0392b' : '4px solid #e0d4c0',
                padding: '22px 20px',
                display: 'grid',
                gridTemplateColumns: '42px 1fr auto auto',
                gap: 14,
                alignItems: 'flex-start'
              }}
            >
              <div className="event-icon" style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: '#f0e4d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #e0d0b8',
                flexShrink: 0
              }}>
                {eventIcon[ev.type] || '📋'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginBottom: 5
                }}>
                  <span className="event-title">{ev.cowName}</span>
                  <span className="event-type" style={{
                    background: '#f0e4d0',
                    color: '#7a5a3a',
                    border: '1px solid #e0d0b8',
                    padding: '5px 16px',
                    borderRadius: 100,
                    fontFamily: 'monospace'
                  }}>
                    {ev.type}
                  </span>
                  <span className="event-date">{ev.date}</span>
                </div>
                <div className="event-desc">{ev.description}</div>
                {ev.vet !== '-' && (
                  <div className="event-vet">👨‍⚕️ {ev.vet}</div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {ev.followUp && ev.followUp !== '-' && (
                  <div className="event-followup" style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    background: overdue ? '#fdecea' : '#f0e8da',
                    color: overdue ? '#c0392b' : '#8a7d6b',
                    border: `1px solid ${overdue ? '#f1a1a1' : '#e0d4c0'}`
                  }}>
                    {overdue ? '⚠️ ' : '📅 '}Tindak lanjut: {ev.followUp}
                  </div>
                )}
                <div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-md)', color: '#c0b0a0', marginTop: 4 }}>
                  {ev.id}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Button
                  variant="secondary"
                  onClick={() => onEditEvent(ev)}
                  style={{ padding: '6px 12px', fontSize: 'var(--fs-sm)' }}
                >
                  ✏️
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDeleteEvent(ev.id)}
                  style={{ padding: '6px 12px', fontSize: 'var(--fs-sm)', color: '#c0392b' }}
                >
                  🗑️
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Card View - Simplified */}
      <div className="mobile-card" style={{ display: 'none', width: '100%', overflowX: 'hidden' }}>
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
                padding: 16,
                width: '100%'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div className="event-icon" style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#f0e4d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #e0d0b8',
                  flexShrink: 0
                }}>
                  {eventIcon[ev.type] || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="event-title" style={{ wordBreak: 'break-word' }}>{ev.cowName}</div>
                  <div style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', marginTop: 2 }}>{ev.date}</div>
                </div>
              </div>
              <div style={{
                background: '#f0e4d0',
                color: '#7a5a3a',
                border: '1px solid #e0d0b8',
                padding: '5px 16px',
                borderRadius: 100,
                fontFamily: 'monospace',
                fontSize: 'var(--fs-sm)',
                display: 'inline-block',
                marginBottom: 8,
                maxWidth: '100%',
                wordBreak: 'break-word'
              }}>
                {ev.type}
              </div>
              <div className="event-desc" style={{ marginBottom: 8, wordBreak: 'break-word' }}>{ev.description}</div>
              {ev.vet !== '-' && (
                <div className="event-vet" style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', marginBottom: 8, wordBreak: 'break-word' }}>👨‍⚕️ {ev.vet}</div>
              )}
              {ev.followUp && ev.followUp !== '-' && (
                <div style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  fontFamily: 'monospace',
                  background: overdue ? '#fdecea' : '#f0e8da',
                  color: overdue ? '#c0392b' : '#8a7d6b',
                  border: `1px solid ${overdue ? '#f1a1a1' : '#e0d4c0'}`,
                  fontSize: 'var(--fs-sm)',
                  marginBottom: 12,
                  wordBreak: 'break-word'
                }}>
                  {overdue ? '⚠️ ' : '📅 '}Tindak lanjut: {ev.followUp}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  variant="secondary"
                  onClick={() => onEditEvent(ev)}
                  style={{ flex: 1, padding: '12px', fontSize: 'var(--fs-md)' }}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDeleteEvent(ev.id)}
                  style={{ padding: '12px 16px', fontSize: 'var(--fs-md)', color: '#c0392b' }}
                >
                  🗑️
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
