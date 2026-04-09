'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { ASSET_CATEGORIES, ASSET_STATUSES, type Asset } from '@/types';
import { AssetMaintenance } from '@/components/AssetMaintenance';

interface AssetInventoryProps {
  onNavigate?: (page: string) => void;
}

const statusColors: Record<string, string> = {
  Active: '#22c55e',
  Maintenance: '#f59e0b',
  Retired: '#6b7280',
  Lost: '#ef4444',
};

export function AssetInventory({ onNavigate }: AssetInventoryProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedAssetForMaintenance, setSelectedAssetForMaintenance] = useState<Asset | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    purchaseDate: '',
    quantity: '',
    unit: '',
    notes: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchAssets();
  }, [filterCategory]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const url = filterCategory ? `/api/assets?category=${filterCategory}` : '/api/assets';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch assets');
      const data = await res.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (asset?: Asset) => {
    if (asset) {
      setEditingAsset(asset);
      setFormData({
        name: asset.name || '',
        category: asset.category || '',
        purchaseDate: asset.purchaseDate || '',
        quantity: String(asset.quantity || ''),
        unit: asset.unit || '',
        notes: asset.notes || '',
        status: asset.status || 'Active',
      });
    } else {
      setEditingAsset(null);
      setFormData({
        name: '',
        category: '',
        purchaseDate: '',
        quantity: '',
        unit: '',
        notes: '',
        status: 'Active',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAsset(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: editingAsset?.id || `asset_${Date.now()}`,
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
    };

    try {
      const url = editingAsset ? '/api/assets' : '/api/assets';
      const method = editingAsset ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save asset');

      await fetchAssets();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Hapus asset "${asset.name}"?`)) return;

    try {
      const res = await fetch(`/api/assets?id=${asset.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete asset');
      await fetchAssets();
    } catch (error) {
      console.error('Error deleting asset:', error);
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
        onAdd={() => handleOpenModal()}
        onRowClick={(asset) => handleOpenModal(asset)}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="Belum ada asset. Klik '+ Tambah' untuk menambah."
      />

      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingAsset ? 'Edit Asset' : 'Tambah Asset Baru'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Nama Barang</label>
            <input
              className="field-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Mesin cooling, Motor Roda 2"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Kategori</label>
              <select
                className="field-input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Pilih Kategori</option>
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label">Status</label>
              <select
                className="field-input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {ASSET_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Tanggal Pembelian</label>
            <input
              className="field-input"
              type="date"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Jumlah</label>
              <input
                className="field-input"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="0"
                required
              />
            </div>

            <div>
              <label className="field-label">Unit</label>
              <input
                className="field-input"
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Unit/Set/Piece"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Keterangan</label>
            <textarea
              className="field-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" onClick={handleCloseModal} variant="secondary">
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingAsset ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Maintenance History Modal */}
      <AssetMaintenance
        asset={selectedAssetForMaintenance}
        isOpen={showMaintenanceModal}
        onClose={handleCloseMaintenance}
      />
    </div>
  );
}
