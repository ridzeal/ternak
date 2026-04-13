'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { ASSET_CATEGORIES, ASSET_STATUSES, type Asset } from '@/types';

interface AssetFormData {
  name: string;
  category: string;
  purchaseDate: string;
  quantity: string;
  unit: string;
  notes: string;
  status: string;
}

interface AssetFormProps {
  formData: AssetFormData;
  onChange: (data: AssetFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: Asset | null;
  readOnly?: boolean;
}

export function AssetForm({ formData, onChange, onSubmit, onCancel, onDelete, initialData, readOnly = false }: AssetFormProps) {
  const updateField = (field: keyof AssetFormData, value: string) => {
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
      <Field label="Nama Barang *">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.name}
          onChange={e => updateField('name', e.target.value)}
          placeholder="Contoh: Mesin cooling, Motor Roda 2"
          readOnly={readOnly}
          required
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Kategori">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.category}
            onChange={e => updateField('category', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Pilih Kategori</option>
            {ASSET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </Field>

        <Field label="Status">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.status}
            onChange={e => updateField('status', e.target.value)}
            disabled={readOnly}
          >
            {ASSET_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Tanggal Pembelian">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="date"
          value={formData.purchaseDate}
          onChange={e => updateField('purchaseDate', e.target.value)}
          readOnly={readOnly}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <Field label="Jumlah">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            value={formData.quantity}
            onChange={e => updateField('quantity', e.target.value)}
            min="0"
            readOnly={readOnly}
            required
          />
        </Field>

        <Field label="Unit">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            value={formData.unit}
            onChange={e => updateField('unit', e.target.value)}
            placeholder="Unit/Set/Piece"
            readOnly={readOnly}
          />
        </Field>
      </div>

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
