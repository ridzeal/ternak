'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Button } from '@/components/Button';
import { Cow, MilkingRecord, EnvironmentalData, SESSIONS } from '@/types';
import { todayStr } from '@/lib/utils';

interface CowMilkingEntry {
  cowId: string;
  cowName: string;
  session1: string;
  session2: string;
  session3: string;
  notes: string;
}

interface DailyMilkingFormProps {
  onSaveComplete?: () => void;
}

export function DailyMilkingForm({ onSaveComplete }: DailyMilkingFormProps) {
  const { cows, milking } = useFarm();
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [entries, setEntries] = useState<CowMilkingEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Environmental data state
  const [envData, setEnvData] = useState<EnvironmentalData | null>(null);
  const [tempMin, setTempMin] = useState<string>('');
  const [tempMax, setTempMax] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');
  const [thunderstorm, setThunderstorm] = useState<boolean>(false);
  const [envNotes, setEnvNotes] = useState<string>('');

  // Filter lactating cows
  const lactatingCows = cows.filter(cow => cow.status === 'Laktasi' || cow.gender === 'Betina');

  // Calculate THI from temp and humidity
  const calculateTHI = useCallback((temp: number, hum: number): number => {
    const thi = (0.8 * temp) + ((hum / 100) * (temp - 14.4)) + 46.4;
    return Math.round(thi * 10) / 10;
  }, []);

  // Fetch existing records for selected date
  // Note: Only re-fetch when date changes, not when milking/cows change
  // to avoid infinite loops. Data is filtered locally.
  useEffect(() => {
    let cancelled = false;

    async function fetchDailyRecords() {
      setLoading(true);
      try {
        // Fetch milking records for the date
        const milkingForDate = milking.filter(m => m.date === selectedDate);

        // Group by cow and session
        const cowEntries: Map<string, CowMilkingEntry> = new Map();

        lactatingCows.forEach(cow => {
          cowEntries.set(cow.id, {
            cowId: cow.id,
            cowName: cow.name,
            session1: '',
            session2: '',
            session3: '',
            notes: '',
          });
        });

        milkingForDate.forEach(record => {
          const entry = cowEntries.get(record.cowId);
          if (entry) {
            if (record.session === 'Pagi') {
              entry.session1 = String(record.volume);
              entry.notes = record.notes || '';
            } else if (record.session === 'Siang') {
              entry.session2 = String(record.volume);
            } else if (record.session === 'Malam') {
              entry.session3 = String(record.volume);
            }
            cowEntries.set(record.cowId, entry);
          }
        });

        if (!cancelled) {
          setEntries(Array.from(cowEntries.values()));
        }

        // Fetch environmental data for the date
        const envRes = await fetch(`/api/environment?date=${selectedDate}`);
        if (envRes.ok && !cancelled) {
          const envRecords = await envRes.json();
          if (envRecords && envRecords.length > 0) {
            const env = envRecords[0];
            setEnvData(env);
            setTempMin(env.tempMin || '');
            setTempMax(env.tempMax || '');
            setHumidity(env.humidity ? String(env.humidity) : '');
            setThunderstorm(env.thunderstorm || false);
            setEnvNotes(env.notes || '');
          } else {
            setEnvData(null);
            setTempMin('');
            setTempMax('');
            setHumidity('');
            setThunderstorm(false);
            setEnvNotes('');
          }
        }
      } catch (error) {
        console.error('Error fetching daily records:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchDailyRecords();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]); // Only depend on selectedDate to avoid infinite loops

  // Update entry field
  const updateEntry = (cowId: string, field: keyof CowMilkingEntry, value: string | boolean) => {
    setEntries(prev => prev.map(entry => 
      entry.cowId === cowId 
        ? { ...entry, [field]: value }
        : entry
    ));
  };

  // Calculate row total
  const calculateRowTotal = (entry: CowMilkingEntry): number => {
    const s1 = parseFloat(entry.session1) || 0;
    const s2 = parseFloat(entry.session2) || 0;
    const s3 = parseFloat(entry.session3) || 0;
    return s1 + s2 + s3;
  };

  // Copy from previous day
  const copyFromPreviousDay = async () => {
    const prevDate = new Date(selectedDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    try {
      // Use milking data from context instead of fetching
      const prevMilking = milking.filter((m: MilkingRecord) => m.date === prevDateStr);

      const newEntries = lactatingCows.map(cow => {
        const cowRecords = prevMilking.filter((m: MilkingRecord) => m.cowId === cow.id);
        let session1 = '', session2 = '', session3 = '', notes = '';

        cowRecords.forEach((record: MilkingRecord) => {
          if (record.session === 'Pagi') {
            session1 = String(record.volume);
            notes = record.notes || '';
          } else if (record.session === 'Siang') {
            session2 = String(record.volume);
          } else if (record.session === 'Malam') {
            session3 = String(record.volume);
          }
        });

        return {
          cowId: cow.id,
          cowName: cow.name,
          session1,
          session2,
          session3,
          notes,
        };
      });

      setEntries(newEntries);

      // Also copy environmental data
      const envRes = await fetch(`/api/environment?date=${prevDateStr}`);
      if (envRes.ok) {
        const envRecords = await envRes.json();
        if (envRecords && envRecords.length > 0) {
          const env = envRecords[0];
          setTempMin(env.tempMin || '');
          setTempMax(env.tempMax || '');
          setHumidity(env.humidity ? String(env.humidity) : '');
          setThunderstorm(env.thunderstorm || false);
          setEnvNotes(env.notes || '');
        }
      }
    } catch (error) {
      console.error('Error copying from previous day:', error);
    }
  };

  // Save all records
  const handleSave = async () => {
    setSaving(true);
    try {
      // Fetch existing records for the selected date first
      const existingRes = await fetch(`/api/milking`);
      let existingRecords = [];
      if (existingRes.ok) {
        const allRecords = await existingRes.json();
        existingRecords = allRecords.filter((r: MilkingRecord) => r.date === selectedDate);
      }

      // Save milking records
      const savePromises: Promise<Response>[] = [];

      entries.forEach(entry => {
        // Save each session as a separate record
        SESSIONS.forEach((session, index) => {
          const volume = index === 0 ? entry.session1 : index === 1 ? entry.session2 : entry.session3;

          if (volume && parseFloat(volume) > 0) {
            // Check if record already exists for this cow/date/session
            const existingRecord = existingRecords.find(
              (r: MilkingRecord) => r.cowId === entry.cowId && r.session === session
            );

            const recordData = {
              cowId: entry.cowId,
              cowName: entry.cowName,
              date: selectedDate,
              session: session,
              volume: parseFloat(volume),
              fat: 0,
              protein: 0,
              notes: entry.notes || null, // Always include notes for all sessions
            };

            if (existingRecord) {
              // Update existing record
              savePromises.push(
                fetch('/api/milking', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...recordData,
                    id: existingRecord.id,
                  }),
                })
              );
            } else {
              // Create new record
              const recordId = `M-${Date.now()}-${entry.cowId}-${session}`;
              savePromises.push(
                fetch('/api/milking', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...recordData,
                    id: recordId,
                  }),
                })
              );
            }
          }
        });
      });

      await Promise.all(savePromises);

      // Save environmental data
      const envData = {
        date: selectedDate,
        tempMin: tempMin ? parseFloat(tempMin) : null,
        tempMax: tempMax ? parseFloat(tempMax) : null,
        humidity: humidity ? parseInt(humidity) : null,
        thunderstorm: thunderstorm,
        notes: envNotes || null,
      };

      await fetch('/api/environment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envData),
      });

      // Refresh data
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (error) {
      console.error('Error saving records:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate daily totals
  const dailyTotal = entries.reduce((sum, entry) => sum + calculateRowTotal(entry), 0);
  const cowsWithProduction = entries.filter(e => calculateRowTotal(e) > 0).length;
  const avgProduction = cowsWithProduction > 0 ? dailyTotal / cowsWithProduction : 0;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 6,
    border: '1.5px solid #d6cbba',
    background: '#faf7f2',
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#3a2e20',
    outline: 'none',
    boxSizing: 'border-box',
    textAlign: 'right',
  };

  const notesInputStyle: React.CSSProperties = {
    ...inputStyle,
    textAlign: 'left',
  };

  return (
    <div style={{ background: '#fffef9', borderRadius: 12, padding: 20, border: '1px solid #e8dcc8' }}>
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 14, color: '#8a7d6b', fontWeight: 500 }}>Tanggal:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            style={{
              ...inputStyle,
              width: 'auto',
              textAlign: 'center',
              fontWeight: 600,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button 
            variant="secondary" 
            onClick={copyFromPreviousDay}
            style={{ fontSize: 13, padding: '10px 18px' }}
          >
            📋 Salin dari Hari Sebelumnya
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || loading}
            style={{ fontSize: 13, padding: '10px 24px' }}
          >
            {saving ? 'Menyimpan...' : '💾 Simpan Semua'}
          </Button>
        </div>
      </div>

      {/* Environmental Data Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f5f0e8 0%, #e8dcc8 100%)', 
        borderRadius: 10, 
        padding: 16, 
        marginBottom: 20,
        border: '1px solid #d6cbba'
      }}>
        <div style={{ fontSize: 13, color: '#5a4a3a', fontWeight: 600, marginBottom: 12 }}>
          🌡️ Data Lingkungan
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: '#8a7d6b', display: 'block', marginBottom: 4 }}>Suhu Min (°C)</label>
            <input
              type="number"
              value={tempMin}
              onChange={e => setTempMin(e.target.value)}
              placeholder="-"
              style={{ ...inputStyle, textAlign: 'center' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#8a7d6b', display: 'block', marginBottom: 4 }}>Suhu Max (°C)</label>
            <input
              type="number"
              value={tempMax}
              onChange={e => setTempMax(e.target.value)}
              placeholder="-"
              style={{ ...inputStyle, textAlign: 'center' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#8a7d6b', display: 'block', marginBottom: 4 }}>Kelembaban (%)</label>
            <input
              type="number"
              value={humidity}
              onChange={e => setHumidity(e.target.value)}
              placeholder="-"
              style={{ ...inputStyle, textAlign: 'center' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: '#8a7d6b', display: 'block', marginBottom: 4 }}>THI</label>
            <div style={{ 
              ...inputStyle, 
              textAlign: 'center',
              background: tempMax && humidity ? '#e8f5e9' : '#faf7f2',
              fontWeight: 600,
            }}>
              {tempMax && humidity ? calculateTHI(parseFloat(tempMax), parseInt(humidity)).toFixed(1) : '-'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="thunderstorm"
              checked={thunderstorm}
              onChange={e => setThunderstorm(e.target.checked)}
              style={{ width: 18, height: 18, cursor: 'pointer' }}
            />
            <label htmlFor="thunderstorm" style={{ fontSize: 12, color: '#5a4a3a', cursor: 'pointer' }}>
              ⛈️ Hujan Badai
            </label>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 11, color: '#8a7d6b', display: 'block', marginBottom: 4 }}>Catatan Lingkungan</label>
          <input
            type="text"
            value={envNotes}
            onChange={e => setEnvNotes(e.target.value)}
            placeholder="Catatan kondisi lingkungan..."
            style={{ ...notesInputStyle, width: '100%' }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{ 
        display: 'flex', 
        gap: 16, 
        marginBottom: 16, 
        flexWrap: 'wrap',
        padding: '12px 16px',
        background: '#f0e6d8',
        borderRadius: 8,
      }}>
        <div style={{ fontSize: 13, color: '#5a4a3a' }}>
          <span style={{ fontWeight: 600, color: '#2e2416' }}>{dailyTotal.toFixed(1)} L</span> Total Produksi
        </div>
        <div style={{ fontSize: 13, color: '#5a4a3a' }}>
          <span style={{ fontWeight: 600, color: '#2e2416' }}>{cowsWithProduction}</span> Sapi Memproduksi
        </div>
        <div style={{ fontSize: 13, color: '#5a4a3a' }}>
          <span style={{ fontWeight: 600, color: '#2e2416' }}>{avgProduction.toFixed(1)} L</span> Rata-rata/Sapi
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse',
          fontSize: 13,
        }}>
          <thead>
            <tr style={{ background: '#2e2416', color: '#f5f0e8' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 50 }}>No</th>
              <th style={{ padding: '12px 10px', textAlign: 'left' }}>Nama</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 100 }}>Perahan 1<br/><span style={{ fontSize: 10, opacity: 0.8 }}>(Pagi)</span></th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 100 }}>Perahan 2<br/><span style={{ fontSize: 10, opacity: 0.8 }}>(Siang)</span></th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 100 }}>Perahan 3<br/><span style={{ fontSize: 10, opacity: 0.8 }}>(Malam)</span></th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: 90 }}>Total (L)</th>
              <th style={{ padding: '12px 10px', textAlign: 'left', width: 200 }}>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => {
              const total = calculateRowTotal(entry);
              return (
                <tr 
                  key={entry.cowId}
                  style={{ 
                    background: index % 2 === 0 ? '#faf7f2' : '#fff',
                    borderBottom: '1px solid #e8dcc8',
                  }}
                >
                  <td style={{ padding: '10px', textAlign: 'center', color: '#8a7d6b' }}>{index + 1}</td>
                  <td style={{ padding: '10px', fontWeight: 500, color: '#3a2e20' }}>{entry.cowName}</td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={entry.session1}
                      onChange={e => updateEntry(entry.cowId, 'session1', e.target.value)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={entry.session2}
                      onChange={e => updateEntry(entry.cowId, 'session2', e.target.value)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="number"
                      step="0.1"
                      value={entry.session3}
                      onChange={e => updateEntry(entry.cowId, 'session3', e.target.value)}
                      placeholder="0"
                      style={inputStyle}
                    />
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: 600, color: total > 0 ? '#2e7d32' : '#8a7d6b' }}>
                    {total > 0 ? total.toFixed(1) : '-'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <input
                      type="text"
                      value={entry.notes}
                      onChange={e => updateEntry(entry.cowId, 'notes', e.target.value)}
                      placeholder="Catatan..."
                      style={notesInputStyle}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
          {entries.length > 0 && (
            <tfoot>
              <tr style={{ background: '#e8dcc8', fontWeight: 600 }}>
                <td colSpan={5} style={{ padding: '12px 10px', textAlign: 'right', color: '#2e2416' }}>TOTAL HARIAN:</td>
                <td style={{ padding: '12px 10px', textAlign: 'center', color: '#2e7d32', fontSize: 15 }}>
                  {dailyTotal.toFixed(1)} L
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {entries.length === 0 && !loading && (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          color: '#8a7d6b',
          fontSize: 14,
        }}>
          Tidak ada sapi laktasi untuk ditampilkan.
        </div>
      )}

      {loading && (
        <div style={{ 
          padding: 40, 
          textAlign: 'center', 
          color: '#8a7d6b',
          fontSize: 14,
        }}>
          Memuat data...
        </div>
      )}
    </div>
  );
}
