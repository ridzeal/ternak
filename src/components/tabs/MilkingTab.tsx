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
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2>Rekaman Pemerahan</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--fs-lg)', color: '#8a7d6b', marginTop: 3 }}>Log produksi per sesi</p>
        </div>
        <Button onClick={onAddMilking}>+ Catat Sesi</Button>
      </div>

      <div style={{
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
    </div>
  );
}
