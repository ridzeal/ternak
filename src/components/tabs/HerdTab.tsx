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
          <h2 style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>Herd Registry</h2>
          <p style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b', marginTop: 3 }}>All registered cattle</p>
        </div>
        <Button onClick={onAddCow}>+ Register Cow</Button>
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
          padding: '10px 20px', 
          borderBottom: '1.5px solid #e8e0d4' 
        }}>
          {['', 'Animal', 'Breed', 'Born', 'Weight', 'Status'].map((h, i) => (
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
        {cows.map((cow, i) => (
          <div 
            key={cow.id} 
            className="row" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: '44px 1fr 150px 100px 90px 110px', 
              gap: 14, 
              padding: '13px 20px', 
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
              fontSize: 18, 
              border: '1.5px solid #e0d0b8' 
            }}>
              {cow.gender === 'Female' ? '🐄' : '🐂'}
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14 }}>{cow.name}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#8a7d6b', marginTop: 2 }}>
                {cow.id} · {cow.tag}
              </div>
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6a5a48' }}>{cow.breed}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a7d6b' }}>{cow.dob}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#6a5a48' }}>{cow.weight} kg</div>
            <div>
              <span style={{ 
                ...statusStyle[cow.status], 
                display: 'inline-block', 
                padding: '3px 10px', 
                borderRadius: 100, 
                fontFamily: 'monospace', 
                fontSize: 10 
              }}>
                {cow.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
