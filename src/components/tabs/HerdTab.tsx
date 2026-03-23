'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { statusStyle } from '@/styles/theme';

interface HerdTabProps {
  onAddCow: () => void;
}

export function HerdTab({ onAddCow }: HerdTabProps) {
  const { cows } = useFarm();

  return (
    <div className="fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h2>Registri Ternak</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--fs-lg)', color: '#8a7d6b', marginTop: 3 }}>Semua sapi yang terdaftar</p>
        </div>
        <Button onClick={onAddCow}>+ Daftarkan Sapi</Button>
      </div>

      <div style={{
        background: '#faf6ee',
        borderRadius: 14,
        border: '1px solid #e0d4c0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '44px 1fr 150px 100px 90px 110px',
          gap: 14,
          padding: '18px 20px',
          borderBottom: '1.5px solid #e8e0d4'
        }}>
          {['', 'Sapi', 'Jenis', 'Lahir', 'Berat', 'Status'].map((h, i) => (
            <div key={i} className="table-header">{h}</div>
          ))}
        </div>
        {cows.map((cow, i) => (
          <div
            key={cow.id}
            className="row table-padding"
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 150px 100px 90px 110px',
              gap: 14,
              alignItems: 'center',
              borderBottom: i < cows.length - 1 ? '1px solid #ede7dc' : 'none'
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
              {cow.gender === 'Betina' ? '🐄' : '🐂'}
            </div>
            <div>
              <div className="table-cell-bold">{cow.name}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-md)', color: '#8a7d6b', marginTop: 2 }}>
                {cow.id} · {cow.tag}
              </div>
            </div>
            <div className="table-cell">{cow.breed}</div>
            <div className="table-cell">{cow.dob}</div>
            <div className="table-cell">{cow.weight} kg</div>
            <div>
              <span className="status-badge" style={statusStyle[cow.status]}>{cow.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
