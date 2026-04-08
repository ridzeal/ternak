'use client';

import React, { useState, useEffect } from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { MilkCollection } from '@/types';
import { todayStr } from '@/lib/utils';

interface MilkCollectionFormProps {
  onSubmitComplete?: () => void;
  onCancel?: () => void;
  initialData?: MilkCollection | null;
}

interface CollectionFormData {
  date: string;
  buyerName: string;
  totalQuantity: string;
  fatAverage: string;
  proteinAverage: string;
  notes: string;
}

interface FormErrors {
  date?: string;
  buyerName?: string;
  totalQuantity?: string;
}

const emptyFormData: CollectionFormData = {
  date: todayStr(),
  buyerName: '',
  totalQuantity: '',
  fatAverage: '',
  proteinAverage: '',
  notes: '',
};

export function MilkCollectionForm({ onSubmitComplete, onCancel, initialData }: MilkCollectionFormProps) {
  const [formData, setFormData] = useState<CollectionFormData>(emptyFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const isEdit = !!initialData;

  // Populate form when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        buyerName: initialData.buyerName,
        totalQuantity: String(initialData.totalQuantity),
        fatAverage: initialData.fatAverage ? String(initialData.fatAverage) : '',
        proteinAverage: initialData.proteinAverage ? String(initialData.proteinAverage) : '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  const updateField = (field: keyof CollectionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.date) {
      newErrors.date = 'Tanggal wajib diisi';
    }
    if (!formData.buyerName.trim()) {
      newErrors.buyerName = 'Nama pembeli wajib diisi';
    }
    if (!formData.totalQuantity || parseFloat(formData.totalQuantity) <= 0) {
      newErrors.totalQuantity = 'Jumlah harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        date: formData.date,
        buyerName: formData.buyerName.trim(),
        totalQuantity: parseFloat(formData.totalQuantity),
        fatAverage: formData.fatAverage ? parseFloat(formData.fatAverage) : undefined,
        proteinAverage: formData.proteinAverage ? parseFloat(formData.proteinAverage) : undefined,
        notes: formData.notes.trim() || undefined,
      };

      const url = '/api/milk-collection';
      const method = isEdit ? 'PUT' : 'POST';
      const body = isEdit ? { ...payload, id: initialData!.id } : payload;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Gagal menyimpan data' }));
        throw new Error(error.error || 'Gagal menyimpan data');
      }

      // Reset form
      setFormData(emptyFormData);
      setErrors({});

      if (onSubmitComplete) {
        onSubmitComplete();
      }
    } catch (error) {
      console.error('Error saving milk collection:', error);
      alert(error instanceof Error ? error.message : 'Gagal menyimpan data');
    } finally {
      setSaving(false);
    }
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

  const errorBorderStyle: React.CSSProperties = {
    ...inputStyle,
    borderColor: '#c0392b',
    background: '#fff5f5',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <Field label="Tanggal *" col={2}>
        <input
          style={errors.date ? errorBorderStyle : inputStyle}
          type="date"
          value={formData.date}
          onChange={e => updateField('date', e.target.value)}
        />
        {errors.date && (
          <div style={{ fontSize: 11, marginTop: 4, color: '#c0392b' }}>{errors.date}</div>
        )}
      </Field>

      <Field label="Nama Pembeli *" col={2}>
        <input
          style={errors.buyerName ? errorBorderStyle : inputStyle}
          type="text"
          value={formData.buyerName}
          onChange={e => updateField('buyerName', e.target.value)}
          placeholder="mis. Kansas"
        />
        {errors.buyerName && (
          <div style={{ fontSize: 11, marginTop: 4, color: '#c0392b' }}>{errors.buyerName}</div>
        )}
      </Field>

      <Field label="Jumlah Diterima (Liter) *" col={2}>
        <input
          style={errors.totalQuantity ? errorBorderStyle : inputStyle}
          type="number"
          step="0.1"
          value={formData.totalQuantity}
          onChange={e => updateField('totalQuantity', e.target.value)}
          placeholder="mis. 150.5"
        />
        {errors.totalQuantity && (
          <div style={{ fontSize: 11, marginTop: 4, color: '#c0392b' }}>{errors.totalQuantity}</div>
        )}
      </Field>

      <Field label="Rata-rata Lemak (%)">
        <input
          style={inputStyle}
          type="number"
          step="0.1"
          value={formData.fatAverage}
          onChange={e => updateField('fatAverage', e.target.value)}
          placeholder="mis. 3.8"
        />
      </Field>

      <Field label="Rata-rata Protein (%)">
        <input
          style={inputStyle}
          type="number"
          step="0.1"
          value={formData.proteinAverage}
          onChange={e => updateField('proteinAverage', e.target.value)}
          placeholder="mis. 3.2"
        />
      </Field>

      <Field label="Catatan" col={2}>
        <textarea
          style={{ ...inputStyle, resize: 'vertical' }}
          rows={2}
          value={formData.notes}
          onChange={e => updateField('notes', e.target.value)}
          placeholder="Catatan tambahan..."
        />
      </Field>

      <div style={{ gridColumn: 'span 2', display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>Batal</Button>
        )}
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? 'Menyimpan...' : isEdit ? 'Update' : 'Simpan'}
        </Button>
      </div>
    </div>
  );
}
