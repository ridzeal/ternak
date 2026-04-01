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

      {/* Desktop Table */}
      <div className="mobile-hide" style={{
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 120px 100px 1fr 1fr 80px',
          gap: 14,
          padding: '18px 20px',
          borderBottom: '1.5px solid #e8e0d4'
        }}>
          {['', 'Sapi', 'Jenis', 'Tanggal', 'Tindak Lanjut', 'Catatan', 'Aksi'].map((h, i) => (
            <div key={i} className="table-header">{h}</div>
          ))}
        </div>
        {events.map((ev, i) => {
          const followUp = ev.followUp && ev.followUp !== '-' && ev.followUp < todayStr();
          const overdue = followUp;

          return (
            <div
              key={ev.id}
              className="row table-padding"
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 120px 100px 1fr 1fr 80px',
                gap: 14,
                alignItems: 'center',
                borderBottom: i < events.length - 1 ? '1px solid #ede7dc' : 'none'
              }}
            >
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: '#f0e4d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                border: '1.5px solid #e0d0b8'
              }}>
                {eventIcon[ev.type] || '📋'}
              </div>
              <div>
                <div className="table-cell-bold">{ev.cowName}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-md)', color: '#8a7d6b', marginTop: 2 }}>
                  {ev.id}
                </div>
              </div>
              <div>
                <span className="event-type" style={{
                  background: '#f0e4d0',
                  color: '#7a5a3a',
                  border: '1px solid #e0d0b8',
                  padding: '5px 16px',
                  borderRadius: 100,
                  fontFamily: 'monospace',
                  fontSize: 'var(--fs-sm)'
                }}>
                  {ev.type}
                </span>
              </div>
              <div className="table-cell">{ev.date}</div>
              <div>
                {ev.followUp && ev.followUp !== '-' ? (
                  <div className="event-followup" style={{
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                    background: overdue ? '#fdecea' : '#f0e8da',
                    color: overdue ? '#c0392b' : '#8a7d6b',
                    border: `1px solid ${overdue ? '#f1a1a1' : '#e0d4c0'}`,
                    fontSize: 'var(--fs-sm)'
                  }}>
                    {overdue ? '⚠️ ' : '📅 '}{ev.followUp}
                  </div>
                ) : (
                  <span className="table-cell" style={{ color: '#a0a0a0' }}>—</span>
                )}
              </div>
              <div className="table-cell" style={{ fontStyle: 'italic' }}>{ev.description}</div>
              <div style={{ display: 'flex', gap: 6 }}>
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

      {/* Mobile Card View */}
      <div className="mobile-card" style={{ display: 'none', width: '100%', overflowX: 'hidden' }}>
        {events.map((ev) => {
          const followUp = ev.followUp && ev.followUp !== '-' && ev.followUp < todayStr();
          const overdue = followUp;

          return (
            <div
              key={ev.id}
              className="mobile-card-item"
            >
              {/* Header with icon and title */}
              <div className="mobile-card-header">
                <div className="mobile-card-icon">
                  {eventIcon[ev.type] || '📋'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mobile-card-title" style={{ wordBreak: 'break-word' }}>{ev.cowName}</div>
                  <div className="mobile-card-subtitle">{ev.id}</div>
                </div>
              </div>

              {/* Type badge */}
              <span className="event-type" style={{
                background: '#f0e4d0',
                color: '#7a5a3a',
                border: '1px solid #e0d0b8',
                padding: '5px 14px',
                borderRadius: 100,
                fontFamily: 'monospace',
                fontSize: 'var(--fs-xs)',
                display: 'inline-block',
                marginBottom: 10
              }}>
                {ev.type}
              </span>

              {/* Info content */}
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>TANGGAL</span>
                  {ev.date}
                </div>
                <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>TINDAK LANJUT</span>
                  {ev.followUp && ev.followUp !== '-' ? (
                    <span style={{
                      fontWeight: overdue ? 600 : 400,
                      color: overdue ? '#c0392b' : '#5a4a3a'
                    }}>
                      {overdue ? '⚠️ ' : '📅 '}{ev.followUp}
                    </span>
                  ) : (
                    <span style={{ color: '#a0a0a0' }}>—</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{
                fontSize: 'var(--fs-md)',
                color: '#3a2e20',
                marginBottom: 10,
                wordBreak: 'break-word',
                lineHeight: 1.4,
                fontStyle: 'italic'
              }}>
                {ev.description}
              </div>

              {/* Vet info */}
              {ev.vet !== '-' && (
                <div style={{
                  fontSize: 'var(--fs-sm)',
                  color: '#8a7d6b',
                  marginBottom: 10,
                  padding: '8px 12px',
                  background: '#f5f0e8',
                  borderRadius: 6,
                  wordBreak: 'break-word'
                }}>
                  👨‍⚕️ {ev.vet}
                </div>
              )}

              {/* Action buttons */}
              <div className="mobile-card-actions" style={{ marginTop: 12 }}>
                <Button
                  variant="secondary"
                  onClick={() => onEditEvent(ev)}
                  className="mobile-card-btn"
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => onDeleteEvent(ev.id)}
                  className="mobile-card-btn-icon"
                  style={{ color: '#c0392b' }}
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
