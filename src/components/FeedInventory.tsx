'use client';

import React, { useState, useEffect } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { FEED_UNITS, type FeedInventory as FeedInventoryType, type Asset } from '@/types';

interface FeedInventoryProps {
  onNavigate?: (page: string) => void;
  onAdd?: () => void;
  onRowClick?: (feed: FeedInventoryType) => void;
  onDelete?: (feed: FeedInventoryType) => void;
  feeds?: FeedInventoryType[];
  loading?: boolean;
}

export function FeedInventory({ onNavigate, onAdd, onRowClick, onDelete, feeds: externalFeeds, loading: externalLoading }: FeedInventoryProps) {
  const [internalFeeds, setInternalFeeds] = useState<FeedInventoryType[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState<FeedInventoryType | null>(null);

  const feeds = externalFeeds !== undefined ? externalFeeds : internalFeeds;
  const loading = externalLoading !== undefined ? externalLoading : internalLoading;

  // Usage form state
  const [usageData, setUsageData] = useState({
    date: '',
    quantity: '',
    weightKg: '',
    purpose: '',
    notes: '',
  });

  useEffect(() => {
    if (externalFeeds === undefined) {
      fetchFeeds();
    }
  }, [externalFeeds]);

  const fetchFeeds = async () => {
    try {
      setInternalLoading(true);
      const res = await fetch('/api/feed-inventory');
      if (!res.ok) throw new Error('Failed to fetch feed inventory');
      const data = await res.json();
      setInternalFeeds(data);
    } catch (error) {
      console.error('Error fetching feed inventory:', error);
    } finally {
      setInternalLoading(false);
    }
  };

  const handleDelete = (feed: FeedInventoryType) => {
    if (onDelete) {
      onDelete(feed);
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
        onAdd={onAdd || (() => {})}
        onRowClick={onRowClick || (() => {})}
        onDelete={onDelete || (() => {})}
        loading={loading}
        emptyMessage="Belum ada pakan. Klik '+ Tambah' untuk menambah."
      />

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
