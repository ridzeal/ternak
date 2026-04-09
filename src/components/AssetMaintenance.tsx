'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { DataTable, Column } from '@/components/DataTable';
import { MAINTENANCE_TYPES, type AssetMaintenance as AssetMaintenanceType, type Asset } from '@/types';

interface AssetMaintenanceProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AssetMaintenance({ asset, isOpen, onClose }: AssetMaintenanceProps) {
  const [records, setRecords] = useState<AssetMaintenanceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AssetMaintenanceType | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    type: 'Routine' as AssetMaintenanceType['type'],
    description: '',
    cost: '',
    vendor: '',
    nextMaintenance: '',
    notes: '',
  });

  useEffect(() => {
    if (asset && isOpen) {
      fetchRecords();
    }
  }, [asset, isOpen]);

  const fetchRecords = async () => {
    if (!asset) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/asset-maintenance?assetId=${asset.id}`);
      if (!res.ok) throw new Error('Failed to fetch maintenance records');
      const data = await res.json();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRecord(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'Routine',
      description: '',
      cost: '',
      vendor: '',
      nextMaintenance: '',
      notes: '',
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset) return;

    const payload = {
      id: editingRecord?.id || `maint_${Date.now()}`,
      assetId: asset.id,
      ...formData,
      cost: formData.cost ? parseFloat(formData.cost) : null,
    };

    try {
      const url = editingRecord ? '/api/asset-maintenance' : '/api/asset-maintenance';
      const method = editingRecord ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save maintenance record');

      await fetchRecords();
      handleCloseAddModal();
    } catch (error) {
      console.error('Error saving maintenance record:', error);
    }
  };

  const handleDelete = async (record: AssetMaintenanceType) => {
    if (!confirm(`Hapus catatan perawatan ini?`)) return;

    try {
      const res = await fetch(`/api/asset-maintenance?id=${record.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete maintenance record');
      await fetchRecords();
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
    }
  };

  const columns: Column<AssetMaintenanceType>[] = [
    {
      header: 'No',
      key: 'index',
      width: '50px',
      render: (item, index) => index + 1,
    },
    {
      header: 'Tanggal',
      key: 'date',
      width: '120px',
    },
    {
      header: 'Tipe',
      key: 'type',
      width: '120px',
      render: (item) => {
        const typeColors: Record<string, string> = {
          Routine: '#3b82f6',
          Repair: '#f59e0b',
          Inspection: '#22c55e',
          Replacement: '#ef4444',
        };
        const color = typeColors[item.type] || '#6b7280';
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
            {item.type}
          </span>
        );
      },
    },
    {
      header: 'Deskripsi',
      key: 'description',
      width: '1fr',
    },
    {
      header: 'Biaya',
      key: 'cost',
      width: '120px',
      render: (item) => item.cost != null ? `Rp ${Number(item.cost).toLocaleString('id-ID')}` : '—',
    },
    {
      header: 'Vendor',
      key: 'vendor',
      width: '150px',
      render: (item) => item.vendor || '—',
    },
    {
      header: 'Perawatan Berikutnya',
      key: 'nextMaintenance',
      width: '160px',
      render: (item) => item.nextMaintenance || '—',
    },
  ];

  if (!asset) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={`Perawatan Aset: ${asset.name}`}>
        <div style={{ maxHeight: '70vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0 }}>Riwayat Perawatan</h3>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--fs-sm)', color: '#666' }}>
                {records.length} catatan
              </p>
            </div>
            <Button onClick={handleOpenAddModal}>+ Tambah</Button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#8a7d6b' }}>Memuat data...</div>
            ) : records.length === 0 ? (
              <div style={{
                padding: 48,
                textAlign: 'center',
                color: '#8a7d6b',
                fontSize: 14,
                background: '#faf6ee',
                borderRadius: 14,
                border: '1px solid #e0d4c0',
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔧</div>
                Belum ada catatan perawatan. Klik '+ Tambah' untuk menambah.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {records.map((record, index) => (
                  <div key={record.id} style={{
                    padding: 16,
                    background: '#faf6ee',
                    borderRadius: 12,
                    border: '1px solid #e0d4c0',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: '12px',
                            background: `${record.type === 'Routine' ? '#3b82f6' : record.type === 'Repair' ? '#f59e0b' : record.type === 'Inspection' ? '#22c55e' : '#ef4444'}20`,
                            color: record.type === 'Routine' ? '#3b82f6' : record.type === 'Repair' ? '#f59e0b' : record.type === 'Inspection' ? '#22c55e' : '#ef4444',
                            fontSize: 'var(--fs-sm)',
                            fontWeight: 500,
                          }}>
                            {record.type}
                          </span>
                          <span style={{ fontSize: 'var(--fs-sm)', color: '#666' }}>{record.date}</span>
                        </div>
                        <div style={{ fontSize: 'var(--fs-md)', color: '#3a2e20', marginBottom: 8 }}>
                          {record.description}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          if (confirm('Hapus catatan ini?')) {
                            handleDelete(record);
                          }
                        }}
                        style={{ padding: '4px 8px', fontSize: 'var(--fs-xs)' }}
                      >
                        Hapus
                      </Button>
                    </div>

                    {(record.cost || record.vendor || record.nextMaintenance) && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: 12,
                        paddingTop: 12,
                        borderTop: '1px solid #e0d4c0',
                        fontSize: 'var(--fs-sm)',
                      }}>
                        {record.cost && (
                          <div>
                            <div style={{ color: '#8a7d6b', marginBottom: 4 }}>Biaya</div>
                            <div style={{ fontWeight: 500, color: '#3a2e20' }}>
                              Rp {Number(record.cost).toLocaleString('id-ID')}
                            </div>
                          </div>
                        )}
                        {record.vendor && (
                          <div>
                            <div style={{ color: '#8a7d6b', marginBottom: 4 }}>Vendor</div>
                            <div style={{ fontWeight: 500, color: '#3a2e20' }}>{record.vendor}</div>
                          </div>
                        )}
                        {record.nextMaintenance && (
                          <div>
                            <div style={{ color: '#8a7d6b', marginBottom: 4 }}>Perawatan Berikutnya</div>
                            <div style={{ fontWeight: 500, color: '#3a2e20' }}>{record.nextMaintenance}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {record.notes && (
                      <div style={{
                        marginTop: 12,
                        paddingTop: 12,
                        borderTop: '1px solid #e0d4c0',
                        fontSize: 'var(--fs-sm)',
                        color: '#666',
                        fontStyle: 'italic',
                      }}>
                        {record.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal isOpen={showAddModal} onClose={handleCloseAddModal} title={editingRecord ? 'Edit Perawatan' : 'Tambah Perawatan Baru'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Tanggal</label>
              <input
                className="field-input"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label">Tipe Perawatan</label>
              <select
                className="field-input"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AssetMaintenanceType['type'] })}
              >
                {MAINTENANCE_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="field-label">Deskripsi</label>
            <textarea
              className="field-input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Deskripsi perawatan..."
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Biaya (Rp)</label>
              <input
                className="field-input"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <label className="field-label">Vendor</label>
              <input
                className="field-input"
                type="text"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Nama vendor"
              />
            </div>
          </div>

          <div>
            <label className="field-label">Jadwal Perawatan Berikutnya</label>
            <input
              className="field-input"
              type="date"
              value={formData.nextMaintenance}
              onChange={(e) => setFormData({ ...formData, nextMaintenance: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label">Keterangan</label>
            <textarea
              className="field-input"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Catatan tambahan..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" onClick={handleCloseAddModal} variant="secondary">
              Batal
            </Button>
            <Button type="submit" variant="primary">
              {editingRecord ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
