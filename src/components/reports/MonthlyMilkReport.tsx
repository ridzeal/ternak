'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/Button';
import { MilkingRecord, EnvironmentalData, Cow, MilkCollection } from '@/types';
import { todayStr } from '@/lib/utils';

interface MonthlyMilkReportProps {
  onRefresh?: () => void;
}

export function MonthlyMilkReport({ onRefresh }: MonthlyMilkReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [envData, setEnvData] = useState<EnvironmentalData[]>([]);
  const [collectionData, setCollectionData] = useState<MilkCollection[]>([]);
  const [allCows, setAllCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMonthlyData();
  }, [selectedMonth]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedMonth.split('-');
      const startDate = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

      // Fetch milking records
      const milkingRes = await fetch('/api/milking');
      const milkingData: MilkingRecord[] = await milkingRes.json();

      // Filter to selected month
      const monthMilking = milkingData.filter(r => r.date >= startDate && r.date <= endDate);

      // Fetch environmental data for each day
      const envPrompts: EnvironmentalData[] = [];
      for (let day = 1; day <= lastDay; day++) {
        const date = `${year}-${month}-${String(day).padStart(2, '0')}`;
        try {
          const res = await fetch(`/api/environment?date=${date}`);
          if (res.ok) {
            const records = await res.json();
            if (records.length > 0) envPrompts.push(records[0]);
          }
        } catch {}
      }
      setEnvData(envPrompts);

      // Fetch collection data
      const collRes = await fetch('/api/milk-collection');
      if (collRes.ok) {
        const allCollections: MilkCollection[] = await collRes.json();
        const monthCollections = allCollections.filter(c => c.date >= startDate && c.date <= endDate);
        setCollectionData(monthCollections);
      }

      // Fetch cows
      const cowsRes = await fetch('/api/cows');
      if (cowsRes.ok) {
        const cowsData: Cow[] = await cowsRes.json();
        setAllCows(cowsData);
      }

      // Aggregate daily data
      const dailyMap = new Map<string, any>();

      for (let day = 1; day <= lastDay; day++) {
        const date = `${year}-${month}-${String(day).padStart(2, '0')}`;
        const dateMilking = monthMilking.filter(r => r.date === date);

        const session1Total = dateMilking.filter(r => r.session === 'Pagi').reduce((s, r) => s + Number(r.volume), 0);
        const session2Total = dateMilking.filter(r => r.session === 'Siang').reduce((s, r) => s + Number(r.volume), 0);
        const session3Total = dateMilking.filter(r => r.session === 'Malam').reduce((s, r) => s + Number(r.volume), 0);
        const total = session1Total + session2Total + session3Total;

        const uniqueCows = new Set(dateMilking.map(r => r.cowId));
        const lactatingCows = allCows.filter(c => c.status === 'Laktasi');

        const avgFat = dateMilking.length > 0 ? dateMilking.reduce((s, r) => s + Number(r.fat), 0) / dateMilking.length : 0;
        const avgProtein = dateMilking.length > 0 ? dateMilking.reduce((s, r) => s + Number(r.protein), 0) / dateMilking.length : 0;
        const avgLactose = dateMilking.filter(r => r.lactose).length > 0
          ? dateMilking.filter(r => r.lactose).reduce((s, r) => s + Number(r.lactose!), 0) / dateMilking.filter(r => r.lactose).length
          : 0;
        const avgTotalSolids = dateMilking.filter(r => r.totalSolids).length > 0
          ? dateMilking.filter(r => r.totalSolids).reduce((s, r) => s + Number(r.totalSolids!), 0) / dateMilking.filter(r => r.totalSolids).length
          : 0;

        const dayOfWeek = new Date(date).toLocaleDateString('id-ID', { weekday: 'short' });

        const dayCollection = collectionData.filter(c => c.date === date);
        const totalCollected = dayCollection.reduce((s, c) => s + Number(c.totalQuantity), 0);

        dailyMap.set(date, {
          date,
          day: dayOfWeek,
          totalCows: allCows.length,
          lactatingCows: lactatingCows.length,
          producingCows: uniqueCows.size,
          session1: session1Total.toFixed(1),
          session2: session2Total.toFixed(1),
          session3: session3Total.toFixed(1),
          total: total.toFixed(1),
          avgPerCow: uniqueCows.size > 0 ? (total / uniqueCows.size).toFixed(1) : '-',
          collected: totalCollected > 0 ? totalCollected.toFixed(1) : '-',
          fat: avgFat.toFixed(1),
          lactose: avgLactose > 0 ? avgLactose.toFixed(1) : '-',
          protein: avgProtein.toFixed(1),
          totalSolids: avgTotalSolids > 0 ? avgTotalSolids.toFixed(1) : '-',
          notes: '',
        });
      }

      setDailyData(Array.from(dailyMap.values()));
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthTotal = useMemo(() => {
    return dailyData.reduce((sum, d) => sum + parseFloat(d.total || 0), 0);
  }, [dailyData]);

  const monthAvgPerCow = useMemo(() => {
    const producingDays = dailyData.filter(d => parseFloat(d.total || 0) > 0);
    if (producingDays.length === 0) return 0;
    return producingDays.reduce((sum, d) => sum + parseFloat(d.avgPerCow || 0), 0) / producingDays.length;
  }, [dailyData]);

  const exportToCSV = () => {
    let csv = 'Hari,Tanggal,Jumlah Sapi,Sapi Laktasi,Perahan 1,Perahan 2,Perahan 3,Total,Rata-rata/Sapi,Diterima,Fat %,Lactose %,Protein %,Total Solids %,Catatan\n';

    dailyData.forEach(d => {
      const envForDay = envData.find(e => e.date === d.date);
      const thi = envForDay?.thi || '-';
      const thunderstorm = envForDay?.thunderstorm ? 'Ya' : 'Tidak';
      const beratAvg = allCows.filter(c => c.status === 'Laktasi').reduce((s, c) => s + (c.weight || 0), 0) / (allCows.filter(c => c.status === 'Laktasi').length || 1);

      csv += [
        d.day,
        d.date,
        d.totalCows,
        d.lactatingCows,
        d.session1,
        d.session2,
        d.session3,
        d.total,
        d.avgPerCow,
        d.collected,
        d.fat,
        d.lactose,
        d.protein,
        d.totalSolids,
        d.notes,
      ].join(',') + '\n';
    });

    // Add monthly summary
    csv += `\nTOTAL BULAN,,,,,,,${monthTotal.toFixed(1)},${monthAvgPerCow.toFixed(1)},,,,,\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const monthName = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    link.download = `laporan_susu_bulanan_${monthName.replace(' ', '_')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <div style={{ background: '#fffef9', borderRadius: 12, padding: 20, border: '1px solid #e8dcc8' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white; }
          .report-container { box-shadow: none !important; border: none !important; }
        }
        .print-only { display: none; }
      `}</style>

      {/* Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, color: '#8a7d6b', fontWeight: 500 }}>Bulan:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid #e0d4c0',
              background: '#faf6ee',
              fontSize: 'var(--fs-md)',
              color: '#3a2e20',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={handlePrint} style={{ fontSize: 13, padding: '10px 18px' }}>
            🖨️ Cetak
          </Button>
          <Button onClick={exportToCSV} style={{ fontSize: 13, padding: '10px 18px' }}>
            📊 Export CSV
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only" style={{ marginBottom: 20, textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 8px 0', color: '#2e2416' }}>HASIL SUSU PER BULAN (dlm kg)</h2>
        <p style={{ margin: 0, color: '#8a7d6b' }}>{monthLabel}</p>
      </div>

      {/* Monthly Summary Stats */}
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
          <div style={{ fontSize: 22, fontWeight: 700, color: '#2e7d32' }}>{monthTotal.toFixed(1)} L</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rata-rata/Sapi/Hari</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f57c00' }}>{monthAvgPerCow.toFixed(1)} L</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Diterima</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#1976d2' }}>
            {collectionData.reduce((s, c) => s + Number(c.totalQuantity), 0).toFixed(1)} L
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8a7d6b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bulan</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#2e2416' }}>{monthLabel}</div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#8a7d6b' }}>Memuat data...</div>
      ) : (
        <div className="report-container" style={{ overflowX: 'auto', border: '1px solid #e8dcc8', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#2e2416', color: '#f5f0e8' }}>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 40 }}>No</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 60 }}>Hari</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 90 }}>Tanggal</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 60 }}>Sapi</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 60 }}>Laktasi</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70 }}>Per. 1</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70 }}>Per. 2</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70 }}>Per. 3</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70 }}>Total</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70 }}>Rata²</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 70 }}>Diterima</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 50 }}>Fat</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 55 }}>Lactose</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 55 }}>Protein</th>
                <th style={{ padding: '10px 8px', textAlign: 'center', width: 60 }}>TS</th>
                <th style={{ padding: '10px 8px', textAlign: 'left' }}>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((d, index) => (
                <tr key={d.date} style={{ background: index % 2 === 0 ? '#faf7f2' : '#fff', borderBottom: '1px solid #e8dcc8' }}>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#8a7d6b' }}>{index + 1}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#5a4a3a' }}>{d.day}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontFamily: 'monospace', fontSize: 11 }}>{d.date}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.totalCows}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.lactatingCows}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.session1}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.session2}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.session3}</td>
                  <td style={{ padding: '8px', textAlign: 'center', fontWeight: 600, color: '#2e7d32' }}>{d.total}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#f57c00' }}>{d.avgPerCow}</td>
                  <td style={{ padding: '8px', textAlign: 'center', color: '#1976d2' }}>{d.collected}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.fat}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.lactose || '-'}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.protein}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{d.totalSolids || '-'}</td>
                  <td style={{ padding: '8px', color: '#5a4a3a', fontSize: 11 }}>{d.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e8dcc8', fontWeight: 600 }}>
                <td colSpan={8} style={{ padding: '12px 8px', textAlign: 'right', color: '#2e2416' }}>TOTAL BULAN:</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#2e7d32', fontSize: 14 }}>{monthTotal.toFixed(1)}</td>
                <td style={{ padding: '12px 8px', textAlign: 'center', color: '#f57c00' }}>{monthAvgPerCow.toFixed(1)}</td>
                <td colSpan={5} style={{ padding: '12px 8px', color: '#5a4a3a', fontSize: 11 }}>
                  Rata-rata bulanan: {(monthTotal / (dailyData.filter(d => parseFloat(d.total) > 0).length || 1)).toFixed(1)} L/hari
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
