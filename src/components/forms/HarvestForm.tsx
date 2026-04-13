'use client';

import React from 'react';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { type LandPlot } from '@/types';

interface HarvestFormData {
  plotId: string;
  plotName: string;
  harvestDate: string;
  cutNumber: string;
  quantity: string;
  quantityUnit: string;
  quality: string;
  height: string;
  heightUnit: string;
  usedFor: string;
  storageLocation: string;
  notes: string;
}

interface HarvestFormProps {
  formData: HarvestFormData;
  onChange: (data: HarvestFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  initialData?: any | null;
  readOnly?: boolean;
  plots?: LandPlot[];
}

export function HarvestForm({ formData, onChange, onSubmit, onCancel, onDelete, initialData, readOnly = false, plots = [] }: HarvestFormProps) {
  const updateField = (field: keyof HarvestFormData, value: string) => {
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

  const selectedPlot = plots.find(p => p.id === formData.plotId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {selectedPlot && (
        <div style={{ padding: 12, background: '#f0f4f8', borderRadius: 8 }}>
          <div style={{ fontSize: 'var(--fs-sm)', color: '#666' }}>Plot:</div>
          <div style={{ fontWeight: 600, color: '#333' }}>{selectedPlot.plotName}</div>
          <div style={{ fontSize: 'var(--fs-sm)', color: '#666', marginTop: 4 }}>
            Jenis: <strong>{selectedPlot.cropType || '—'}</strong>
          </div>
        </div>
      )}

      {!formData.plotId && plots.length > 0 && (
        <Field label="Pilih Plot *">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.plotId}
            onChange={e => {
              const plot = plots.find(p => p.id === e.target.value);
              updateField('plotId', e.target.value);
              if (plot) {
                updateField('plotName', plot.plotName);
                updateField('cutNumber', String((plot.currentCutCycle || 0) + 1));
                updateField('usedFor', plot.assignedTo || '');
              }
            }}
            disabled={readOnly}
            required
          >
            <option value="">Pilih Plot</option>
            {plots.map((p) => (
              <option key={p.id} value={p.id}>{p.plotName} - {p.cropType || 'No crop'}</option>
            ))}
          </select>
        </Field>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Tanggal Panen *">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="date"
            value={formData.harvestDate}
            onChange={e => updateField('harvestDate', e.target.value)}
            readOnly={readOnly}
            required
          />
        </Field>

        <Field label="Cut Ke- *">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            value={formData.cutNumber}
            onChange={e => updateField('cutNumber', e.target.value)}
            min="1"
            readOnly={readOnly}
            required
          />
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Jumlah">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            step="0.01"
            value={formData.quantity}
            onChange={e => updateField('quantity', e.target.value)}
            placeholder="0.00"
            readOnly={readOnly}
          />
        </Field>

        <Field label="Unit">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.quantityUnit}
            onChange={e => updateField('quantityUnit', e.target.value)}
            disabled={readOnly}
          >
            <option value="kg">Kilogram (kg)</option>
            <option value="ton">Ton</option>
            <option value="bundle">Ikat</option>
          </select>
        </Field>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Field label="Kualitas">
          <select
            style={readOnly ? readOnlyStyle : selectStyle}
            value={formData.quality}
            onChange={e => updateField('quality', e.target.value)}
            disabled={readOnly}
          >
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </Field>

        <Field label="Tinggi Tanaman (cm)">
          <input
            style={readOnly ? readOnlyStyle : inputStyle}
            type="number"
            step="0.01"
            value={formData.height}
            onChange={e => updateField('height', e.target.value)}
            placeholder="Opsional"
            readOnly={readOnly}
          />
        </Field>
      </div>

      <Field label="Ditugaskan Ke">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.usedFor}
          onChange={e => updateField('usedFor', e.target.value)}
          placeholder="Contoh: Sapi laktasi"
          readOnly={readOnly}
        />
      </Field>

      <Field label="Lokasi Penyimpanan">
        <input
          style={readOnly ? readOnlyStyle : inputStyle}
          value={formData.storageLocation}
          onChange={e => updateField('storageLocation', e.target.value)}
          placeholder="Lokasi penyimpanan pakan"
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
            <Button onClick={onSubmit}>{isEdit ? 'Simpan' : 'Panen'}</Button>
          </>
        )}
      </div>
    </div>
  );
}
