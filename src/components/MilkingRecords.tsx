'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { MilkingRecord, Cow, SESSIONS } from '@/types';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/Button';

interface MilkingRecordsProps {
  milking: MilkingRecord[];
  cows: Cow[];
  onRowClick?: (record: MilkingRecord) => void;
  onDelete?: (record: MilkingRecord) => void;
  onAdd?: () => void;
}

interface DailyGroup {
  date: string;
  records: MilkingRecord[];
  total: number;
  cowCount: number;
  average: number;
}

interface CowDailyEntry {
  cowId: string;
  cowName: string;
  sessions: {
    Pagi: number;
    Siang: number;
    Malam: number;
  };
  total: number;
  notes: string;
}

export function MilkingRecords({ milking, cows, onRowClick, onDelete, onAdd }: MilkingRecordsProps) {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Group milking records by date
  const dailyGroups = useMemo(() => {
    const groups = new Map<string, DailyGroup>();

    milking.forEach(record => {
      if (!groups.has(record.date)) {
        groups.set(record.date, {
          date: record.date,
          records: [],
          total: 0,
          cowCount: 0,
          average: 0,
        });
      }

      const group = groups.get(record.date)!;
      group.records.push(record);
      group.total += Number(record.volume) || 0;
    });

    // Calculate cow count and average for each group
    groups.forEach(group => {
      const uniqueCows = new Set(group.records.map(r => r.cowId));
      group.cowCount = uniqueCows.size;
      group.average = group.cowCount > 0 ? group.total / group.cowCount : 0;
    });

    // Convert to array and sort by date descending
    return Array.from(groups.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [milking]);

  // Get cow entries for a specific date
  const getCowEntriesForDate = (date: string): CowDailyEntry[] => {
    const dateRecords = milking.filter(r => r.date === date);
    const cowMap = new Map<string, CowDailyEntry>();

    // Initialize with all lactating cows
    cows.filter(c => c.status === 'Laktasi' || c.gender === 'Betina').forEach(cow => {
      cowMap.set(cow.id, {
        cowId: cow.id,
        cowName: cow.name,
        sessions: { Pagi: 0, Siang: 0, Malam: 0 },
        total: 0,
        notes: '',
      });
    });

    // Fill in session data
    dateRecords.forEach(record => {
      const entry = cowMap.get(record.cowId);
      if (entry) {
        const volume = Number(record.volume) || 0;
        entry.sessions[record.session] = volume;
        entry.total += volume;
        if (record.notes && !entry.notes) {
          entry.notes = record.notes;
        }
      }
    });

    return Array.from(cowMap.values()).filter(c => c.total > 0);
  };

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedDays(new Set(dailyGroups.map(g => g.date)));
  };

  const collapseAll = () => {
    setExpandedDays(new Set());
  };

  // Get first milking record for a specific cow and date (for editing)
  const getMilkingRecordForCow = (cowId: string, date: string): MilkingRecord | undefined => {
    return milking.find(r => r.cowId === cowId && r.date === date);
  };

  const handleCowClick = (cowId: string, date: string) => {
    const record = getMilkingRecordForCow(cowId, date);
    if (record && onRowClick) {
      onRowClick(record);
    }
  };

  const sessionStyle: Record<string, React.CSSProperties> = {
    Pagi: { background: '#e3f2fd', color: '#1976d2', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 },
    Siang: { background: '#fff3e0', color: '#f57c00', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 },
    Malam: { background: '#f3e5f5', color: '#7b1fa2', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 },
  };

  return (
    <div>
      {/* Header Actions */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="secondary"
            onClick={expandAll}
            style={{ fontSize: 'var(--fs-xs)', padding: '8px 12px' }}
          >
            ▼ Expand All
          </Button>
          <Button
            variant="secondary"
            onClick={collapseAll}
            style={{ fontSize: 'var(--fs-xs)', padding: '8px 12px' }}
          >
            ▲ Collapse All
          </Button>
        </div>
        <div style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b' }}>
          {dailyGroups.length} days • {milking.length} records
        </div>
      </div>

      {/* Daily Groups */}
      {dailyGroups.length === 0 ? (
        <div style={{
          padding: 40,
          textAlign: 'center',
          color: '#8a7d6b',
          fontSize: 'var(--fs-md)',
          background: '#fffef9',
          borderRadius: 12,
          border: '1px dashed #d6cbba',
        }}>
          Belum ada data pemerahan. Klik '+ Tambah' untuk mencatat.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {dailyGroups.map(group => {
            const isExpanded = expandedDays.has(group.date);
            const cowEntries = getCowEntriesForDate(group.date);
            const dateObj = new Date(group.date);
            const formattedDate = dateObj.toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={group.date}
                style={{
                  background: '#fffef9',
                  borderRadius: 12,
                  border: '1px solid #e8dcc8',
                  overflow: 'hidden',
                }}
              >
                {/* Header */}
                <div
                  onClick={() => toggleDay(group.date)}
                  style={{
                    padding: '16px 20px',
                    background: isExpanded ? '#f5f0e8' : '#fffef9',
                    borderBottom: isExpanded ? '1px solid #d6cbba' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0e6d8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = isExpanded ? '#f5f0e8' : '#fffef9';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
                    <div style={{ fontSize: 24 }}>
                      {isExpanded ? '▼' : '▶'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                        <span style={{ fontSize: 'var(--fs-lg)', fontWeight: 700, color: '#2e2416' }}>
                          📅 {group.date}
                        </span>
                        <span style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b' }}>
                          {formattedDate}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 20, fontSize: 'var(--fs-sm)', color: '#5a4a3a' }}>
                        <span>
                          <strong style={{ color: '#2e7d32' }}>{group.total.toFixed(1)} L</strong> Total
                        </span>
                        <span>
                          <strong>{group.cowCount}</strong> Sapi
                        </span>
                        <span>
                          <strong>{group.average.toFixed(1)} L</strong> Rata-rata
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detail */}
                {isExpanded && (
                  <div style={{ padding: '16px 20px' }}>
                    {/* Session-level breakdown table */}
                    <div>
                      <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: '#5a4a3a', marginBottom: 12 }}>
                        📋 Rincian per Sapi
                      </div>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: 'var(--fs-sm)',
                        }}>
                          <thead>
                            <tr style={{ background: '#2e2416', color: '#f5f0e8' }}>
                              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Sapi</th>
                              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Pagi</th>
                              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Siang</th>
                              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Malam</th>
                              <th style={{ padding: '10px 12px', textAlign: 'center' }}>Total</th>
                              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Catatan</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cowEntries.map((entry, idx) => (
                              <tr
                                key={entry.cowId}
                                onClick={() => handleCowClick(entry.cowId, group.date)}
                                style={{
                                  background: idx % 2 === 0 ? '#faf7f2' : '#fff',
                                  borderBottom: '1px solid #e8dcc8',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#f0e6d8';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = idx % 2 === 0 ? '#faf7f2' : '#fff';
                                }}
                              >
                                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{entry.cowName}</td>
                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                  {entry.sessions.Pagi > 0 ? `${entry.sessions.Pagi} L` : '-'}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                  {entry.sessions.Siang > 0 ? `${entry.sessions.Siang} L` : '-'}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                  {entry.sessions.Malam > 0 ? `${entry.sessions.Malam} L` : '-'}
                                </td>
                                <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#2e7d32' }}>
                                  {entry.total > 0 ? `${entry.total.toFixed(1)} L` : '-'}
                                </td>
                                <td style={{ padding: '10px 12px', fontStyle: 'italic', color: '#8a7d6b' }}>
                                  {entry.notes || '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
