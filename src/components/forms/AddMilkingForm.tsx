'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Cow, SESSIONS, MilkingRecord } from '@/types';

// Quality range definitions
const QUALITY_RANGES = {
  fat: { min: 3.0, max: 5.0, label: 'Kadar Lemak' },
  protein: { min: 2.8, max: 4.0, label: 'Protein' },
  lactose: { min: 4.5, label: 'Laktosa' }, // min only
  totalSolids: { min: 12.0, max: 14.0, label: 'Total Solids' },
};

type QualityStatus = 'ok' | 'warning' | 'error';

interface QualityCheck {
  status: QualityStatus;
  message: string;
  borderColor: string;
}

function checkQuality(value: string, field: keyof typeof QUALITY_RANGES): QualityCheck | null {
  if (!value || value.trim() === '') return null;

  const num = parseFloat(value);
  if (isNaN(num)) return null;

  const range = QUALITY_RANGES[field];
  const hasMax = 'max' in range && range.max !== undefined;
  const min = range.min;
  const max = hasMax ? (range as { min: number; max: number }).max : Infinity;

  // Check if within normal range
  if (num >= min && num <= max) {
    return { status: 'ok', message: '✅ Normal', borderColor: '#2e7d32' };
  }

  // Calculate how far outside range
  let deviation = 0;
  if (num < min) {
    deviation = (min - num) / min;
  } else if (hasMax && num > max) {
    deviation = (num - max) / max;
  }

  // Error: > 15% outside range, Warning: <= 15%
  if (deviation > 0.15) {
    const direction = num < min ? 'below' : 'above';
    return {
      status: 'error',
      message: `🔴 ${direction} normal range`,
      borderColor: '#c0392b',
    };
  }

  const direction = num < min ? 'below' : 'above';
  return {
    status: 'warning',
    message: `⚠️ Slightly ${direction} normal`,
    borderColor: '#f57c00',
  };
}

interface MilkingFormData {
  cowId: string;
  date: string;
  session: string;
  volume: string;
  fat: string;
  protein: string;
  lactose: string;
  totalSolids: string;
  notes: string;
}

