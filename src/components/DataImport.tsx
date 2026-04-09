'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';

interface DataImportProps {
  onComplete: () => void;
}

export function DataImport({ onComplete }: DataImportProps) {
  const [showModal, setShowModal] = useState(false);
  const [importType, setImportType] = useState<'cows' | 'milking' | 'events'>('cows');
  const [csvData, setCsvData] = useState('');
  const [preview, setPreview] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; skipped: number; errors: string[] } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);

      // Parse CSV for preview
      const lines = text.trim().split('\n');
      if (lines.length > 0) {
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const dataRows = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: any = {};
          headers.forEach((h, i) => { row[h] = values[i] || ''; });
          return row;
        });
        setPreview(dataRows);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData.trim()) return;

    setImporting(true);
    setImportResult(null);

    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        setImportResult({ success: 0, skipped: 0, errors: ['No data rows found'] });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const dataRows = lines.slice(1).map(line => {
        const values = parseCSVLine(line);
        const row: any = {};
        headers.forEach((h, i) => { row[h] = values[i] || ''; });
        return row;
      });

      let success = 0;
      let skipped = 0;
      const errors: string[] = [];

      for (const row of dataRows) {
        try {
          if (importType === 'cows') {
            // Check if cow already exists by tag
            if (!row['Nama'] || !row['Tag']) {
              errors.push(`Row ${success + skipped + 1}: Missing Nama or Tag`);
              skipped++;
              continue;
            }

            const statusMap: Record<string, string> = {
              'Laktasi': 'Laktasi',
              'Kering': 'Kering',
              'Hamil': 'Hamil',
              'Aktif': 'Aktif',
              'Karantina': 'Karantina',
              'Terjual': 'Terjual',
            };

            const payload = {
              id: `cow_import_${Date.now()}_${success}`,
              name: row['Nama'] || row['Name'] || `Cow-${success + 1}`,
              breed: row['Breed'] || 'Friesian Holstein',
              dob: row['DOB'] || row['Tanggal Lahir'] || '2024-01-01',
              gender: row['Gender'] || row['Jenis Kelamin'] || 'Betina',
              weight: parseInt(row['Berat'] || row['Weight'] || '400') || 400,
              status: statusMap[row['Status']] || 'Aktif',
              tag: row['Tag'] || `TAG-${Date.now()}-${success}`,
              sire: row['Sire'] || row['Ayah'] || '',
              dam: row['Dam'] || row['Ibu'] || '',
              length: row['Panjang'] ? parseInt(row['Panjang']) : undefined,
              chestCircumference: row['Lingkar Dada'] ? parseInt(row['Lingkar Dada']) : undefined,
              reproductiveNotes: row['Keterangan'] || row['Notes'] || '',
            };

            const res = await fetch('/api/cows', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              success++;
            } else {
              const err = await res.json();
              errors.push(`Row ${success + skipped + 1}: ${err.error || 'Unknown error'}`);
              skipped++;
            }
          } else if (importType === 'milking') {
            // Parse milking records from CSV
            if (!row['CowId'] || !row['Date'] || !row['Volume']) {
              errors.push(`Row ${success + skipped + 1}: Missing required fields`);
              skipped++;
              continue;
            }

            const payload = {
              id: `milking_import_${Date.now()}_${success}`,
              cowId: row['CowId'],
              cowName: row['CowName'] || '',
              date: row['Date'],
              session: row['Session'] || 'Pagi',
              volume: parseFloat(row['Volume']) || 0,
              fat: parseFloat(row['Fat'] || '3.5') || 3.5,
              protein: parseFloat(row['Protein'] || '3.0') || 3.0,
              lactose: row['Lactose'] ? parseFloat(row['Lactose']) : undefined,
              totalSolids: row['TotalSolids'] ? parseFloat(row['TotalSolids']) : undefined,
              notes: row['Notes'] || '',
            };

            const res = await fetch('/api/milking', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              success++;
            } else {
              const err = await res.json();
              errors.push(`Row ${success + skipped + 1}: ${err.error || 'Unknown error'}`);
              skipped++;
            }
          } else if (importType === 'events') {
            if (!row['CowId'] || !row['Date'] || !row['Type']) {
              errors.push(`Row ${success + skipped + 1}: Missing required fields`);
              skipped++;
              continue;
            }

            const payload = {
              id: `event_import_${Date.now()}_${success}`,
              cowId: row['CowId'],
              cowName: row['CowName'] || '',
              date: row['Date'],
              type: row['Type'],
              description: row['Description'] || '',
              vet: row['Vet'] || '-',
              followUp: row['FollowUp'] || '-',
            };

            const res = await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              success++;
            } else {
              const err = await res.json();
              errors.push(`Row ${success + skipped + 1}: ${err.error || 'Unknown error'}`);
              skipped++;
            }
          }
        } catch (err: any) {
          errors.push(`Row ${success + skipped + 1}: ${err.message}`);
          skipped++;
        }
      }

      setImportResult({ success, skipped, errors });
      if (success > 0) onComplete();
    } catch (error: any) {
      setImportResult({ success: 0, skipped: 0, errors: [error.message || 'Import failed'] });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templates: Record<string, string> = {
      cows: 'Nama,Breed,DOB,Gender,Berat,Status,Tag,Sire,Dam,Panjang,Lingkar Dada,Keterangan\nGarut 1,Friesian Holstein,2020-03-12,Betina,480,Laktasi,FH-4821,Bumi Sr.,Daisy,150,201,M4 M5 dara\n',
      milking: 'CowId,CowName,Date,Session,Volume,Fat,Protein,Lactose,TotalSolids,Notes\nC-001,Garut 1,2024-03-20,Pagi,12.5,3.8,3.2,4.6,12.8,Fresh session\n',
      events: 'CowId,CowName,Date,Type,Description,Vet,FollowUp\nC-001,Garut 1,2024-03-20,Pemeriksaan Kesehatan,Routine checkup,drh. Santoso,2024-04-20\n',
    };

    const blob = new Blob([templates[importType]], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template_${importType}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setShowModal(true)} style={{ fontSize: 13, padding: '10px 18px' }}>
        📥 Import Data
      </Button>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setImportResult(null); setPreview([]); setCsvData(''); }} title="Import Data dari CSV">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Import Type Selection */}
          <div>
            <label className="field-label">Tipe Data</label>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {(['cows', 'milking', 'events'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => { setImportType(type); setPreview([]); setCsvData(''); setImportResult(null); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: importType === type ? '#8b5a2b' : '#f0ead8',
                    color: importType === type ? '#fff' : '#8a7d6b',
                    fontWeight: 600,
                    fontSize: 'var(--fs-sm)',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'cows' ? '🐄 Ternak' : type === 'milking' ? '🥛 Pemerahan' : '📋 Kegiatan'}
                </button>
              ))}
            </div>
          </div>

          {/* Download Template */}
          <div style={{ padding: 12, background: '#f0f4f8', borderRadius: 8 }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: '#666', marginBottom: 8 }}>
              📄 Download template CSV untuk format yang benar:
            </div>
            <Button variant="secondary" onClick={downloadTemplate} style={{ fontSize: 12, padding: '6px 12px' }}>
              Download Template {importType === 'cows' ? 'Ternak' : importType === 'milking' ? 'Pemerahan' : 'Kegiatan'}
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <label className="field-label">Upload File CSV</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              style={{
                padding: 12,
                border: '2px dashed #d6cbba',
                borderRadius: 8,
                width: '100%',
                background: '#faf7f2',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <label className="field-label">Preview Data ({preview.length} baris pertama)</label>
              <div style={{ overflowX: 'auto', maxHeight: 200, border: '1px solid #e8dcc8', borderRadius: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: '#f5f0e8' }}>
                      {Object.keys(preview[0]).map(h => (
                        <th key={h} style={{ padding: '6px 8px', textAlign: 'left', borderBottom: '1px solid #e8dcc8' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#faf7f2' }}>
                        {Object.values(row).map((v: any, j) => (
                          <td key={j} style={{ padding: '6px 8px', borderBottom: '1px solid #f0e8da' }}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Button */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              onClick={() => { setShowModal(false); setImportResult(null); setPreview([]); setCsvData(''); }}
              variant="secondary"
            >
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!csvData || importing}
              variant="primary"
            >
              {importing ? 'Mengimport...' : '📥 Import Data'}
            </Button>
          </div>

          {/* Import Result */}
          {importResult && (
            <div style={{
              padding: 16,
              borderRadius: 8,
              background: importResult.success > 0 ? '#dcfce7' : '#fee2e2',
              border: `1px solid ${importResult.success > 0 ? '#86efac' : '#fca5a5'}`,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>
                {importResult.success > 0 ? '✅ Import Selesai' : '❌ Import Gagal'}
              </div>
              <div style={{ fontSize: 'var(--fs-sm)', color: '#5a4a3a' }}>
                Berhasil: <strong>{importResult.success}</strong> | Dilewati: <strong>{importResult.skipped}</strong>
              </div>
              {importResult.errors.length > 0 && (
                <div style={{ marginTop: 8, maxHeight: 150, overflowY: 'auto' }}>
                  <div style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: '#c0392b', marginBottom: 4 }}>Error:</div>
                  {importResult.errors.slice(0, 10).map((err, i) => (
                    <div key={i} style={{ fontSize: 11, color: '#c0392b', fontFamily: 'monospace' }}>{err}</div>
                  ))}
                  {importResult.errors.length > 10 && (
                    <div style={{ fontSize: 11, color: '#8a7d6b' }}>...dan {importResult.errors.length - 10} error lainnya</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}

/**
 * Parse a CSV line respecting quoted fields
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}
