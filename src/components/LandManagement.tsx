'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/Button';
import { CROP_TYPES, PLOT_STATUSES, type LandPlot, type ForageHarvest } from '@/types';

interface LandManagementProps {
  onNavigate?: (page: string) => void;
  onAdd?: () => void;
  onRowClick?: (plot: LandPlot) => void;
  onDelete?: (plot: LandPlot) => void;
  onAddHarvest?: () => void;
  onRowClickHarvest?: (harvest: ForageHarvest) => void;
  onDeleteHarvest?: (harvest: ForageHarvest) => void;
  plots?: LandPlot[];
  harvests?: ForageHarvest[];
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  Growing: '#3b82f6',
  Ready: '#22c55e',
  Harvested: '#8b5cf6',
  Fallow: '#6b7280',
  Other: '#f59e0b',
};

export function LandManagement({ onNavigate, onAdd, onRowClick, onDelete, onAddHarvest, onRowClickHarvest, onDeleteHarvest, plots: externalPlots, harvests: externalHarvests, loading: externalLoading }: LandManagementProps) {
  const [internalPlots, setInternalPlots] = useState<LandPlot[]>([]);
  const [internalHarvests, setInternalHarvests] = useState<ForageHarvest[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterCrop, setFilterCrop] = useState<string>('');
  const [activeSubTab, setActiveSubTab] = useState<'plots' | 'harvests'>('plots');

  const plots = externalPlots !== undefined ? externalPlots : internalPlots;
  const harvests = externalHarvests !== undefined ? externalHarvests : internalHarvests;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (externalPlots === undefined) {
      fetchPlots();
    }
    if (externalHarvests === undefined) {
      fetchHarvests();
    }
  }, [filterStatus, filterCrop, externalPlots, externalHarvests]);

  const fetchPlots = async () => {
    try {
      setInternalLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);
      if (filterCrop) params.set('cropType', filterCrop);

      const res = await fetch(`/api/land?${params}`);
      if (!res.ok) throw new Error('Failed to fetch land plots');
      const data = await res.json();
      setInternalPlots(data);
    } catch (error) {
      console.error('Error fetching land plots:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  const fetchHarvests = async () => {
    try {
      const res = await fetch('/api/forage-harvests');
      if (!res.ok) throw new Error('Failed to fetch harvests');
      const data = await res.json();
      setInternalHarvests(data);
    } catch (error) {
      console.error('Error fetching harvests:', error);
    }
  };

  const handleDeletePlot = (plot: LandPlot) => {
    if (onDelete) {
      onDelete(plot);
    }
  };

  const handleDeleteHarvest = (harvest: ForageHarvest) => {
    if (onDeleteHarvest) {
      onDeleteHarvest(harvest);
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
            if (onAddHarvest) onAddHarvest();
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
          onAdd={onAdd || (() => {})}
          onRowClick={onRowClick || (() => {})}
          onDelete={onDelete || (() => {})}
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
          onAdd={onAddHarvest || (() => {})}
          onRowClick={onRowClickHarvest || (() => {})}
          onDelete={onDeleteHarvest || (() => {})}
          loading={loading}
          emptyMessage="Belum ada riwayat panen."
        />
      )}
    </div>
  );
}

function getOrdinal(n: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
}

