'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { FEED_UNITS, type FeedInventory } from '@/types';

interface FeedFormData {
  name: string;
  purchaseDate: string;
  quantity: string;
  weightKg: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  expiryDate: string;
  supplier: string;
  notes: string;
  minStock: string;
}

interface FeedFormProps {
  formData: FeedFormData;
  onChange: (data: FeedFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: FeedInventory | null;
  readOnly?: boolean;
}

export function FeedForm({ formData, onChange, onSubmit, onCancel, onDelete, initialData, readOnly = false }: FeedFormProps) {
  const updateField = (field: keyof FeedFormData, value: string) => {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Field label="Nama Pakan *">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="Contoh: Puruk Sapi Laktasi, Dedak Halus"
          readOnly={readOnly}
          required
        />
      </Field>

      <Field label="Tanggal Pembelian">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="date"
          value={formData.purchaseDate}
          onChange={e => updateField('purchaseDate', e.target.value)}
          readOnly={readOnly}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Field label="Jumlah">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            value={formData.quantity}
            onChange={e => updateField('quantity', e.target.value)}
            min="0"
            readOnly={readOnly}
          />
        </Field>

        <Field label="Berat (Kg)">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            step="0.01"
            value={formData.weightKg}
            onChange={e => updateField('weightKg', e.target.value)}
            placeholder="0.00"
            readOnly={readOnly}
          />
        </Field>

        <Field label="Unit">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.unit}
            onChange={e => updateField('unit', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Pilih Unit</option>
            {FEED_UNITS.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Harga per Unit">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            step="0.01"
            value={formData.unitPrice}
            onChange={e => updateField('unitPrice', e.target.value)}
            placeholder="0.00"
            readOnly={readOnly}
          />
        </Field>

        <Field label="Total Harga">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            step="0.01"
            value={formData.totalPrice}
            onChange={e => updateField('totalPrice', e.target.value)}
            placeholder="Auto-calculate"
            readOnly={readOnly}
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Tanggal Kadaluarsa">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="date"
            value={formData.expiryDate}
            onChange={e => updateField('expiryDate', e.target.value)}
            readOnly={readOnly}
          />
        </Field>

        <Field label="Minimum Stok">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            value={formData.minStock}
            onChange={e => updateField('minStock', e.target.value)}
            placeholder="Alert threshold"
            readOnly={readOnly}
          />
        </Field>
      </div>

      <Field label="Supplier">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.supplier}
          onChange={e => updateField('supplier', e.target.value)}
          placeholder="Nama supplier"
          readOnly={readOnly}
        />
      </Field>

      <Field label="Keterangan">
        <textarea
          style={{ ...(readOnly ? readOnlyStyle : inputStyle), minHeight: 80, resize: 'vertical' }}
          value={formData.notes}
          onChange={e => updateField('notes', e.target.value)}
          placeholder="Catatan tambahan..."
          readOnly={readOnly}
        />
      </Field>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 6 }}>
        {isEdit && !readOnly && onDelete && (
          <Button
            onClick={onDelete}
            style={{ background: '#c0392b', marginRight: 'auto' }}
          >
            🗑️ Hapus
          </Button>
        )}
        {!readOnly && (
          <>
            <Button onClick={onCancel} variant="secondary">Batal</Button>
            <Button onClick={onSubmit}>{isEdit ? 'Simpan' : 'Tambah'}</Button>
          </>
        )}
      </div>
    </div>
  );
}
