'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { sessionStyle } from '@/styles/theme';
import { MilkingRecord } from '@/types';

interface MilkingTabProps {
  onAddMilking: () => void;
  onEditMilking: (record: MilkingRecord) => void;
  onDeleteMilking: (id: string) => void;
}

export function MilkingTab({ onAddMilking, onEditMilking, onDeleteMilking }: MilkingTabProps) {
  const { milking } = useFarm();

  return (
    <div className="fade" style={{ width: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Rekaman Pemerahan</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--fs-lg)', color: '#8a7d6b', marginTop: 3 }}>Log produksi per sesi</p>
        </div>
        <Button onClick={onAddMilking}>+ Catat Sesi</Button>
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
          gridTemplateColumns: '1fr 110px 100px 90px 70px 70px 1fr 50px',
          gap: 12,
          padding: '18px 20px',
          borderBottom: '1.5px solid #e8e0d4'
        }}>
          {['Sapi', 'Tanggal', 'Sesi', 'Volume', 'Lemak %', 'Protein %', 'Catatan', 'Aksi'].map((h, i) => (
            <div key={i} className="table-header">{h}</div>
          ))}
        </div>
        {milking.map((record, i) => (
          <div
            key={record.id}
            className="row table-padding"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 110px 100px 90px 70px 70px 1fr 50px',
              gap: 12,
              alignItems: 'center',
              borderBottom: i < milking.length - 1 ? '1px solid #ede7dc' : 'none'
            }}
          >
            <div>
              <div className="table-cell-bold">{record.cowName}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-md)', color: '#8a7d6b' }}>{record.cowId}</div>
            </div>
            <div className="table-cell">{record.date}</div>
            <div>
              <span className="session-badge" style={sessionStyle[record.session]}>{record.session}</span>
            </div>
            <div className="table-cell-bold">{record.volume}L</div>
            <div className="table-cell">{record.fat}%</div>
            <div className="table-cell">{record.protein}%</div>
            <div className="table-cell" style={{ fontStyle: 'italic' }}>{record.notes || '—'}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button
                variant="secondary"
                onClick={() => onEditMilking(record)}
                style={{ padding: '6px 10px', fontSize: 'var(--fs-sm)' }}
              >
                ✏️
              </Button>
              <Button
                variant="secondary"
                onClick={() => onDeleteMilking(record.id)}
                style={{ padding: '6px 10px', fontSize: 'var(--fs-sm)', color: '#c0392b' }}
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card" style={{ display: 'none', width: '100%', overflowX: 'hidden' }}>
        {milking.map((record) => (
          <div
            key={record.id}
            className="mobile-card-item"
          >
            {/* Header with icon and cow info */}
            <div className="mobile-card-header">
              <div className="mobile-card-icon">
                🥛
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="mobile-card-title" style={{ wordBreak: 'break-word' }}>{record.cowName}</div>
                <div className="mobile-card-subtitle">{record.cowId}</div>
              </div>
            </div>

            {/* Session badge */}
            <span className="session-badge" style={sessionStyle[record.session]}>{record.session}</span>

            {/* Info content */}
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>TANGGAL</span>
                {record.date}
              </div>
              <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>VOLUME</span>
                <span style={{ fontWeight: 600, color: '#5a4a3a' }}>{record.volume}L</span>
              </div>
              <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>LEMAK</span>
                {record.fat}%
              </div>
              <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 6 }}>PROTEIN</span>
                {record.protein}%
              </div>
            </div>

            {/* Notes if present */}
            {record.notes && (
              <div style={{
                fontSize: 'var(--fs-sm)',
                color: '#8a7d6b',
                fontStyle: 'italic',
                marginTop: 10,
                marginBottom: 12,
                padding: '8px 12px',
                background: '#f5f0e8',
                borderRadius: 6,
                wordBreak: 'break-word',
              }}>
                📝 {record.notes}
              </div>
            )}

            {/* Action buttons */}
            <div className="mobile-card-actions" style={{ marginTop: 12 }}>
              <Button
                variant="secondary"
                onClick={() => onEditMilking(record)}
                className="mobile-card-btn"
              >
                ✏️ Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => onDeleteMilking(record.id)}
                className="mobile-card-btn-icon"
                style={{ color: '#c0392b' }}
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
