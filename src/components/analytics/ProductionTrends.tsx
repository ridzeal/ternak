'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MilkingRecord, Cow } from '@/types';
import { todayStr } from '@/lib/utils';

interface ProductionTrendsProps {
  onNavigate?: (page: string) => void;
}

export function ProductionTrends({ onNavigate }: ProductionTrendsProps) {
  const [milking, setMilking] = useState<MilkingRecord[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDays, setViewDays] = useState(30);
  const [selectedCow, setSelectedCow] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [milkingRes, cowsRes] = await Promise.all([
        fetch('/api/milking'),
        fetch('/api/cows'),
      ]);
      if (milkingRes.ok) setMilking(await milkingRes.json());
      if (cowsRes.ok) setCows(await cowsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate daily production
  const dailyProduction = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - viewDays);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];
    const today = todayStr();

    const dateMap = new Map<string, number>();
    const cowMap = new Map<string, Map<string, number>>();

    // Initialize all dates
    for (let d = new Date(cutoffDate); d <= new Date(today); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
    }

    // Aggregate
    milking.forEach(record => {
      if (record.date >= cutoffStr && record.date <= today) {
        if (selectedCow && record.cowId !== selectedCow) return;

        const volume = Number(record.volume) || 0;
        dateMap.set(record.date, (dateMap.get(record.date) || 0) + volume);

        if (!cowMap.has(record.cowId)) {
          cowMap.set(record.cowId, new Map());
        }
        const cowDays = cowMap.get(record.cowId)!;
        cowDays.set(record.date, (cowDays.get(record.date) || 0) + volume);
      }
    });

    return {
      dailyTotals: Array.from(dateMap.entries()).sort((a, b) => a[0].localeCompare(b[0])),
      cowData: cowMap,
    };
  }, [milking, viewDays, selectedCow]);

  // Calculate stats
  const stats = useMemo(() => {
    const totals = dailyProduction.dailyTotals.map(([_, v]) => v);
    const producingDays = totals.filter(v => v > 0);

    if (producingDays.length === 0) {
      return { total: 0, avg: 0, max: 0, min: 0, trend: 'stable' };
    }

    const total = producingDays.reduce((a, b) => a + b, 0);
    const avg = total / producingDays.length;
    const max = Math.max(...producingDays);
    const min = Math.min(...producingDays);

    // Simple trend: compare last 7 days vs previous 7 days
    const last7 = producingDays.slice(-7);
    const prev7 = producingDays.slice(-14, -7);
    const last7Avg = last7.length > 0 ? last7.reduce((a, b) => a + b, 0) / last7.length : 0;
    const prev7Avg = prev7.length > 0 ? prev7.reduce((a, b) => a + b, 0) / prev7.length : 0;
    const trend = last7Avg > prev7Avg * 1.05 ? 'up' : last7Avg < prev7Avg * 0.95 ? 'down' : 'stable';

    return { total, avg, max, min, trend };
  }, [dailyProduction]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#8a7d6b' }}>Memuat data tren...</div>;
  }

  // Simple bar chart using CSS
  const maxVal = Math.max(...dailyProduction.dailyTotals.map(([_, v]) => v), 1);

  return (
    <div style={{ background: '#fffef9', borderRadius: 12, padding: 20, border: '1px solid #e8dcc8' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, color: '#2e2416', fontSize: 18 }}>📈 Tren Produksi</h2>
          <p style={{ margin: '4px 0 0', color: '#8a7d6b', fontSize: 13 }}>
            {selectedCow ? cows.find(c => c.id === selectedCow)?.name : 'Seluruh Ternak'} - {viewDays} hari terakhir
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            value={selectedCow}
            onChange={e => setSelectedCow(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0d4c0',
              background: '#faf6ee',
              fontSize: 'var(--fs-sm)',
              color: '#3a2e20',
            }}
          >
            <option value="">Semua Sapi</option>
            {cows.filter(c => c.status === 'Laktasi').map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={viewDays}
            onChange={e => setViewDays(Number(e.target.value))}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0d4c0',
              background: '#faf6ee',
              fontSize: 'var(--fs-sm)',
              color: '#3a2e20',
            }}
          >
            <option value={7}>7 hari</option>
            <option value={14}>14 hari</option>
            <option value={30}>30 hari</option>
            <option value={60}>60 hari</option>
            <option value={90}>90 hari</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Total</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2e7d32' }}>{stats.total.toFixed(1)} L</div>
        </div>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Rata-rata</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1976d2' }}>{stats.avg.toFixed(1)} L</div>
        </div>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Tertinggi</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{stats.max.toFixed(1)} L</div>
        </div>
        <div style={{ padding: 14, background: '#f0e6d8', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase' }}>Trend</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: stats.trend === 'up' ? '#22c55e' : stats.trend === 'down' ? '#ef4444' : '#8a7d6b' }}>
            {stats.trend === 'up' ? '📈 Naik' : stats.trend === 'down' ? '📉 Turun' : '➡️ Stabil'}
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          height: 200,
          padding: '10px 0',
          borderBottom: '2px solid #e8dcc8',
          minWidth: dailyProduction.dailyTotals.length * 12,
        }}>
          {dailyProduction.dailyTotals.map(([date, value]) => (
            <div
              key={date}
              style={{
                flex: 1,
                minWidth: 8,
                height: `${(value / maxVal) * 100}%`,
                background: value > 0
                  ? `linear-gradient(to top, #8b5a2b, #a0692b)`
                  : '#e8dcc8',
                borderRadius: '2px 2px 0 0',
                position: 'relative',
                cursor: 'pointer',
              }}
              title={`${date}: ${value.toFixed(1)} L`}
            />
          ))}
        </div>
        {/* Date labels */}
        <div style={{
          display: 'flex',
          gap: 2,
          fontSize: 9,
          color: '#8a7d6b',
          marginTop: 4,
          minWidth: dailyProduction.dailyTotals.length * 12,
        }}>
          {dailyProduction.dailyTotals.map(([date], index) => {
            // Only show every 5th date to avoid crowding
            if (index % 5 !== 0 && index !== dailyProduction.dailyTotals.length - 1) {
              return <div key={date} style={{ flex: 1, minWidth: 8 }} />;
            }
            return (
              <div key={date} style={{ flex: 1, minWidth: 8, textAlign: 'center' }}>
                {date.slice(5)}
              </div>
            );
          })}
        </div>
      </div>

      {/* Per-Cow Breakdown */}
      {!selectedCow && dailyProduction.cowData.size > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, color: '#2e2416', marginBottom: 12 }}>🐄 Produksi per Sapi</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            {Array.from(dailyProduction.cowData.entries())
              .sort((a, b) => {
                const totalA = Array.from(a[1].values()).reduce((s, v) => s + v, 0);
                const totalB = Array.from(b[1].values()).reduce((s, v) => s + v, 0);
                return totalB - totalA;
              })
              .slice(0, 10)
              .map(([cowId, cowDays]) => {
                const total = Array.from(cowDays.values()).reduce((s, v) => s + v, 0);
                const avg = cowDays.size > 0 ? total / cowDays.size : 0;
                const cow = cows.find(c => c.id === cowId);
                return (
                  <div key={cowId} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '8px 12px',
                    background: '#f5f0e8',
                    borderRadius: 6,
                  }}>
                    <div style={{ width: 100, fontWeight: 500, fontSize: 13, color: '#3a2e20' }}>
                      {cow?.name || cowId}
                    </div>
                    <div style={{ flex: 1, height: 8, background: '#e8dcc8', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, (avg / (maxVal / dailyProduction.dailyTotals.length || 1)) * 100)}%`,
                        height: '100%',
                        background: '#8b5a2b',
                        borderRadius: 4,
                      }} />
                    </div>
                    <div style={{ width: 70, textAlign: 'right', fontSize: 12, color: '#2e7d32', fontWeight: 600 }}>
                      {avg.toFixed(1)} L/hari
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      )}
    </div>
  );
}