interface AddMilkingFormProps {
  formData: MilkingFormData;
  onChange: (data: MilkingFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  femaleCows: Cow[];
  initialData?: MilkingRecord | null;
}

export function AddMilkingForm({ formData, onChange, onSubmit, onCancel, femaleCows, initialData }: AddMilkingFormProps) {
  const updateField = (field: keyof MilkingFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1.5px solid #d6cbba',
    background: '#faf7f2',
    fontFamily: 'monospace',
    fontSize: 16,
    color: '#3a2e20',
    outline: 'none',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  const isEdit = !!initialData;

  // Compute quality checks for all quality fields
  const qualityChecks = {
    fat: checkQuality(formData.fat, 'fat'),
    protein: checkQuality(formData.protein, 'protein'),
    lactose: checkQuality(formData.lactose, 'lactose'),
    totalSolids: checkQuality(formData.totalSolids, 'totalSolids'),
  };

  // Check if any quality values are out of range
  const hasQualityWarnings = Object.values(qualityChecks).some(
    (check) => check && check.status !== 'ok'
  );

  // Get summary of out-of-range metrics
  const outOfRangeMetrics = Object.entries(qualityChecks)
    .filter(([, check]) => check && check.status !== 'ok')
    .map(([field, check]) => {
      const label = QUALITY_RANGES[field as keyof typeof QUALITY_RANGES].label;
      return `${label}: ${check!.message}`;
    });

  // Determine alert severity
  const hasErrors = Object.values(qualityChecks).some(
    (check) => check && check.status === 'error'
  );

  return (
    <div>
      {/* Quality Alert Summary */}
      {hasQualityWarnings && (
        <div
          style={{
            marginBottom: 16,
            padding: '12px 16px',
            borderRadius: 8,
            background: hasErrors ? '#ffebee' : '#fff3e0',
            border: `1px solid ${hasErrors ? '#c0392b' : '#f57c00'}`,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: hasErrors ? '#c0392b' : '#f57c00',
              marginBottom: 6,
            }}
          >
            ⚠️ Quality Alert
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: '#5a4a3a' }}>
            {outOfRangeMetrics.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Pilih Sapi *" col={2}>
          <select
            style={selectStyle}
            value={formData.cowId}
            onChange={e => updateField('cowId', e.target.value)}
          >
            <option value="">— pilih sapi —</option>
            {femaleCows.map(cow => (
              <option key={cow.id} value={cow.id}>{cow.name} ({cow.id})</option>
            ))}
          </select>
        </Field>
        <Field label="Tanggal">
          <input
            style={inputStyle}
            type="date"
            value={formData.date}
            onChange={e => updateField('date', e.target.value)}
          />
        </Field>
        <Field label="Sesi">
          <select
            style={selectStyle}
            value={formData.session}
            onChange={e => updateField('session', e.target.value)}
          >
            {SESSIONS.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Volume (Liter) *">
          <input
            style={inputStyle}
            type="number"
            value={formData.volume}
            onChange={e => updateField('volume', e.target.value)}
            placeholder="mis. 12.5"
          />
        </Field>
        <Field label="Kadar Lemak (%)">
          <div>
            <input
              style={{
                ...inputStyle,
                borderColor: qualityChecks.fat?.borderColor || '#d6cbba',
              }}
              type="number"
              step="0.1"
              value={formData.fat}
              onChange={e => updateField('fat', e.target.value)}
              placeholder="mis. 3.8"
            />
            {qualityChecks.fat && (
              <div
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  color: qualityChecks.fat.borderColor,
                  fontWeight: 500,
                }}
              >
                {qualityChecks.fat.message}
              </div>
            )}
          </div>
        </Field>
        <Field label="Protein (%)">
          <div>
            <input
              style={{
                ...inputStyle,
                borderColor: qualityChecks.protein?.borderColor || '#d6cbba',
              }}
              type="number"
              step="0.1"
              value={formData.protein}
              onChange={e => updateField('protein', e.target.value)}
              placeholder="mis. 3.2"
            />
            {qualityChecks.protein && (
              <div
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  color: qualityChecks.protein.borderColor,
                  fontWeight: 500,
                }}
              >
                {qualityChecks.protein.message}
              </div>
            )}
          </div>
        </Field>
        <Field label="Laktosa (%)">
          <div>
            <input
              style={{
                ...inputStyle,
                borderColor: qualityChecks.lactose?.borderColor || '#d6cbba',
              }}
              type="number"
              step="0.1"
              value={formData.lactose}
              onChange={e => updateField('lactose', e.target.value)}
              placeholder="min. 4.5"
            />
            {qualityChecks.lactose && (
              <div
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  color: qualityChecks.lactose.borderColor,
                  fontWeight: 500,
                }}
              >
                {qualityChecks.lactose.message}
              </div>
            )}
          </div>
        </Field>
        <Field label="Total Solids (%)">
          <div>
            <input
              style={{
                ...inputStyle,
                borderColor: qualityChecks.totalSolids?.borderColor || '#d6cbba',
              }}
              type="number"
              step="0.1"
              value={formData.totalSolids}
              onChange={e => updateField('totalSolids', e.target.value)}
              placeholder="12.5-13.5"
            />
            {qualityChecks.totalSolids && (
              <div
                style={{
                  fontSize: 11,
                  marginTop: 4,
                  color: qualityChecks.totalSolids.borderColor,
                  fontWeight: 500,
                }}
              >
                {qualityChecks.totalSolids.message}
              </div>
            )}
          </div>
        </Field>
        <Field label="Catatan" col={2}>
          <textarea
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={2}
            value={formData.notes}
            onChange={e => updateField('notes', e.target.value)}
            placeholder="Catatan atau observasi..."
          />
        </Field>
        <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
          <Button variant="secondary" onClick={onCancel}>Batal</Button>
          <Button onClick={onSubmit}>{isEdit ? 'Simpan Perubahan' : 'Simpan'}</Button>
        </div>
      </div>
    </div>
  );
}
