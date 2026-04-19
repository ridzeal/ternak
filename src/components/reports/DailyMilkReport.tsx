'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { MilkingRecord, EnvironmentalData } from '@/types';
import { todayStr } from '@/lib/utils';

interface CowDailySummary {
  cowId: string;
  cowName: string;
  session1: number;
  session2: number;
  session3: number;
  total: number;
  notes: string;
}

interface DailyMilkReportProps {
  onRefresh?: () => void;
}

export function DailyMilkReport({ onRefresh }: DailyMilkReportProps) {
  const { milking, cows } = useFarm();
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(todayStr());
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(false);
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);

  // Group milking records by date and cow
  const dailySummaries = useMemo(() => {
    const summaries: Map<string, CowDailySummary[]> = new Map();
    
    // Get all dates in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const datesInRange: string[] = [];
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      datesInRange.push(d.toISOString().split('T')[0]);
    }

    // Initialize empty summaries for all dates
    datesInRange.forEach(date => {
      summaries.set(date, []);
    });

    // Group records by date and cow
    milking.forEach(record => {
      if (record.date >= startDate && record.date <= endDate) {
        let daySummary = summaries.get(record.date);
        if (!daySummary) {
          daySummary = [];
          summaries.set(record.date, daySummary);
        }

        let cowEntry = daySummary.find(e => e.cowId === record.cowId);
        if (!cowEntry) {
          cowEntry = {
            cowId: record.cowId,
            cowName: record.cowName,
            session1: 0,
            session2: 0,
            session3: 0,
            total: 0,
            notes: '',
          };
          daySummary.push(cowEntry);
        }

        if (record.session === 'Pagi') {
          cowEntry.session1 = Number(record.volume) || 0;
          cowEntry.notes = record.notes || '';
        } else if (record.session === 'Siang') {
          cowEntry.session2 = Number(record.volume) || 0;
        } else if (record.session === 'Malam') {
          cowEntry.session3 = Number(record.volume) || 0;
        }

        cowEntry.total = cowEntry.session1 + cowEntry.session2 + cowEntry.session3;
      }
    });

    // Sort each day's entries by cow name
    summaries.forEach((entries) => {
      entries.sort((a, b) => a.cowName.localeCompare(b.cowName));
    });

    return summaries;
  }, [milking, startDate, endDate]);

  // Fetch environmental data for selected date
  useEffect(() => {
    async function fetchEnvData() {
      try {
        const res = await fetch(`/api/environment?date=${selectedDate}`);
        if (res.ok) {
          const records = await res.json();
          setEnvData(records && records.length > 0 ? records[0] : null);
        }
      } catch (error) {
        console.error('Error fetching environmental data:', error);
      }
    }
    fetchEnvData();
  }, [selectedDate]);

  // Calculate daily totals
  const calculateDailyTotal = (date: string): number => {
    const entries = dailySummaries.get(date) || [];
    return entries.reduce((sum, e) => sum + e.total, 0);
  };

  const calculateDailyAverage = (date: string): number => {
    const entries = dailySummaries.get(date) || [];
    const producing = entries.filter(e => e.total > 0);
    if (producing.length === 0) return 0;
    const total = entries.reduce((sum, e) => sum + e.total, 0);
    return total / producing.length;
  };

  const calculateProducingCows = (date: string): number => {
    const entries = dailySummaries.get(date) || [];
    return entries.filter(e => e.total > 0).length;
  };

  // Export to CSV
  const exportToCSV = () => {
    const datesInRange: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      datesInRange.push(d.toISOString().split('T')[0]);
    }

    // CSV Header matching reference format
    let csv = 'Tanggal,No,Nama,Perahan 1 (Pagi),Perahan 2 (Siang),Perahan 3 (Malam),Total,Keterangan\n';

    datesInRange.forEach(date => {
      const entries = dailySummaries.get(date) || [];
      entries.forEach((entry, index) => {
        const row = [
          date,
          index + 1,
          `"${entry.cowName}"`,
          entry.session1.toFixed(1),
          entry.session2.toFixed(1),
          entry.session3.toFixed(1),
          entry.total.toFixed(1),
          `"${entry.notes.replace(/"/g, '""')}"`,
        ].join(',');
        csv += row + '\n';
      });

      // Add daily summary row (even if no entries)
      const dailyTotal = calculateDailyTotal(date);
      const producingCows = calculateProducingCows(date);
      csv += `${date},,TOTAL HARIAN,,,,${dailyTotal.toFixed(1)},${producingCows} sapi memproduksi\n`;
      csv += '\n';
    });

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan_susu_${startDate}_sampai_${endDate}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  const currentEntries = dailySummaries.get(selectedDate) || [];
  const dailyTotal = calculateDailyTotal(selectedDate);
  const producingCows = calculateProducingCows(selectedDate);
  const dailyAverage = calculateDailyAverage(selectedDate);

  // Generate date options for dropdown
  const dateOptions = useMemo(() => {
    const options: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      options.push(d.toISOString().split('T')[0]);
    }
    
    return options;
  }, [startDate, endDate]);

  return (
    <div style={{ background: '#fffef9', borderRadius: 12, padding: 20, border: '1px solid #e8dcc8' }}>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .report-container { box-shadow: none !important; border: none !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Header Controls - Hidden on print */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#8a7d6b' }}>Dari:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => {
                setStartDate(e.target.value);
                if (e.target.value > selectedDate) setSelectedDate(e.target.value);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '1.5px solid #d6cbba',
                background: '#faf7f2',
                fontSize: 13,
                color: '#3a2e20',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#8a7d6b' }}>Sampai:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => {
                setEndDate(e.target.value);
                if (e.target.value < selectedDate) setSelectedDate(e.target.value);
              }}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '1.5px solid #d6cbba',
                background: '#faf7f2',
                fontSize: 13,
                color: '#3a2e20',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 13, color: '#8a7d6b' }}>Lihat:</label>
            <select
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 10px',
                borderRadius: 6,
                border: '1.5px solid #d6cbba',
                background: '#faf7f2',
                fontSize: 13,
                color: '#3a2e20',
                cursor: 'pointer',
              }}
            >
              {dateOptions.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            variant="secondary" 
            onClick={handlePrint}
            style={{ fontSize: 13, padding: '10px 18px' }}
          >
            🖨️ Cetak
          </Button>
          <Button 
            onClick={exportToCSV}
            style={{ fontSize: 13, padding: '10px 18px' }}
          >
            📊 Export Excel (CSV)
          </Button>
        </div>
      </div>

      {/* Print Header - Only visible on print */}
      <div className="print-only" style={{ marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#2e2416', fontSize: 20 }}>🐄 Laporan Produksi Susu Harian</h2>
        <p style={{ margin: 0, color: '#8a7d6b', fontSize: 14 }}>
          Periode: {startDate} s/d {endDate}
        </p>
      </div>

      {/* Environmental Data Summary */}
      {envData && (
        <div style={{ 
          background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)', 
          borderRadius: 10, 
          padding: 14, 
          marginBottom: 16,
          border: '1px solid #d6cbba',
        }}>
          <div style={{ fontSize: 12, color: '#5a4a3a', fontWeight: 600, marginBottom: 8 }}>
            🌡️ Kondisi Lingkungan - {selectedDate}
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
            {envData.tempMin && (
              <span style={{ color: '#3a2e20' }}>
                <span style={{ color: '#8a7d6b' }}>Suhu Min:</span> <strong>{envData.tempMin}°C</strong>
              </span>
            )}
            {envData.tempMax && (
              <span style={{ color: '#3a2e20' }}>
                <span style={{ color: '#8a7d6b' }}>Suhu Max:</span> <strong>{envData.tempMax}°C</strong>
              </span>
            )}
            {envData.humidity && (
              <span style={{ color: '#3a2e20' }}>
                <span style={{ color: '#8a7d6b' }}>Kelembaban:</span> <strong>{envData.humidity}%</strong>
              </span>
            )}
            {envData.thi && (
              <span style={{ color: '#3a2e20' }}>
                <span style={{ color: '#8a7d6b' }}>THI:</span> <strong>{envData.thi}</strong>
              </span>
            )}
            {envData.thunderstorm && (
              <span style={{ color: '#c0392b' }}>⛈️ Hujan Badai</span>
            )}
            {envData.notes && (
              <span style={{ color: '#3a2e20', fontStyle: 'italic' }}>
                <span style={{ color: '#8a7d6b' }}>Catatan:</span> {envData.notes}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Daily Summary Stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: 12, 
        marginBottom: 16,
        padding: '14px 18px',
        background: '#f0e6d8',
        borderRadius: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Produksi</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2e7d32' }}>{dailyTotal.toFixed(1)} L</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sapi Memproduksi</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1976d2' }}>{producingCows}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rata-rata/Sapi</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f57c00' }}>{dailyAverage.toFixed(1)} L</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2e2416' }}>{selectedDate}</div>
        </div>
      </div>

      {/* Report Table */}
      <div className="report-container" style={{ overflowX: 'auto', border: '1px solid #e8dcc8', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#2e2416', color: '#f5f0e8' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 50 }}>No</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Nama</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 110 }}>Perahan 1<br/><span style={{ fontSize: 10, opacity: 0.8 }}>(Pagi)</span></th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 110 }}>Perahan 2<br/><span style={{ fontSize: 10, opacity: 0.8 }}>(Siang)</span></th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 110 }}>Perahan 3<br/><span style={{ fontSize: 10, opacity: 0.8 }}>(Malam)</span></th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 100 }}>Total (L)</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', width: 200 }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {currentEntries.map((entry, index) => (
              <tr 
                key={entry.cowId}
                style={{ 
                  background: index % 2 === 0 ? '#faf7f2' : '#fff',
                  borderBottom: '1px solid #e8dcc8',
                }}
              >
                <td style={{ padding: '10px', textAlign: 'center', color: '#8a7d6b' }}>{index + 1}</td>
                <td style={{ padding: '10px', fontWeight: 500, color: '#3a2e20' }}>{entry.cowName}</td>
                <td style={{ padding: '10px', textAlign: 'center', color: entry.session1 > 0 ? '#3a2e20' : '#c0c0c0' }}>
                  {entry.session1 > 0 ? entry.session1.toFixed(1) : '-'}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', color: entry.session2 > 0 ? '#3a2e20' : '#c0c0c0' }}>
                  {entry.session2 > 0 ? entry.session2.toFixed(1) : '-'}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', color: entry.session3 > 0 ? '#3a2e20' : '#c0c0c0' }}>
                  {entry.session3 > 0 ? entry.session3.toFixed(1) : '-'}
                </td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: entry.total > 0 ? '#2e7d32' : '#8a7d6b' }}>
                  {entry.total > 0 ? entry.total.toFixed(1) : '-'}
                </td>
                <td style={{ padding: '10px', color: '#5a4a3a', fontSize: 12 }}>{entry.notes || '-'}</td>
              </tr>
            ))}
          </tbody>
          {currentEntries.length > 0 && (
            <tfoot>
              <tr style={{ background: '#e8dcc8', fontWeight: 600 }}>
                <td colSpan={5} style={{ padding: '12px 10px', textAlign: 'right', color: '#2e2416' }}>TOTAL HARIAN:</td>
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#2e7d32', fontSize: 15 }}>
                  {dailyTotal.toFixed(1)} L
                </td>
                <td style={{ padding: '12px 10px', color: '#5a4a3a', fontSize: 12 }}>
                  {producingCows} sapi memproduksi
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {currentEntries.length === 0 && (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          color: '#8a7d6b',
          fontSize: 14,
          border: '1px solid #e8dcc8',
          borderRadius: 8,
          marginTop: 16,
        }}>
          Tidak ada data produksi susu untuk tanggal {selectedDate}
        </div>
      )}

      {/* Period Summary Table - Shows all dates in range */}
      {dateOptions.length > 1 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 15, color: '#2e2416', marginBottom: 12, fontWeight: 600 }}>
            📈 Ringkasan Periode ({dateOptions.length} hari)
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: '#f5f0e8', color: '#2e2416' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #d6cbba' }}>Tanggal</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d6cbba' }}>Total (L)</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d6cbba' }}>Sapi Memproduksi</th>
                  <th style={{ padding: '10px', textAlign: 'center', borderBottom: '2px solid #d6cbba' }}>Rata-rata/Sapi</th>
                </tr>
              </thead>
              <tbody>
                {dateOptions.map((date, index) => {
                  const total = calculateDailyTotal(date);
                  const producing = calculateProducingCows(date);
                  const avg = calculateDailyAverage(date);
                  return (
                    <tr 
                      key={date}
                      style={{ 
                        background: index % 2 === 0 ? '#fff' : '#faf7f2',
                        borderBottom: '1px solid #e8dcc8',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedDate(date)}
                    >
                      <td style={{ padding: '10px', color: date === selectedDate ? '#2e7d32' : '#3a2e20', fontWeight: date === selectedDate ? 600 : 400 }}>
                        {date === selectedDate && '📍 '}{date}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center', fontWeight: 500, color: '#2e7d32' }}>{total.toFixed(1)}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#1976d2' }}>{producing}</td>
                      <td style={{ padding: '10px', textAlign: 'center', color: '#f57c00' }}>{avg > 0 ? avg.toFixed(1) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#e8dcc8', fontWeight: 600 }}>
                  <td style={{ padding: '12px 10px', textAlign: 'right', color: '#2e2416' }}>TOTAL PERIODE:</td>
                  <td style={{ padding: '12px 10px', textAlign: 'center', color: '#2e7d32', fontSize: 14 }}>
                    {dateOptions.reduce((sum, d) => sum + calculateDailyTotal(d), 0).toFixed(1)} L
                  </td>
                  <td colSpan={2} style={{ padding: '12px 10px', color: '#5a4a3a', fontSize: 12 }}>
                    Rata-rata harian: {(dateOptions.reduce((sum, d) => sum + calculateDailyTotal(d), 0) / dateOptions.length).toFixed(1)} L
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
