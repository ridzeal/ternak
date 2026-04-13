'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { CROP_TYPES, PLOT_STATUSES, type LandPlot } from '@/types';

interface PlotFormData {
  plotName: string;
  location: string;
  area: string;
  areaUnit: string;
  cropType: string;
  cropVariety: string;
  plantingDate: string;
  currentCutCycle: string;
  lastCutDate: string;
  nextCutDate: string;
  status: string;
  assignedTo: string;
  barnLocation: string;
  notes: string;
}

interface PlotFormProps {
  formData: PlotFormData;
  onChange: (data: PlotFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: LandPlot | null;
  readOnly?: boolean;
}

export function PlotForm({ formData, onChange, onSubmit, onCancel, onDelete, initialData, readOnly = false }: PlotFormProps) {
  const updateField = (field: keyof PlotFormData, value: string) => {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Nama Plot *">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            value={formData.plotName}
            onChange={e => updateField('plotName', e.target.value)}
            placeholder="Contoh: A, B, C"
            readOnly={readOnly}
            required
          />
        </Field>

        <Field label="Lokasi">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            value={formData.location}
            onChange={e => updateField('location', e.target.value)}
            placeholder="Lokasi plot"
            readOnly={readOnly}
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Luas">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            step="0.01"
            value={formData.area}
            onChange={e => updateField('area', e.target.value)}
            placeholder="0.00"
            readOnly={readOnly}
          />
        </Field>

        <Field label="Unit Luas">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.areaUnit}
            onChange={e => updateField('areaUnit', e.target.value)}
            disabled={readOnly}
          >
            <option value="ha">Hektar (ha)</option>
            <option value="m²">Meter² (m²)</option>
            <option value="acre">Acre</option>
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Jenis Tanaman">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.cropType}
            onChange={e => updateField('cropType', e.target.value)}
            disabled={readOnly}
          >
            <option value="">Pilih Tanaman</option>
            {CROP_TYPES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Varietas">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            value={formData.cropVariety}
            onChange={e => updateField('cropVariety', e.target.value)}
            placeholder="Nama varietas"
            readOnly={readOnly}
          />
        </Field>
      </div>

      <Field label="Tanggal Tanam">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          type="date"
          value={formData.plantingDate}
          onChange={e => updateField('plantingDate', e.target.value)}
          readOnly={readOnly}
        />
      </Field>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <Field label="Siklus Potong Saat Ini">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            value={formData.currentCutCycle}
            onChange={e => updateField('currentCutCycle', e.target.value)}
            placeholder="1"
            min="0"
            readOnly={readOnly}
          />
        </Field>

        <Field label="Tanggal Potong Terakhir">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="date"
            value={formData.lastCutDate}
            onChange={e => updateField('lastCutDate', e.target.value)}
            readOnly={readOnly}
          />
        </Field>

        <Field label="Tanggal Potong Berikutnya">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="date"
            value={formData.nextCutDate}
            onChange={e => updateField('nextCutDate', e.target.value)}
            readOnly={readOnly}
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Status">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.status}
            onChange={e => updateField('status', e.target.value)}
            disabled={readOnly}
          >
            {PLOT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Ditugaskan Ke">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            value={formData.assignedTo}
            onChange={e => updateField('assignedTo', e.target.value)}
            placeholder="Contoh: Anak"
            readOnly={readOnly}
          />
        </Field>
      </div>

      <Field label="Lokasi Barn/Kandang">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.barnLocation}
          onChange={e => updateField('barnLocation', e.target.value)}
          placeholder="Lokasi kandang terdekat"
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
