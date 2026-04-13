'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Button } from '@/components/Button';
import { ASSET_CATEGORIES, ASSET_STATUSES, type Asset } from '@/types';
import { AssetMaintenance } from '@/components/AssetMaintenance';

interface AssetInventoryProps {
  onNavigate?: (page: string) => void;
  onAdd?: () => void;
  onRowClick?: (asset: Asset) => void;
  onDelete?: (asset: Asset) => void;
  assets?: Asset[];
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  Active: '#22c55e',
  Maintenance: '#f59e0b',
  Retired: '#6b7280',
  Lost: '#ef4444',
};

export function AssetInventory({ onNavigate, onAdd, onRowClick, onDelete, assets: externalAssets, loading: externalLoading }: AssetInventoryProps) {
  const [internalAssets, setInternalAssets] = useState<Asset[]>([]);
  const [internalLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<Asset | null>(null);

  const assets = externalAssets !== undefined ? externalAssets : internalAssets;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (externalAssets === undefined) {
      fetchAssets();
    }
  }, [filterCategory, externalAssets]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const url = filterCategory ? `/api/assets?category=${filterCategory}` : '/api/assets';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data = await res.json();
      setInternalAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenMaintenance = (asset: Asset) => {
    setSelectedAssetForMaintenance(asset);
    setShowMaintenanceModal(true);
  };

  const handleCloseMaintenance = () => {
    setShowMaintenanceModal(false);
    setSelectedAssetForMaintenance(null);
  };

  const handleDelete = (asset: Asset) => {
    if (onDelete) {
      onDelete(asset);
    }
  };

  const columns: Column<Asset>[] = [
    {
      header: 'No',
      key: 'index',
      width: '50px',
      render: (item, index) => index + 1,
    },
    {
      header: 'Nama Barang',
      key: 'name',
      width: '200px',
      mobile: { label: 'Nama' },
    },
    {
      header: 'Kategori',
      key: 'category',
      width: '150px',
      render: (item) => item.category || '—',
      mobile: { label: 'Kategori' },
    },
    {
      header: 'Tanggal Pembelian',
      key: 'purchaseDate',
      width: '150px',
      render: (item) => item.purchaseDate || '—',
      mobile: { label: 'Tgl Beli' },
    },
    {
      header: 'Jumlah',
      key: 'quantity',
      width: '100px',
      mobile: { label: 'Jumlah' },
    },
    {
      header: 'Unit',
      key: 'unit',
      width: '80px',
      render: (item) => item.unit || '—',
    },
    {
      header: 'Keterangan',
      key: 'notes',
      width: '200px',
      render: (item) => item.notes || '—',
      mobile: { label: 'Keterangan' },
    },
    {
      header: 'Status',
      key: 'status',
      width: '120px',
      render: (item) => {
        const status = item.status || 'Active';
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
      header: 'Perawatan',
      key: 'maintenance',
      width: '120px',
      render: (item) => (
        <Button
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenMaintenance(item);
          }}
          style={{ padding: '6px 12px', fontSize: 'var(--fs-xs)' }}
        >
          🔧 Riwayat
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', fontWeight: 500 }}>
          Filter Kategori:
        </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e0d4c0',
            background: '#faf6ee',
            fontSize: 'var(--fs-md)',
            color: '#3a2e20',
          }}
        >
          <option value="">Semua</option>
          {ASSET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <DataTable
        title="Inventaris Aset"
        subtitle="Daftar Barang-Barang Inventory"
        icon="📦"
        data={assets}
        columns={columns}
        onAdd={onAdd || (() => {})}
        onRowClick={onRowClick || (() => {})}
        onDelete={onDelete || (() => {})}
        loading={loading}
        emptyMessage="Belum ada asset. Klik '+ Tambah' untuk menambah."
      />

      {/* Maintenance History Modal */}
      <AssetMaintenance
        asset={selectedAssetForMaintenance}
        isOpen={showMaintenanceModal}
        onClose={handleCloseMaintenance}
      />
    </div>
  );
}
