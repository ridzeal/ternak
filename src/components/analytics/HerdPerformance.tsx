'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Cow, FarmEvent, MilkingRecord } from '@/types';

interface HerdPerformanceProps {
  onNavigate?: (page: string) => void;
}

export function HerdPerformance({ onNavigate }: HerdPerformanceProps) {
  const [cows, setCows] = useState<Cow[]>([]);
  const [events, setEvents] = useState<FarmEvent[]>([]);
  const [milking, setMilking] = useState<MilkingRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cowsRes, eventsRes, milkingRes] = await Promise.all([
        fetch('/api/cows'),
        fetch('/api/events'),
        fetch('/api/milking'),
      ]);
      if (cowsRes.ok) setCows(await cowsRes.json());
      if (eventsRes.ok) setEvents(await eventsRes.json());
      if (milkingRes.ok) setMilking(await milkingRes.json());
    } catch (error) {
      console.error('Error fetching herd data:', error);
    } finally {
      setLoading(false);
    }
  };

  const herdStats = useMemo(() => {
    const totalCows = cows.length;
    const females = cows.filter(c => c.gender === 'Betina').length;
    const males = cows.filter(c => c.gender === 'Jantan').length;
    const lactating = cows.filter(c => c.status === 'Laktasi').length;
    const pregnant = cows.filter(c => c.status === 'Hamil').length;
    const dry = cows.filter(c => c.status === 'Kering').length;
    const active = cows.filter(c => c.status === 'Aktif').length;
    const quarantine = cows.filter(c => c.status === 'Karantina').length;
    const sold = cows.filter(c => c.status === 'Terjual').length;

    // Average weight
    const avgWeight = cows.length > 0
      ? cows.reduce((s, c) => s + (c.weight || 0), 0) / cows.length
      : 0;

    // Recent health events
    const healthEvents = events.filter(e => e.type === 'Pemeriksaan Kesehatan' || e.type === 'Pengobatan');
    const recentHealth = healthEvents.slice(-5);

    // Production stats
    const recentMilking = milking.slice(-50);
    const avgVolume = recentMilking.length > 0
      ? recentMilking.reduce((s, r) => s + Number(r.volume), 0) / recentMilking.length
      : 0;

    // Breeding events
    const breedingEvents = events.filter(e => e.type === 'Pengawinan');

    return {
      totalCows,
      females,
      males,
      lactating,
      pregnant,
      dry,
      active,
      quarantine,
      sold,
      avgWeight,
      recentHealth,
      avgVolume,
      breedingCount: breedingEvents.length,
    };
  }, [cows, events, milking]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8a7d6b' }}>Memuat data ternak...</div>;
  }

  const statusBreakdown = [
    { label: 'Laktasi', count: herdStats.lactating, color: '#2e7d32', icon: '🥛' },
    { label: 'Hamil', count: herdStats.pregnant, color: '#1976d2', icon: '🤰' },
    { label: 'Kering', count: herdStats.dry, color: '#8a7d6b', icon: '😴' },
    { label: 'Aktif', count: herdStats.active, color: '#f57c00', icon: '💪' },
    { label: 'Karantina', count: herdStats.quarantine, color: '#ef4444', icon: '🏥' },
  ];

  return (
    <div style={{ background: '#fffef9', borderRadius: 12, padding: 20, border: '1px solid #e8dcc8' }}>
      <h2 style={{ margin: '0 0 20px', color: '#2e2416', fontSize: 18 }}>🐄 Performa Ternak</h2>

      {/* Overview Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Total Ternak</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2e2416' }}>{herdStats.totalCows}</div>
          <div style={{ fontSize: 11, color: '#8a7d6b' }}>{herdStats.females} ♀ {herdStats.males} ♂</div>
        </div>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Berat Rata-rata</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2e7d32' }}>{herdStats.avgWeight.toFixed(0)} kg</div>
        </div>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Volume Rata-rata</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1976d2' }}>{herdStats.avgVolume.toFixed(1)} L</div>
        </div>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Pengawinan</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f57c00' }}>{herdStats.breedingCount}</div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, color: '#2e2416', marginBottom: 12 }}>📊 Status Ternak</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          {statusBreakdown.map(s => (
            <div key={s.label} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              background: '#f5f0e8',
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 20 }}>{s.icon}</span>
              <div style={{ width: 100, fontWeight: 500, fontSize: 14, color: '#3a2e20' }}>{s.label}</div>
              <div style={{ flex: 1, height: 12, background: '#e8dcc8', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{
                  width: `${herdStats.totalCows > 0 ? (s.count / herdStats.totalCows) * 100 : 0}%`,
                  height: '100%',
                  background: s.color,
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <div style={{ width: 40, textAlign: 'right', fontSize: 16, fontWeight: 700, color: s.color }}>
                {s.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Health Events */}
      <div>
        <h3 style={{ fontSize: 15, color: '#2e2416', marginBottom: 12 }}>🏥 Riwayat Kesehatan Terbaru</h3>
        {herdStats.recentHealth.length > 0 ? (
          <div style={{ display: 'grid', gap: 8 }}>
            {herdStats.recentHealth.map(event => (
              <div key={event.id} style={{
                padding: '10px 14px',
                background: '#f5f0e8',
                borderRadius: 8,
                display: 'flex',
                gap: 12,
                alignItems: 'center',
              }}>
                <span style={{ fontSize: 16 }}>
                  {event.type === 'Pemeriksaan Kesehatan' ? '🩺' : '💊'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14, color: '#3a2e20' }}>{event.cowName}</div>
                  <div style={{ fontSize: 12, color: '#8a7d6b' }}>{event.description}</div>
                </div>
                <div style={{ fontSize: 12, color: '#8a7d6b', fontFamily: 'monospace' }}>{event.date}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: '#8a7d6b' }}>Belum ada catatan kesehatan.</div>
        )}
      </div>
    </div>
  );
}
