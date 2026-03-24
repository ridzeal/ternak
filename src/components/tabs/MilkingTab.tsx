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
            style={{
              background: '#faf6ee',
              borderRadius: 14,
              border: '1px solid #e0d4c0',
              padding: 16,
              marginBottom: 12,
              width: '100%'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="table-cell-bold" style={{ wordBreak: 'break-word' }}>{record.cowName}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-sm)', color: '#8a7d6b' }}>{record.cowId}</div>
              </div>
              <span className="session-badge" style={sessionStyle[record.session]}>{record.session}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tanggal</div>
                <div style={{ fontSize: 'var(--fs-md)' }}>{record.date}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Volume</div>
                <div style={{ fontSize: 'var(--fs-lg)', fontWeight: 'bold' }}>{record.volume}L</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lemak</div>
                <div style={{ fontSize: 'var(--fs-md)' }}>{record.fat}%</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Protein</div>
                <div style={{ fontSize: 'var(--fs-md)' }}>{record.protein}%</div>
              </div>
            </div>
            {record.notes && (
              <div style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', fontStyle: 'italic', marginBottom: 12, padding: '8px 12px', background: '#f5f0e8', borderRadius: 8, wordBreak: 'break-word' }}>
                📝 {record.notes}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                onClick={() => onEditMilking(record)}
                style={{ flex: 1, padding: '12px', fontSize: 'var(--fs-md)' }}
              >
                ✏️ Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => onDeleteMilking(record.id)}
                style={{ padding: '12px 16px', fontSize: 'var(--fs-md)', color: '#c0392b' }}
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
