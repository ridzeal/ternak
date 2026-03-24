'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { statusStyle } from '@/styles/theme';
import { Cow } from '@/types';

interface HerdTabProps {
  onAddCow: () => void;
  onEditCow: (cow: Cow) => void;
  onDeleteCow: (cow: Cow) => void;
}

export function HerdTab({ onAddCow, onEditCow, onDeleteCow }: HerdTabProps) {
  const { cows } = useFarm();

  return (
    <div className="fade" style={{ width: '100%', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2>Registri Ternak</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 'var(--fs-lg)', color: '#8a7d6b', marginTop: 3 }}>Semua sapi yang terdaftar</p>
        </div>
        <Button onClick={onAddCow}>+ Daftarkan Sapi</Button>
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
          gridTemplateColumns: '44px 1fr 150px 100px 90px 110px 80px',
          gap: 14,
          padding: '18px 20px',
          borderBottom: '1.5px solid #e8e0d4'
        }}>
          {['', 'Sapi', 'Jenis', 'Lahir', 'Berat', 'Status', 'Aksi'].map((h, i) => (
            <div key={i} className="table-header">{h}</div>
          ))}
        </div>
        {cows.map((cow, i) => (
          <div
            key={cow.id}
            className="row table-padding"
            style={{
              display: 'grid',
              gridTemplateColumns: '44px 1fr 150px 100px 90px 110px 80px',
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
            <div style={{ display: 'flex', gap: 6 }}>
              <Button
                variant="secondary"
                onClick={() => onEditCow(cow)}
                style={{ padding: '6px 12px', fontSize: 'var(--fs-sm)' }}
              >
                ✏️
              </Button>
              <Button
                variant="secondary"
                onClick={() => onDeleteCow(cow)}
                style={{ padding: '6px 12px', fontSize: 'var(--fs-sm)', color: '#c0392b' }}
              >
                🗑️
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Card View */}
      <div className="mobile-card" style={{ display: 'none', width: '100%', overflowX: 'hidden' }}>
        {cows.map((cow) => (
          <div
            key={cow.id}
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
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: '#f0e4d0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  border: '1.5px solid #e0d0b8',
                  flexShrink: 0
                }}>
                  {cow.gender === 'Betina' ? '🐄' : '🐂'}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="table-cell-bold" style={{ wordBreak: 'break-word' }}>{cow.name}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-sm)', color: '#8a7d6b', marginTop: 2, wordBreak: 'break-all' }}>
                    {cow.id} · {cow.tag}
                  </div>
                </div>
              </div>
              <span className="status-badge" style={statusStyle[cow.status]}>{cow.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Jenis</div>
                <div style={{ fontSize: 'var(--fs-md)', wordBreak: 'break-word' }}>{cow.breed}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Lahir</div>
                <div style={{ fontSize: 'var(--fs-md)' }}>{cow.dob}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Berat</div>
                <div style={{ fontSize: 'var(--fs-md)' }}>{cow.weight} kg</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 'var(--fs-xs)', color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gender</div>
                <div style={{ fontSize: 'var(--fs-md)' }}>{cow.gender}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button
                variant="secondary"
                onClick={() => onEditCow(cow)}
                style={{ flex: 1, padding: '12px', fontSize: 'var(--fs-md)' }}
              >
                ✏️ Edit
              </Button>
              <Button
                variant="secondary"
                onClick={() => onDeleteCow(cow)}
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
