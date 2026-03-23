'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Cow, ETYPES, FarmEvent } from '@/types';

interface EventFormData {
  cowId: string;
  date: string;
  type: string;
  description: string;
  vet: string;
  followUp: string;
}

interface AddEventFormProps {
  formData: EventFormData;
  onChange: (data: EventFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  cows: Cow[];
  initialData?: FarmEvent | null;
}

export function AddEventForm({ formData, onChange, onSubmit, onCancel, cows, initialData }: AddEventFormProps) {
  const updateField = (field: keyof EventFormData, value: string) => {
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
          {cows.map(cow => (
            <option key={cow.id} value={cow.id}>{cow.name} ({cow.id})</option>
          ))}
        </select>
      </Field>
      <Field label="Jenis Kegiatan">
        <select
          style={selectStyle}
          value={formData.type}
          onChange={e => updateField('type', e.target.value)}
        >
          {ETYPES.map(t => <option key={t}>{t}</option>)}
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
      <Field label="Deskripsi *" col={2}>
        <textarea
          style={{ ...inputStyle, resize: 'vertical' }}
          rows={3}
          value={formData.description}
          onChange={e => updateField('description', e.target.value)}
          placeholder="Jelaskan kegiatan secara detail..."
        />
      </Field>
      <Field label="Dokter Hewan / Petugas">
        <input
          style={inputStyle}
          value={formData.vet}
          onChange={e => updateField('vet', e.target.value)}
          placeholder="drh. Nama"
        />
      </Field>
      <Field label="Tanggal Tindak Lanjut">
        <input
          style={inputStyle}
          type="date"
          value={formData.followUp}
          onChange={e => updateField('followUp', e.target.value)}
        />
      </Field>
      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        <Button variant="secondary" onClick={onCancel}>Batal</Button>
        <Button onClick={onSubmit}>{isEdit ? 'Simpan Perubahan' : 'Catat Kegiatan'}</Button>
      </div>
    </div>
  );
}
