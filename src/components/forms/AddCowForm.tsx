'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { BREEDS, STATUSES, Cow } from '@/types';

interface CowFormData {
  name: string;
  tag: string;
  breed: string;
  gender: 'Betina' | 'Jantan';
  dob: string;
  weight: string;
  status: string;
  sire: string;
  dam: string;
  length: string;
  chestCircumference: string;
  reproductiveNotes: string;
}

interface AddCowFormProps {
  formData: CowFormData;
  onChange: (data: CowFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  initialData?: Cow | null;
}

export function AddCowForm({ formData, onChange, onSubmit, onCancel, initialData }: AddCowFormProps) {
  const updateField = (field: keyof CowFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const inputStyle = {
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
  } as React.CSSProperties;

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
  } as React.CSSProperties;

  const isEdit = !!initialData;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Field label="Nama *">
        <input
          style={inputStyle}
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="mis. Mentari"
        />
      </Field>
      <Field label="Nomor Ears Tag *">
        <input
          style={inputStyle}
          value={formData.tag}
          onChange={e => updateField('tag', e.target.value)}
          placeholder="mis. FH-4821"
        />
      </Field>
      <Field label="Jenis">
        <select
          style={selectStyle}
          value={formData.breed}
          onChange={e => updateField('breed', e.target.value)}
        >
          {BREEDS.map(b => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Jenis Kelamin">
        <select
          style={selectStyle}
          value={formData.gender}
          onChange={e => updateField('gender', e.target.value as 'Betina' | 'Jantan')}
        >
          <option>Betina</option>
          <option>Jantan</option>
        </select>
      </Field>
      <Field label="Tanggal Lahir *">
        <input
          style={inputStyle}
          type="date"
          value={formData.dob}
          onChange={e => updateField('dob', e.target.value)}
        />
      </Field>
      <Field label="Berat (kg)">
        <input
          style={inputStyle}
          type="number"
          value={formData.weight}
          onChange={e => updateField('weight', e.target.value)}
          placeholder="mis. 480"
        />
      </Field>
      <Field label="Panjang Tubuh (cm)">
        <input
          style={inputStyle}
          type="number"
          value={formData.length}
          onChange={e => updateField('length', e.target.value)}
          placeholder="mis. 120"
        />
      </Field>
      <Field label="Lingkar Dada (cm)">
        <input
          style={inputStyle}
          type="number"
          value={formData.chestCircumference}
          onChange={e => updateField('chestCircumference', e.target.value)}
          placeholder="mis. 180"
        />
      </Field>
      <Field label="Status">
        <select
          style={selectStyle}
          value={formData.status}
          onChange={e => updateField('status', e.target.value)}
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Keterangan Reproduksi">
        <textarea
          style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
          value={formData.reproductiveNotes}
          onChange={e => updateField('reproductiveNotes', e.target.value)}
          placeholder="mis: M4, M5 dara, AB1, AB3 hamil, AB5 keguguran..."
        />
      </Field>
      <Field label="Sire (Ayah)">
        <input
          style={inputStyle}
          value={formData.sire}
          onChange={e => updateField('sire', e.target.value)}
          placeholder="ID atau nama pejantan"
        />
      </Field>
      <Field label="Dam (Ibu)" col={2}>
        <input
          style={inputStyle}
          value={formData.dam}
          onChange={e => updateField('dam', e.target.value)}
          placeholder="ID atau nama sapi betina"
        />
      </Field>
      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        <Button variant="secondary" onClick={onCancel}>Batal</Button>
        <Button onClick={onSubmit}>{isEdit ? 'Simpan Perubahan' : 'Daftarkan Sapi'}</Button>
      </div>
    </div>
  );
}
