'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DataTable, Column } from '@/components/DataTable';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import {
  REPRODUCTIVE_EVENT_TYPES, PREGNANCY_STATUSES, CALVING_EASE,
  type ReproductiveEvent, type Cow
} from '@/types';

interface ReproductiveTrackingProps {
  onNavigate?: (page: string) => void;
}

const eventTypeIcons: Record<string, string> = {
  'Heat': '🔥',
  'Insemination': '💉',
  'Pregnancy Check': '🩺',
  'Pregnant': '🤰',
  'Miscarriage': '⚠️',
  'Calving': '🐣',
  'Edema': '🩹',
};

const eventTypeColors: Record<string, string> = {
  'Heat': '#f97316',
  'Insemination': '#8b5cf6',
  'Pregnancy Check': '#3b82f6',
  'Pregnant': '#ec4899',
  'Miscarriage': '#ef4444',
  'Calving': '#22c55e',
  'Edema': '#eab308',
};

export function ReproductiveTracking({ onNavigate }: ReproductiveTrackingProps) {
  const [events, setEvents] = useState<ReproductiveEvent[]>([]);
  const [cows, setCows] = useState<Cow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ReproductiveEvent | null>(null);
  const [filterType, setFilterType] = useState<string>('');
  const [filterCow, setFilterCow] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    cowId: '',
    cowName: '',
    eventType: 'Heat',
    eventDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    actualDate: '',
    semenId: '',
    semenSource: '',
    technician: '',
    pregnancyStatus: '',
    pregnancyDays: '',
    calfGender: '',
    calfWeight: '',
    calvingEase: '',
    status: 'Active',
    notes: '',
  });

  useEffect(() => {
    fetchEvents();
    fetchCows();
  }, [filterType, filterCow]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) params.set('eventType', filterType);
      if (filterCow) params.set('cowId', filterCow);

      const res = await fetch(`/api/reproductive-events?${params}`);
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching reproductive events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCows = async () => {
    try {
      const res = await fetch('/api/cows');
      if (res.ok) {
        const data = await res.json();
        setCows(data.filter((c: Cow) => c.gender === 'Betina'));
      }
    } catch (error) {
      console.error('Error fetching cows:', error);
    }
  };

  const handleOpenModal = (event?: ReproductiveEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        cowId: event.cowId,
        cowName: event.cowName,
        eventType: event.eventType,
        eventDate: event.eventDate,
        expectedDate: event.expectedDate || '',
        actualDate: event.actualDate || '',
        semenId: event.semenId || '',
        semenSource: event.semenSource || '',
        technician: event.technician || '',
        pregnancyStatus: event.pregnancyStatus || '',
        pregnancyDays: String(event.pregnancyDays || ''),
        calfGender: event.calfGender || '',
        calfWeight: String(event.calfWeight || ''),
        calvingEase: event.calvingEase || '',
        status: event.status || 'Active',
        notes: event.notes || '',
      });
    } else {
      setEditingEvent(null);
      setFormData({
        cowId: '', cowName: '', eventType: 'Heat',
        eventDate: new Date().toISOString().split('T')[0],
        expectedDate: '', actualDate: '',
        semenId: '', semenSource: '', technician: '',
        pregnancyStatus: '', pregnancyDays: '',
        calfGender: '', calfWeight: '', calvingEase: '',
        status: 'Active', notes: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cow = cows.find(c => c.id === formData.cowId);

    const payload = {
      id: editingEvent?.id || `re_${Date.now()}`,
      ...formData,
      cowName: cow?.name || formData.cowName,
      pregnancyDays: formData.pregnancyDays ? parseInt(formData.pregnancyDays) : null,
      calfWeight: formData.calfWeight ? parseFloat(formData.calfWeight) : null,
    };

    try {
      const url = editingEvent ? '/api/reproductive-events' : '/api/reproductive-events';
      const method = editingEvent ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save event');

      await fetchEvents();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (event: ReproductiveEvent) => {
    if (!confirm(`Hapus event "${event.eventType}" - ${event.cowName}?`)) return;

    try {
      const res = await fetch(`/api/reproductive-events?id=${event.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete event');
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const pregnant = events.filter(e => e.eventType === 'Pregnant').length;
    const inseminations = events.filter(e => e.eventType === 'Insemination').length;
    const calvings = events.filter(e => e.eventType === 'Calving').length;
    const miscarriages = events.filter(e => e.eventType === 'Miscarriage').length;

    // Due soon (expected within next 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    const dueSoon = events.filter(e => {
      if (!e.expectedDate) return false;
      const expected = new Date(e.expectedDate);
      return expected >= today && expected <= thirtyDaysFromNow;
    });

    return { pregnant, inseminations, calvings, miscarriages, dueSoon };
  }, [events]);

  const columns: Column<ReproductiveEvent>[] = [
    {
      header: '',
      key: 'icon',
      width: '40px',
      render: (item) => (
        <span style={{ fontSize: 20 }}>{eventTypeIcons[item.eventType] || '📋'}</span>
      ),
    },
    {
      header: 'Jenis Event',
      key: 'eventType',
      width: '160px',
      render: (item) => {
        const color = eventTypeColors[item.eventType] || '#6b7280';
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
            {item.eventType}
          </span>
        );
      },
      mobile: { label: 'Event' },
    },
    {
      header: 'Sapi',
      key: 'cowName',
      width: '130px',
      mobile: { label: 'Sapi' },
    },
    {
      header: 'Tanggal',
      key: 'eventDate',
      width: '110px',
      mobile: { label: 'Tanggal' },
    },
    {
      header: 'Tanggal Diharapkan',
      key: 'expectedDate',
      width: '140px',
      render: (item) => {
        if (!item.expectedDate) return '—';
        const expected = new Date(item.expectedDate);
        const today = new Date();
        const diffDays = Math.ceil((expected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          return <span style={{ color: '#ef4444', fontSize: 'var(--fs-sm)' }}>Terlambat {Math.abs(diffDays)} hari</span>;
        }
        if (diffDays <= 7) {
          return <span style={{ color: '#f97316', fontSize: 'var(--fs-sm)' }}>⚠️ {diffDays} hari lagi</span>;
        }
        return <span style={{ color: '#22c55e', fontSize: 'var(--fs-sm)' }}>{item.expectedDate}</span>;
      },
    },
    {
      header: 'Status Kehamilan',
      key: 'pregnancyStatus',
      width: '130px',
      render: (item) => item.pregnancyStatus || '—',
    },
    {
      header: 'Catatan',
      key: 'notes',
      width: '200px',
      render: (item) => item.notes || '—',
      mobile: { label: 'Catatan' },
    },
  ];

  return (
    <div>
      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <div style={{ padding: 14, background: '#fce7f3', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#be185d', textTransform: 'uppercase' }}>Hamil</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ec4899' }}>{stats.pregnant}</div>
        </div>
        <div style={{ padding: 14, background: '#ede9fe', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#6d28d9', textTransform: 'uppercase' }}>Inseminasi</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>{stats.inseminations}</div>
        </div>
        <div style={{ padding: 14, background: '#dcfce7', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#15803d', textTransform: 'uppercase' }}>Melahirkan</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#22c55e' }}>{stats.calvings}</div>
        </div>
        <div style={{ padding: 14, background: '#fee2e2', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#b91c1c', textTransform: 'uppercase' }}>Keguguran</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{stats.miscarriages}</div>
        </div>
        <div style={{ padding: 14, background: '#fef3c7', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#92400e', textTransform: 'uppercase' }}>Segera Melahirkan</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f59e0b' }}>{stats.dueSoon.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 'var(--fs-sm)', color: '#8a7d6b', fontWeight: 500 }}>Filter:</label>
        <select
          value={filterCow}
          onChange={(e) => setFilterCow(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e0d4c0',
            background: '#faf6ee',
            fontSize: 'var(--fs-sm)',
            color: '#3a2e20',
          }}
        >
          <option value="">Semua Sapi</option>
          {cows.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e0d4c0',
            background: '#faf6ee',
            fontSize: 'var(--fs-sm)',
            color: '#3a2e20',
          }}
        >
          <option value="">Semua Event</option>
          {REPRODUCTIVE_EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Events Table */}
      <DataTable
        title="Reproduksi Ternak"
        subtitle="Tracking status reproduksi (dara, hamil, keguguran, edema, melahirkan)"
        icon="🐄"
        data={events}
        columns={columns}
        onAdd={() => handleOpenModal()}
        onRowClick={(event) => handleOpenModal(event)}
        onDelete={handleDelete}
        loading={loading}
        emptyMessage="Belum ada event reproduksi. Klik '+ Tambah' untuk menambah."
      />

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingEvent ? 'Edit Event Reproduksi' : 'Tambah Event Reproduksi'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Cow Selection */}
          <div>
            <label className="field-label">Sapi</label>
            <select
              className="field-input"
              value={formData.cowId}
              onChange={(e) => {
                const cow = cows.find(c => c.id === e.target.value);
                setFormData({ ...formData, cowId: e.target.value, cowName: cow?.name || '' });
              }}
              required
            >
              <option value="">Pilih Sapi</option>
              {cows.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.status})</option>
              ))}
            </select>
          </div>

          {/* Event Type & Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label className="field-label">Jenis Event</label>
              <select
                className="field-input"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                required
              >
                {REPRODUCTIVE_EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{eventTypeIcons[t]} {t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Tanggal Event</label>
              <input
                className="field-input"
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Insemination fields */}
          {(formData.eventType === 'Insemination' || formData.eventType === 'Pregnant') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Semen ID</label>
                <input
                  className="field-input"
                  type="text"
                  value={formData.semenId}
                  onChange={(e) => setFormData({ ...formData, semenId: e.target.value })}
                  placeholder="ID pejantan"
                />
              </div>
              <div>
                <label className="field-label">Sumber Semen</label>
                <input
                  className="field-input"
                  type="text"
                  value={formData.semenSource}
                  onChange={(e) => setFormData({ ...formData, semenSource: e.target.value })}
                  placeholder="Sumber"
                />
              </div>
              <div>
                <label className="field-label">Teknisi</label>
                <input
                  className="field-input"
                  type="text"
                  value={formData.technician}
                  onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
                  placeholder="Nama teknisi"
                />
              </div>
            </div>
          )}

          {/* Pregnancy fields */}
          {(formData.eventType === 'Pregnancy Check' || formData.eventType === 'Pregnant') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Status Kehamilan</label>
                <select
                  className="field-input"
                  value={formData.pregnancyStatus}
                  onChange={(e) => setFormData({ ...formData, pregnancyStatus: e.target.value })}
                >
                  <option value="">Pilih Status</option>
                  {PREGNANCY_STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">Hari Kehamilan</label>
                <input
                  className="field-input"
                  type="number"
                  value={formData.pregnancyDays}
                  onChange={(e) => setFormData({ ...formData, pregnancyDays: e.target.value })}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div>
                <label className="field-label">Tanggal Lahir Diharapkan</label>
                <input
                  className="field-input"
                  type="date"
                  value={formData.expectedDate}
                  onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Calving fields */}
          {formData.eventType === 'Calving' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div>
                <label className="field-label">Jenis Kelamin Anak</label>
                <select
                  className="field-input"
                  value={formData.calfGender}
                  onChange={(e) => setFormData({ ...formData, calfGender: e.target.value })}
                >
                  <option value="">Pilih</option>
                  <option value="Male">Jantan ♂</option>
                  <option value="Female">Betina ♀</option>
                  <option value="Twins">Kembar</option>
                </select>
              </div>
              <div>
                <label className="field-label">Berat Anak (kg)</label>
                <input
                  className="field-input"
                  type="number"
                  step="0.1"
                  value={formData.calfWeight}
                  onChange={(e) => setFormData({ ...formData, calfWeight: e.target.value })}
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="field-label">Kemudahan Melahirkan</label>
                <select
                  className="field-input"
                  value={formData.calvingEase}
                  onChange={(e) => setFormData({ ...formData, calvingEase: e.target.value })}
                >
                  <option value="">Pilih</option>
                  {CALVING_EASE.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Actual date for calving/miscarriage */}
          {(formData.eventType === 'Calving' || formData.eventType === 'Miscarriage') && (
            <div>
              <label className="field-label">Tanggal Aktual</label>
              <input
                className="field-input"
                type="date"
                value={formData.actualDate}
                onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
              />
            </div>
          )}

          {/* Notes */}
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
              {editingEvent ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
