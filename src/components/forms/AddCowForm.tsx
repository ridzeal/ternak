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
  onDelete?: () => void;
  initialData?: Cow | null;
  readOnly?: boolean;
}

export function AddCowForm({ formData, onChange, onSubmit, onCancel, onDelete, initialData, readOnly = false }: AddCowFormProps) {
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

  const readOnlyStyle = {
    ...inputStyle,
    background: '#f0e4d0',
    cursor: 'not-allowed',
    color: '#8a7d6b',
  } as React.CSSProperties;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Field label="Nama *">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="mis. Mentari"
          readOnly={readOnly}
        />
      </Field>
      <Field label="Nomor Ears Tag *">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.tag}
          onChange={e => updateField('tag', e.target.value)}
          placeholder="mis. FH-4821"
          readOnly={readOnly}
        />
      </Field>
      <Field label="Jenis">
        <select
          style={readOnly ? readOnlyStyle : selectStyle}
          value={formData.breed}
          onChange={e => updateField('breed', e.target.value)}
          disabled={readOnly}
        >
          {BREEDS.map(b => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Jenis Kelamin">
        <select
          style={readOnly ? readOnlyStyle : selectStyle}
          value={formData.gender}
          onChange={e => updateField('gender', e.target.value as 'Betina' | 'Jantan')}
          disabled={readOnly}
        >
          <option>Betina</option>
          <option>Jantan</option>
        </select>
      </Field>
      <Field label="Tanggal Lahir *">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="date"
          value={formData.dob}
          onChange={e => updateField('dob', e.target.value)}
          readOnly={readOnly}
        />
      </Field>
      <Field label="Berat (kg)">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="number"
          value={formData.weight}
          onChange={e => updateField('weight', e.target.value)}
          placeholder="mis. 480"
          readOnly={readOnly}
        />
      </Field>
      <Field label="Panjang Tubuh (cm)">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="number"
          value={formData.length}
          onChange={e => updateField('length', e.target.value)}
          placeholder="mis. 120"
          readOnly={readOnly}
        />
      </Field>
      <Field label="Lingkar Dada (cm)">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="number"
          value={formData.chestCircumference}
          onChange={e => updateField('chestCircumference', e.target.value)}
          placeholder="mis. 180"
          readOnly={readOnly}
        />
      </Field>
      <Field label="Status">
        <select
          style={readOnly ? readOnlyStyle : selectStyle}
          value={formData.status}
          onChange={e => updateField('status', e.target.value)}
          disabled={readOnly}
        >
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Keterangan Reproduksi">
        <textarea
          style={{ ...(readOnly ? readOnlyStyle : inputStyle), minHeight: 80, resize: 'vertical' }}
          value={formData.reproductiveNotes}
          onChange={e => updateField('reproductiveNotes', e.target.value)}
          placeholder="mis: M4, M5 dara, AB1, AB3 hamil, AB5 keguguran..."
          readOnly={readOnly}
        />
      </Field>
      <Field label="Sire (Ayah)">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.sire}
          onChange={e => updateField('sire', e.target.value)}
          placeholder="ID atau nama pejantan"
          readOnly={readOnly}
        />
      </Field>
      <Field label="Dam (Ibu)" col={2}>
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.dam}
          onChange={e => updateField('dam', e.target.value)}
          placeholder="ID atau nama sapi betina"
          readOnly={readOnly}
        />
      </Field>
      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        {isEdit && !readOnly && onDelete && (
          <Button 
            onClick={onDelete} 
            style={{ background: '#c0392b', marginRight: 'auto' }}
          >
            🗑️ Hapus
          </Button>
        )}
        {!readOnly && (
          <Button onClick={onSubmit}>{isEdit ? 'Simpan Perubahan' : 'Daftarkan Sapi'}</Button>
        )}
      </div>
    </div>
  );
}
