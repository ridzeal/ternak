'use client';

import React from 'react';
import { useFarm } from '@/context/FarmContext';
import { StatsCard } from '@/components/StatsCard';

export function StatsSection() {
  const { stats } = useFarm();

  const statsData = [
    { icon: '🐄', label: 'Total Ternak', value: stats.totalHerd, sub: `${stats.femaleCount} betina` },
    { icon: '🥛', label: 'Sedang Laktasi', value: stats.lactatingCount, sub: 'produsen aktif' },
    { icon: '🧴', label: 'Total Susu (L)', value: stats.totalMilk.toFixed(1), sub: `${stats.milkingSessions} sesi` },
    { icon: '⚠️', label: 'Perlu Tindakan', value: stats.overdueCount, sub: 'butuh perhatian', warn: stats.overdueCount > 0 },
  ];

  return (
    <div
      className="fade stats-grid"
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
