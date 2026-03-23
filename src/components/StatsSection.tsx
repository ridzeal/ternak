'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { StatsCard } from '@/components/StatsCard';

export function StatsSection() {
  const { stats } = useFarm();

  const statsData = [
    { icon: '🐄', label: 'Total Herd', value: stats.totalHerd, sub: `${stats.femaleCount} females` },
    { icon: '🥛', label: 'Lactating', value: stats.lactatingCount, sub: 'active producers' },
    { icon: '🧴', label: 'Total Milk (L)', value: stats.totalMilk.toFixed(1), sub: `${stats.milkingSessions} sessions` },
    { icon: '⚠️', label: 'Follow-ups Due', value: stats.overdueCount, sub: 'need attention', warn: stats.overdueCount > 0 },
  ];

  return (
    <div 
      className="fade" 
      style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: 12, 
        marginBottom: 24 
      }}
    >
      {statsData.map((s, i) => (
        <StatsCard 
          key={i} 
          icon={s.icon} 
          label={s.label} 
          value={s.value} 
          sub={s.sub} 
          warn={s.warn} 
        />
      ))}
    </div>
  );
}
