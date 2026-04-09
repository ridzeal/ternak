'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { CROP_TYPES, PLOT_STATUSES, type LandPlot, type ForageHarvest } from '@/types';

interface LandManagementProps {
  onNavigate?: (page: string) => void;
}

const statusColors: Record<string, string> = {
  Growing: '#3b82f6',
  Ready: '#22c55e',
  Harvested: '#8b5cf6',
  Fallow: '#6b7280',
  Other: '#f59e0b',
};

export function LandManagement({ onNavigate }: LandManagementProps) {
  const [plots, setPlots] = useState<LandPlot[]>([]);
  const [harvests, setHarvests] = useState<ForageHarvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlotModal, setShowPlotModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [editingPlot, setEditingPlot] = useState<LandPlot | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCrop, setFilterCrop] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'plots' | 'harvests'>('plots');

  // Plot form state
  const [plotForm, setPlotForm] = useState({
    plotName: '',
    location: '',
    area: '',
    areaUnit: 'ha',
    cropType: '',
    cropVariety: '',
    plantingDate: '',
    currentCutCycle: '',
    lastCutDate: '',
    nextCutDate: '',
    status: 'Growing',
    assignedTo: '',
    barnLocation: '',
    notes: '',
  });

  // Harvest form state
  const [harvestForm, setHarvestForm] = useState({
    plotId: '',
    plotName: '',
    harvestDate: new Date().toISOString().split('T')[0],
    cutNumber: '1',
    quantity: '',
    quantityUnit: 'kg',
    quality: 'Good',
    height: '',
    heightUnit: 'cm',
    usedFor: '',
    storageLocation: '',
    notes: '',
  });

  useEffect(() => {
    fetchPlots();
    fetchHarvests();
  }, [filterStatus, filterCrop]);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCrop) params.set('cropType', filterCrop);

      const res = await fetch(`/api/land?${params}`);
      if (!res.ok) throw new Error('Failed to fetch land plots');
      const data = await res.json();
      setPlots(data);
    } catch (error) {
      console.error('Error fetching land plots:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHarvests = async () => {
    try {
      const res = await fetch('/api/forage-harvests');
      if (!res.ok) throw new Error('Failed to fetch harvests');
      const data = await res.json();
      setHarvests(data);
    } catch (error) {
      console.error('Error fetching harvests:', error);
    }
  };

  const handleOpenPlotModal = (plot?: LandPlot) => {
    if (plot) {
      setEditingPlot(plot);
      setPlotForm({
        plotName: plot.plotName || '',
        location: plot.location || '',
        area: String(plot.area || ''),
        areaUnit: plot.areaUnit || 'ha',
        cropType: plot.cropType || '',
        cropVariety: plot.cropVariety || '',
        plantingDate: plot.plantingDate || '',
        currentCutCycle: String(plot.currentCutCycle || ''),
        lastCutDate: plot.lastCutDate || '',
        nextCutDate: plot.nextCutDate || '',
        status: plot.status || 'Growing',
        assignedTo: plot.assignedTo || '',
        barnLocation: plot.barnLocation || '',
        notes: plot.notes || '',
      });
    } else {
      setEditingPlot(null);
      setPlotForm({
        plotName: '', location: '', area: '', areaUnit: 'ha',
        cropType: '', cropVariety: '', plantingDate: '',
        currentCutCycle: '', lastCutDate: '', nextCutDate: '',
        status: 'Growing', assignedTo: '', barnLocation: '', notes: '',
      });
    }
    setShowPlotModal(true);
  };

  const handleClosePlotModal = () => {
    setShowPlotModal(false);
    setEditingPlot(null);
  };

  const handlePlotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: editingPlot?.id || `plot_${Date.now()}`,
      ...plotForm,
      area: plotForm.area ? parseFloat(plotForm.area) : null,
      currentCutCycle: plotForm.currentCutCycle ? parseInt(plotForm.currentCutCycle) : null,
    };

    try {
      const url = editingPlot ? '/api/land' : '/api/land';
      const method = editingPlot ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save land plot');

      await fetchPlots();
      handleClosePlotModal();
    } catch (error) {
      console.error('Error saving land plot:', error);
    }
  };

  const handleDeletePlot = async (plot: LandPlot) => {
    if (!confirm(`Hapus plot "${plot.plotName}"?`)) return;

    try {
      const res = await fetch(`/api/land?id=${plot.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete land plot');
      await fetchPlots();
    } catch (error) {
      console.error('Error deleting land plot:', error);
    }
  };

  const handleOpenHarvestModal = (plot?: LandPlot) => {
    if (plot) {
      setHarvestForm({
        plotId: plot.id,
        plotName: plot.plotName,
        harvestDate: new Date().toISOString().split('T')[0],
        cutNumber: String((plot.currentCutCycle || 0) + 1),
        quantity: '',
        quantityUnit: 'kg',
        quality: 'Good',
        height: '',
        heightUnit: 'cm',
        usedFor: plot.assignedTo || '',
        storageLocation: plot.barnLocation || '',
        notes: '',
      });
    } else {
      setHarvestForm({
        plotId: '', plotName: '',
        harvestDate: new Date().toISOString().split('T')[0],
        cutNumber: '1', quantity: '', quantityUnit: 'kg',
        quality: 'Good', height: '', heightUnit: 'cm',
        usedFor: '', storageLocation: '', notes: '',
      });
    }
    setShowHarvestModal(true);
  };

  const handleCloseHarvestModal = () => {
    setShowHarvestModal(false);
  };

  const handleHarvestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!harvestForm.plotId) {
      alert('Pilih plot terlebih dahulu');
      return;
    }

    const payload = {
      id: `harvest_${Date.now()}`,
      ...harvestForm,
      cutNumber: parseInt(harvestForm.cutNumber),
      quantity: harvestForm.quantity ? parseFloat(harvestForm.quantity) : null,
      height: harvestForm.height ? parseFloat(harvestForm.height) : null,
    };

    try {
      const res = await fetch('/api/forage-harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to record harvest');

      await fetchPlots();
      await fetchHarvests();
      handleCloseHarvestModal();
    } catch (error) {
      console.error('Error recording harvest:', error);
    }
  };

  const handleDeleteHarvest = async (harvest: ForageHarvest) => {
    if (!confirm(`Hapus panen "${harvest.plotName}" (${harvest.cutNumber}th Cut)?`)) return;

    try {
      const res = await fetch(`/api/forage-harvests?id=${harvest.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete harvest');
      await fetchPlots();
      await fetchHarvests();
    } catch (error) {
      console.error('Error deleting harvest:', error);
    }
  };

  const plotColumns: Column<LandPlot>[] = [
    {
      header: 'No',
      key: 'index',
      width: '50px',
      render: (item, index) => index + 1,
    },
    {
      header: 'Plot',
      key: 'plotName',
      width: '80px',
      mobile: { label: 'Plot' },
    },
    {
      header: 'Jenis Tanaman',
      key: 'cropType',
      width: '150px',
      render: (item) => item.cropType || '—',
      mobile: { label: 'Tanaman' },
    },
    {
      header: 'Lokasi',
      key: 'location',
      width: '150px',
      render: (item) => item.location || '—',
    },
    {
      header: 'Siklus Potong',
      key: 'cutCycle',
      width: '120px',
      render: (item) => item.currentCutCycle ? `${item.currentCutCycle}${getOrdinal(item.currentCutCycle)} Cut` : '—',
      mobile: { label: 'Cut' },
    },
    {
      header: 'Ditugaskan Ke',
      key: 'assignedTo',
      width: '130px',
      render: (item) => item.assignedTo || '—',
    },
    {
      header: 'Status',
      key: 'status',
      width: '120px',
      render: (item) => {
        const status = item.status || 'Growing';
        const color = statusColors[status] || '#6b7280';
        return (
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            background: `${color}20`,
            color,
            fontSize: 'var(--fs-sm)',
            fontWeight: 500,
          }}>
            {status}
          </span>
        );
      },
      mobile: { label: 'Status' },
    },
    {
      header: 'Panen',
      key: 'harvest',
      width: '100px',
      render: (item) => (
        <Button
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenHarvestModal(item);
          }}
          style={{ padding: '6px 12px', fontSize: 'var(--fs-xs)' }}
        >
          🌿 Panen
        </Button>
      ),
    },
  ];

  const harvestColumns: Column<ForageHarvest>[] = [
    {
      header: 'No',
      key: 'index',
      width: '50px',
      render: (item, index) => index + 1,
    },
    {
      header: 'Plot',
      key: 'plotName',
      width: '100px',
      mobile: { label: 'Plot' },
    },
    {
      header: 'Tanggal Panen',
      key: 'harvestDate',
      width: '130px',
      mobile: { label: 'Tanggal' },
    },
    {
      header: 'Cut Ke-',
      key: 'cutNumber',
      width: '100px',
      render: (item) => `${item.cutNumber}${getOrdinal(item.cutNumber)} Cut`,
      mobile: { label: 'Cut' },
    },
    {
      header: 'Jumlah',
      key: 'quantity',
      width: '100px',
      render: (item) => item.quantity ? `${item.quantity} ${item.quantityUnit || 'kg'}` : '—',
      mobile: { label: 'Jumlah' },
    },
    {
      header: 'Kualitas',
      key: 'quality',
      width: '100px',
      render: (item) => item.quality || '—',
    },
    {
      header: 'Ditugaskan Ke',
      key: 'usedFor',
      width: '130px',
      render: (item) => item.usedFor || '—',
    },
    {
      header: 'Keterangan',
      key: 'notes',
      width: '200px',
      render: (item) => item.notes || '—',
      mobile: { label: 'Keterangan' },
    },
  ];

  return (
    <div>
      {/* Sub-tabs */}
      <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
        <button
          onClick={() => setActiveSubTab('plots')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeSubTab === 'plots' ? '#8b5a2b' : '#f0ead8',
            color: activeSubTab === 'plots' ? '#fff' : '#8a7d6b',
            fontWeight: 600,
            fontSize: 'var(--fs-sm)',
            cursor: 'pointer',
          }}
        >
          🌱 Plot Lahan
        </button>
        <button
          onClick={() => setActiveSubTab('harvests')}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: activeSubTab === 'harvests' ? '#8b5a2b' : '#f0ead8',
            color: activeSubTab === 'harvests' ? '#fff' : '#8a7d6b',
            fontWeight: 600,
            fontSize: 'var(--fs-sm)',
            cursor: 'pointer',
          }}
        >
          🌾 Riwayat Panen
        </button>
      </div>

      {/* Filters for plots */}
      {activeSubTab === 'plots' && (
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', fontWeight: 500 }}>
            Filter:
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e0d4c0',
              background: '#faf6ee',
              fontSize: 'var(--fs-md)',
              color: '#3a2e20',
            }}
          >
            <option value="">Semua Status</option>
            {PLOT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterCrop}
            onChange={(e) => setFilterCrop(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e0d4c0',
              background: '#faf6ee',
              fontSize: 'var(--fs-md)',
              color: '#3a2e20',
            }}
          >
            <option value="">Semua Tanaman</option>
            {CROP_TYPES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      {/* Plots Table */}
      {activeSubTab === 'plots' && (
        <DataTable
          title="Manajemen Lahan"
          subtitle="Plot dan siklus potong"
          icon="🌱"
          data={plots}
          columns={plotColumns}
          onAdd={() => handleOpenPlotModal()}
          onRowClick={(plot) => handleOpenPlotModal(plot)}
          onDelete={handleDeletePlot}
          loading={loading}
          emptyMessage="Belum ada plot lahan. Klik '+ Tambah' untuk menambah."
        />
      )}

      {/* Harvests Table */}
      {activeSubTab === 'harvests' && (
        <DataTable
          title="Riwayat Panen"
          subtitle="Catatan panen pakan ternak"
          icon="🌾"
          data={harvests}
          columns={harvestColumns}
          onAdd={() => handleOpenHarvestModal()}
          onRowClick={() => {}}
          onDelete={handleDeleteHarvest}
          loading={loading}
          emptyMessage="Belum ada riwayat panen."
        />
      )}

      {/* Add/Edit Plot Modal */}
      <Modal isOpen={showPlotModal} onClose={handleClosePlotModal} title={editingPlot ? 'Edit Plot' : 'Tambah Plot Baru'}>
        <form onSubmit={handlePlotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Nama Plot</label>
              <input
                className="field-input"
                type="text"
                value={plotForm.plotName}
                onChange={(e) => setPlotForm({ ...plotForm, plotName: e.target.value })}
                placeholder="Contoh: A, B, C"
                required
              />
            </div>
            <div>
              <label className="field-label">Lokasi</label>
              <input
                className="field-input"
                type="text"
                value={plotForm.location}
                onChange={(e) => setPlotForm({ ...plotForm, location: e.target.value })}
                placeholder="Lokasi plot"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Luas</label>
              <input
                className="field-input"
                type="number"
                step="0.01"
                value={plotForm.area}
                onChange={(e) => setPlotForm({ ...plotForm, area: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="field-label">Unit Luas</label>
              <select
                className="field-input"
                value={plotForm.areaUnit}
                onChange={(e) => setPlotForm({ ...plotForm, areaUnit: e.target.value })}
              >
                <option value="ha">Hektar (ha)</option>
                <option value="m²">Meter² (m²)</option>
                <option value="acre">Acre</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Jenis Tanaman</label>
              <select
                className="field-input"
                value={plotForm.cropType}
                onChange={(e) => setPlotForm({ ...plotForm, cropType: e.target.value })}
              >
                <option value="">Pilih Tanaman</option>
                {CROP_TYPES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Varietas</label>
              <input
                className="field-input"
                type="text"
                value={plotForm.cropVariety}
                onChange={(e) => setPlotForm({ ...plotForm, cropVariety: e.target.value })}
                placeholder="Nama varietas"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Tanggal Tanam</label>
            <input
              className="field-input"
              type="date"
              value={plotForm.plantingDate}
              onChange={(e) => setPlotForm({ ...plotForm, plantingDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Siklus Potong Saat Ini</label>
              <input
                className="field-input"
                type="number"
                value={plotForm.currentCutCycle}
                onChange={(e) => setPlotForm({ ...plotForm, currentCutCycle: e.target.value })}
                placeholder="1"
                min="0"
              />
            </div>
            <div>
              <label className="field-label">Tanggal Potong Terakhir</label>
              <input
                className="field-input"
                type="date"
                value={plotForm.lastCutDate}
                onChange={(e) => setPlotForm({ ...plotForm, lastCutDate: e.target.value })}
              />
            </div>
            <div>
              <label className="field-label">Tanggal Potong Berikutnya</label>
              <input
                className="field-input"
                type="date"
                value={plotForm.nextCutDate}
                onChange={(e) => setPlotForm({ ...plotForm, nextCutDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Status</label>
              <select
                className="field-input"
                value={plotForm.status}
                onChange={(e) => setPlotForm({ ...plotForm, status: e.target.value })}
              >
                {PLOT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Ditugaskan Ke</label>
              <input
                className="field-input"
                type="text"
                value={plotForm.assignedTo}
                onChange={(e) => setPlotForm({ ...plotForm, assignedTo: e.target.value })}
                placeholder="Contoh: Anak"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Lokasi Barn/Kandang</label>
            <input
              className="field-input"
              type="text"
              value={plotForm.barnLocation}
              onChange={(e) => setPlotForm({ ...plotForm, barnLocation: e.target.value })}
              placeholder="Lokasi kandang terdekat"
            />
          </div>

          <div>
            <label className="field-label">Keterangan</label>
            <textarea
              className="field-input"
              value={plotForm.notes}
              onChange={(e) => setPlotForm({ ...plotForm, notes: e.target.value })}
              rows={3}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" onClick={handleClosePlotModal} variant="secondary">
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingPlot ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Harvest Record Modal */}
      <Modal isOpen={showHarvestModal} onClose={handleCloseHarvestModal} title="Catat Panen Pakan">
        <form onSubmit={handleHarvestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ padding: 12, background: '#f0f4f8', borderRadius: 8 }}>
            <div style={{ fontSize: 'var(--fs-sm)', color: '#666' }}>Plot:</div>
            <div style={{ fontWeight: 600, color: '#333' }}>
              {plots.find(p => p.id === harvestForm.plotId)?.plotName || harvestForm.plotName || '—'}
            </div>
          </div>

          <input
            type="hidden"
            value={harvestForm.plotId}
            onChange={(e) => setHarvestForm({ ...harvestForm, plotId: e.target.value })}
          />

          {!harvestForm.plotId && (
            <div>
              <label className="field-label">Pilih Plot</label>
              <select
                className="field-input"
                value={harvestForm.plotId}
                onChange={(e) => {
                  const plot = plots.find(p => p.id === e.target.value);
                  setHarvestForm({
                    ...harvestForm,
                    plotId: e.target.value,
                    plotName: plot?.plotName || '',
                    cutNumber: String((plot?.currentCutCycle || 0) + 1),
                    usedFor: plot?.assignedTo || '',
                  });
                }}
                required
              >
                <option value="">Pilih Plot</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>{p.plotName} - {p.cropType || 'No crop'}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Tanggal Panen</label>
              <input
                className="field-input"
                type="date"
                value={harvestForm.harvestDate}
                onChange={(e) => setHarvestForm({ ...harvestForm, harvestDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="field-label">Cut Ke-</label>
              <input
                className="field-input"
                type="number"
                value={harvestForm.cutNumber}
                onChange={(e) => setHarvestForm({ ...harvestForm, cutNumber: e.target.value })}
                min="1"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Jumlah</label>
              <input
                className="field-input"
                type="number"
                step="0.01"
                value={harvestForm.quantity}
                onChange={(e) => setHarvestForm({ ...harvestForm, quantity: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="field-label">Unit</label>
              <select
                className="field-input"
                value={harvestForm.quantityUnit}
                onChange={(e) => setHarvestForm({ ...harvestForm, quantityUnit: e.target.value })}
              >
                <option value="kg">Kilogram (kg)</option>
                <option value="ton">Ton</option>
                <option value="bundle">Ikat</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Kualitas</label>
              <select
                className="field-input"
                value={harvestForm.quality}
                onChange={(e) => setHarvestForm({ ...harvestForm, quality: e.target.value })}
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
            <div>
              <label className="field-label">Tinggi Rumput (cm)</label>
              <input
                className="field-input"
                type="number"
                step="0.1"
                value={harvestForm.height}
                onChange={(e) => setHarvestForm({ ...harvestForm, height: e.target.value })}
                placeholder="Opsional"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Ditugaskan Ke</label>
            <input
              className="field-input"
              type="text"
              value={harvestForm.usedFor}
              onChange={(e) => setHarvestForm({ ...harvestForm, usedFor: e.target.value })}
              placeholder="Contoh: Anak, Sapi Laktasi"
            />
          </div>

          <div>
            <label className="field-label">Lokasi Penyimpanan</label>
            <input
              className="field-input"
              type="text"
              value={harvestForm.storageLocation}
              onChange={(e) => setHarvestForm({ ...harvestForm, storageLocation: e.target.value })}
              placeholder="Lokasi penyimpanan pakan"
            />
          </div>

          <div>
            <label className="field-label">Keterangan</label>
            <textarea
              className="field-input"
              value={harvestForm.notes}
              onChange={(e) => setHarvestForm({ ...harvestForm, notes: e.target.value })}
              rows={2}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" onClick={handleCloseHarvestModal} variant="secondary">
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Catat Panen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
}
