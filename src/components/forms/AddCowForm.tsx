'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { BREEDS, STATUSES } from '@/types';

interface CowFormData {
  name: string;
  tag: string;
  breed: string;
  gender: 'Female' | 'Male';
  dob: string;
  weight: string;
  status: string;
  sire: string;
  dam: string;
}

interface AddCowFormProps {
  formData: CowFormData;
  onChange: (data: CowFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function AddCowForm({ formData, onChange, onSubmit, onCancel }: AddCowFormProps) {
  const updateField = (field: keyof CowFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const inputStyle = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: 8,
    border: '1.5px solid #d6cbba',
    background: '#faf7f2',
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#3a2e20',
    outline: 'none',
    boxSizing: 'border-box',
  } as React.CSSProperties;

  const selectStyle = {
    ...inputStyle,
    appearance: 'none',
    cursor: 'pointer',
  } as React.CSSProperties;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Field label="Name *">
        <input
          style={inputStyle}
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="e.g. Mentari"
        />
      </Field>
      <Field label="Ear Tag *">
        <input
          style={inputStyle}
          value={formData.tag}
          onChange={e => updateField('tag', e.target.value)}
          placeholder="e.g. FH-4821"
        />
      </Field>
      <Field label="Breed">
        <select
          style={selectStyle}
          value={formData.breed}
          onChange={e => updateField('breed', e.target.value)}
        >
          {BREEDS.map(b => <option key={b}>{b}</option>)}
        </select>
      </Field>
      <Field label="Gender">
        <select
          style={selectStyle}
          value={formData.gender}
          onChange={e => updateField('gender', e.target.value as 'Female' | 'Male')}
        >
          <option>Female</option>
          <option>Male</option>
        </select>
      </Field>
      <Field label="Date of Birth *">
        <input
          style={inputStyle}
          type="date"
          value={formData.dob}
          onChange={e => updateField('dob', e.target.value)}
        />
      </Field>
      <Field label="Weight (kg)">
        <input
          style={inputStyle}
          type="number"
          value={formData.weight}
          onChange={e => updateField('weight', e.target.value)}
          placeholder="e.g. 480"
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
      <Field label="Sire (Father)">
        <input
          style={inputStyle}
          value={formData.sire}
          onChange={e => updateField('sire', e.target.value)}
          placeholder="Bull ID or name"
        />
      </Field>
      <Field label="Dam (Mother)" col={2}>
        <input
          style={inputStyle}
          value={formData.dam}
          onChange={e => updateField('dam', e.target.value)}
          placeholder="Cow ID or name"
        />
      </Field>
      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit}>Register Cow</Button>
      </div>
    </div>
  );
}
