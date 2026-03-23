'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { Cow, SESSIONS } from '@/types';

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
}

export function AddMilkingForm({ formData, onChange, onSubmit, onCancel, femaleCows }: AddMilkingFormProps) {
  const updateField = (field: keyof MilkingFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  const inputStyle: React.CSSProperties = {
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
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Field label="Select Cow *" col={2}>
        <select 
          style={selectStyle} 
          value={formData.cowId} 
          onChange={e => updateField('cowId', e.target.value)}
        >
          <option value="">— choose cow —</option>
          {femaleCows.map(cow => (
            <option key={cow.id} value={cow.id}>{cow.name} ({cow.id})</option>
          ))}
        </select>
      </Field>
      <Field label="Date">
        <input 
          style={inputStyle} 
          type="date" 
          value={formData.date} 
          onChange={e => updateField('date', e.target.value)} 
        />
      </Field>
      <Field label="Session">
        <select 
          style={selectStyle} 
          value={formData.session} 
          onChange={e => updateField('session', e.target.value)}
        >
          {SESSIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Volume (Liters) *">
        <input 
          style={inputStyle} 
          type="number" 
          value={formData.volume} 
          onChange={e => updateField('volume', e.target.value)} 
          placeholder="e.g. 12.5" 
        />
      </Field>
      <Field label="Fat Content (%)">
        <input 
          style={inputStyle} 
          type="number" 
          value={formData.fat} 
          onChange={e => updateField('fat', e.target.value)} 
          placeholder="e.g. 3.8" 
        />
      </Field>
      <Field label="Protein (%)" col={2}>
        <input 
          style={inputStyle} 
          type="number" 
          value={formData.protein} 
          onChange={e => updateField('protein', e.target.value)} 
          placeholder="e.g. 3.2" 
        />
      </Field>
      <Field label="Notes" col={2}>
        <textarea 
          style={{ ...inputStyle, resize: 'vertical' }} 
          rows={2} 
          value={formData.notes} 
          onChange={e => updateField('notes', e.target.value)} 
          placeholder="Any observations..." 
        />
      </Field>
      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSubmit}>Save Record</Button>
      </div>
    </div>
  );
}
