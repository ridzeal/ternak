'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { FEED_UNITS, type FeedInventory as FeedInventoryType, type Asset } from '@/types';

interface FeedInventoryProps {
  onNavigate?: (page: string) => void;
}

export function FeedInventory({ onNavigate }: FeedInventoryProps) {
  const [feeds, setFeeds] = useState<FeedInventoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFeed, setEditingFeed] = useState<FeedInventoryType | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedInventoryType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    purchaseDate: '',
    quantity: '',
    weightKg: '',
    unit: '',
    unitPrice: '',
    totalPrice: '',
    expiryDate: '',
    supplier: '',
    notes: '',
    minStock: '',
  });

  // Usage form state
  const [usageData, setUsageData] = useState({
    date: '',
    quantity: '',
    weightKg: '',
    purpose: '',
    notes: '',
  });

  useEffect(() => {
    fetchFeeds();
  }, []);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/feed-inventory');
      if (!res.ok) throw new Error('Failed to fetch feed inventory');
      const data = await res.json();
      setFeeds(data);
    } catch (error) {
      console.error('Error fetching feed inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (feed?: FeedInventoryType) => {
    if (feed) {
      setEditingFeed(feed);
      setFormData({
        name: feed.name || '',
        purchaseDate: feed.purchaseDate || '',
        quantity: String(feed.quantity || ''),
        weightKg: String(feed.weightKg || ''),
        unit: feed.unit || '',
        unitPrice: String(feed.unitPrice || ''),
        totalPrice: String(feed.totalPrice || ''),
        expiryDate: feed.expiryDate || '',
        supplier: feed.supplier || '',
        notes: feed.notes || '',
        minStock: String(feed.minStock || ''),
      });
    } else {
      setEditingFeed(null);
      setFormData({
        name: '',
        purchaseDate: '',
        quantity: '',
        weightKg: '',
        unit: '',
        unitPrice: '',
        totalPrice: '',
        expiryDate: '',
        supplier: '',
        notes: '',
        minStock: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFeed(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-calculate total price if unit price and quantity are provided
    let calculatedTotal = formData.totalPrice;
    if (formData.unitPrice && formData.quantity) {
      calculatedTotal = String(parseFloat(formData.unitPrice) * parseFloat(formData.quantity));
    }

    const payload = {
      id: editingFeed?.id || `feed_${Date.now()}`,
      ...formData,
      quantity: formData.quantity ? parseInt(formData.quantity) : null,
      weightKg: formData.weightKg ? parseFloat(formData.weightKg) : null,
      unitPrice: formData.unitPrice ? parseFloat(formData.unitPrice) : null,
      totalPrice: calculatedTotal ? parseFloat(calculatedTotal) : null,
      minStock: formData.minStock ? parseInt(formData.minStock) : null,
    };

    try {
      const url = editingFeed ? '/api/feed-inventory' : '/api/feed-inventory';
      const method = editingFeed ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save feed inventory');

      await fetchFeeds();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving feed inventory:', error);
    }
  };

  const handleDelete = async (feed: FeedInventoryType) => {
    if (!confirm(`Hapus pakan "${feed.name}"?`)) return;

    try {
      const res = await fetch(`/api/feed-inventory?id=${feed.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete feed inventory');
      await fetchFeeds();
    } catch (error) {
      console.error('Error deleting feed inventory:', error);
    }
  };

  const handleOpenUsageModal = (feed: FeedInventoryType) => {
    setSelectedFeed(feed);
    setUsageData({
      date: new Date().toISOString().split('T')[0],
      quantity: '',
      weightKg: '',
      purpose: '',
      notes: '',
    });
    setShowUsageModal(true);
  };

  const handleCloseUsageModal = () => {
    setShowUsageModal(false);
    setSelectedFeed(null);
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFeed) return;

    const payload = {
      id: `usage_${Date.now()}`,
      itemId: selectedFeed.id,
      itemType: 'feed' as const,
      date: usageData.date,
      quantity: parseInt(usageData.quantity) || 0,
      weightKg: usageData.weightKg ? parseFloat(usageData.weightKg) : null,
      purpose: usageData.purpose || null,
      notes: usageData.notes || null,
    };

    try {
      const res = await fetch('/api/inventory-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to record usage');

      await fetchFeeds();
      handleCloseUsageModal();
    } catch (error) {
      console.error('Error recording usage:', error);
    }
  };

  const columns: Column<FeedInventoryType>[] = [
    {
      header: 'No',
      key: 'index',
      width: '50px',
      render: (item, index) => index + 1,
    },
    {
      header: 'Nama Pakan',
      key: 'name',
      width: '180px',
      mobile: { label: 'Nama' },
    },
    {
      header: 'Tanggal Pembelian',
      key: 'purchaseDate',
      width: '140px',
      render: (item) => item.purchaseDate || '—',
      mobile: { label: 'Tgl Beli' },
    },
    {
      header: 'Jumlah',
      key: 'quantity',
      width: '80px',
      render: (item) => item.quantity ?? '—',
      mobile: { label: 'Jumlah' },
    },
    {
      header: 'Berat (Kg/Ton)',
      key: 'weightKg',
      width: '120px',
      render: (item) => item.weightKg ? `${item.weightKg} kg` : '—',
      mobile: { label: 'Berat' },
    },
    {
      header: 'Unit',
      key: 'unit',
      width: '80px',
      render: (item) => item.unit || '—',
    },
    {
      header: 'Stok Saat Ini',
      key: 'currentStock',
      width: '120px',
      render: (item) => {
        const stock = item.currentStock;
        const minStock = item.minStock;
        
        if (stock === null || stock === undefined) return '—';
        
        const isLow = minStock !== null && minStock !== undefined && stock <= minStock;
        
        return (
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            background: isLow ? '#ef444420' : '#22c55e20',
            color: isLow ? '#ef4444' : '#22c55e',
            fontSize: 'var(--fs-sm)',
            fontWeight: 500,
          }}>
            {stock} {isLow && '⚠️'}
          </span>
        );
      },
      mobile: { label: 'Stok' },
    },
    {
      header: 'Supplier',
      key: 'supplier',
      width: '150px',
      render: (item) => item.supplier || '—',
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
      <DataTable
        title="Inventaris Pakan"
        subtitle="Inventoris Stok Cadangan Pakan Sapi"
        icon="🌾"
        data={feeds}
        columns={columns}
        onAdd={() => handleOpenModal()}
        onRowClick={(feed) => handleOpenModal(feed)}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="Belum ada pakan. Klik '+ Tambah' untuk menambah."
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingFeed ? 'Edit Pakan' : 'Tambah Pakan Baru'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="field-label">Nama Pakan</label>
            <input
              className="field-input"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Puruk Sapi Laktasi, Dedak Halus"
              required
            />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Jumlah</label>
              <input
                className="field-input"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="0"
              />
            </div>

            <div>
              <label className="field-label">Berat (Kg)</label>
              <input
                className="field-input"
                type="number"
                step="0.01"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="field-label">Unit</label>
              <select
                className="field-input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="">Pilih Unit</option>
                {FEED_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Harga per Unit</label>
              <input
                className="field-input"
                type="number"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="field-label">Total Harga</label>
              <input
                className="field-input"
                type="number"
                step="0.01"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                placeholder="Auto-calculate"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Tanggal Kadaluarsa</label>
              <input
                className="field-input"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>

            <div>
              <label className="field-label">Minimum Stok</label>
              <input
                className="field-input"
                type="number"
                value={formData.minStock}
                onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                placeholder="Alert threshold"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Supplier</label>
            <input
              className="field-input"
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              placeholder="Nama supplier"
            />
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
              {editingFeed ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Usage Tracking Modal */}
      <Modal isOpen={showUsageModal} onClose={handleCloseUsageModal} title="Catat Penggunaan Pakan">
        {selectedFeed && (
          <form onSubmit={handleUsageSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 12, background: '#f0f4f8', borderRadius: 8 }}>
              <div style={{ fontSize: 'var(--fs-sm)', color: '#666' }}>Pakan:</div>
              <div style={{ fontWeight: 600, color: '#333' }}>{selectedFeed.name}</div>
              <div style={{ fontSize: 'var(--fs-sm)', color: '#666', marginTop: 4 }}>
                Stok saat ini: <strong>{selectedFeed.currentStock ?? '—'}</strong>
              </div>
            </div>

            <div>
              <label className="field-label">Tanggal Penggunaan</label>
              <input
                className="field-input"
                type="date"
                value={usageData.date}
                onChange={(e) => setUsageData({ ...usageData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label">Jumlah Digunakan</label>
              <input
                className="field-input"
                type="number"
                value={usageData.quantity}
                onChange={(e) => setUsageData({ ...usageData, quantity: e.target.value })}
                min="1"
                required
              />
            </div>

            <div>
              <label className="field-label">Berat (Kg)</label>
              <input
                className="field-input"
                type="number"
                step="0.01"
                value={usageData.weightKg}
                onChange={(e) => setUsageData({ ...usageData, weightKg: e.target.value })}
                placeholder="Opsional"
              />
            </div>

            <div>
              <label className="field-label">Tujuan</label>
              <input
                className="field-input"
                type="text"
                value={usageData.purpose}
                onChange={(e) => setUsageData({ ...usageData, purpose: e.target.value })}
                placeholder="Contoh: Pemberian pakan sapi laktasi"
              />
            </div>

            <div>
              <label className="field-label">Keterangan</label>
              <textarea
                className="field-input"
                value={usageData.notes}
                onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
                rows={2}
                placeholder="Catatan tambahan..."
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <Button type="button" onClick={handleCloseUsageModal} variant="secondary">
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Catat Penggunaan
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
