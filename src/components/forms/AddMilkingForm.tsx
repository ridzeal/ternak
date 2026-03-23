'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Cow, SESSIONS, MilkingRecord } from '@/types';

interface MilkingFormData {
  cowId: string;
  date: string;
  session: string;
  volume: string;
  fat: string;
  protein: string;
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

  return (
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
        <input
          style={inputStyle}
          type="number"
          value={formData.fat}
          onChange={e => updateField('fat', e.target.value)}
          placeholder="mis. 3.8"
        />
      </Field>
      <Field label="Protein (%)" col={2}>
        <input
          style={inputStyle}
          type="number"
          value={formData.protein}
          onChange={e => updateField('protein', e.target.value)}
          placeholder="mis. 3.2"
        />
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
  );
}
