'use client';

import React, { useState, useEffect } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/Navigation';
import { StatsSection } from '@/components/StatsSection';
import { HerdTab, MilkingTab, EventsTab } from '@/components/tabs';
import { Modal } from '@/components/Modal';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { AddCowForm, AddMilkingForm, AddEventForm } from '@/components/forms';
import { UserManagement } from '@/components/UserManagement';
import { todayStr } from '@/lib/utils';
import { BREEDS, STATUSES, SESSIONS, ETYPES, Cow, MilkingRecord, FarmEvent } from '@/types';

interface CowFormData {
  name: string;
  breed: string;
  gender: 'Betina' | 'Jantan';
  dob: string;
  weight: string;
  status: string;
  tag: string;
  sire: string;
  dam: string;
}

interface MilkingFormData {
  cowId: string;
  date: string;
  session: string;
  volume: string;
  fat: string;
  protein: string;
  notes: string;
}

interface EventFormData {
  cowId: string;
  date: string;
  type: string;
  description: string;
  vet: string;
  followUp: string;
}

const TABS = [
  { key: 'cows', label: '🐄 Ternak', count: 0 },
  { key: 'milking', label: '🥛 Pemerahan', count: 0 },
  { key: 'events', label: '📋 Kegiatan', count: 0 },
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('cows');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [editingMilking, setEditingMilking] = useState<MilkingRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<FarmEvent | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);

  const { cows, milking, events, addCow, updateCow, deleteCow, addMilking, updateMilking, deleteMilking, addEvent, updateEvent, deleteEvent } = useFarm();

  // Form states
  const [cowForm, setCowForm] = useState<CowFormData>({
    name: '',
    breed: BREEDS[0],
    gender: 'Betina',
    dob: '',
    weight: '',
    status: STATUSES[0],
    tag: '',
    sire: '',
    dam: '',
  });

  const [milkingForm, setMilkingForm] = useState<MilkingFormData>({
    cowId: '',
    date: todayStr(),
    session: SESSIONS[0],
    volume: '',
    fat: '',
    protein: '',
    notes: '',
  });

  const [eventForm, setEventForm] = useState<EventFormData>({
    cowId: '',
    date: todayStr(),
    type: ETYPES[0],
    description: '',
    vet: '',
    followUp: '',
  });

  const flash = (message: string) => {
    setToast(message);
  };

  const openEditCow = (cow: Cow) => {
    setEditingCow(cow);
    setCowForm({
      name: cow.name,
      breed: cow.breed,
      gender: cow.gender,
      dob: cow.dob,
      weight: String(cow.weight),
      status: cow.status,
      tag: cow.tag,
      sire: cow.sire || '',
      dam: cow.dam || '',
    });
    setModalOpen('cow-edit');
  };

  const openEditMilking = (record: MilkingRecord) => {
    setEditingMilking(record);
    setMilkingForm({
      cowId: record.cowId,
      date: record.date,
      session: record.session,
      volume: String(record.volume),
      fat: String(record.fat),
      protein: String(record.protein),
      notes: record.notes || '',
    });
    setModalOpen('milk-edit');
  };

  const openEditEvent = (event: FarmEvent) => {
    setEditingEvent(event);
    setEventForm({
      cowId: event.cowId,
      date: event.date,
      type: event.type,
      description: event.description,
      vet: event.vet,
      followUp: event.followUp,
    });
    setModalOpen('event-edit');
  };

  const handleAddCow = () => {
    if (!cowForm.name || !cowForm.tag || !cowForm.dob) {
      flash('⚠ Nama, nomor telinga, dan tanggal lahir harus diisi');
      return;
    }
    if (editingCow) {
      updateCow({
        ...editingCow,
        ...cowForm,
        weight: +cowForm.weight || 0,
        status: cowForm.status as Cow['status'],
      });
      flash('Data sapi berhasil diperbarui ✓');
    } else {
      addCow({
        ...cowForm,
        weight: +cowForm.weight || 0,
        status: cowForm.status as Cow['status'],
      });
      flash('Sapi berhasil didaftarkan ✓');
    }
    resetCowForm();
    setModalOpen(null);
    setEditingCow(null);
  };

  const handleAddMilking = () => {
    if (!milkingForm.cowId || !milkingForm.volume) {
      flash('⚠ Pilih sapi dan masukkan volume susu');
      return;
    }
    const cow = cows.find((c) => c.id === milkingForm.cowId);
    if (editingMilking) {
      updateMilking({
        ...editingMilking,
        ...milkingForm,
        cowName: cow?.name || editingMilking.cowName,
        volume: +milkingForm.volume,
        fat: +milkingForm.fat || 0,
        protein: +milkingForm.protein || 0,
        session: milkingForm.session as MilkingRecord['session'],
      });
      flash('Data pemerahan berhasil diperbarui ✓');
    } else {
      addMilking({
        ...milkingForm,
        cowName: cow?.name || '',
        volume: +milkingForm.volume,
        fat: +milkingForm.fat || 0,
        protein: +milkingForm.protein || 0,
        session: milkingForm.session as MilkingRecord['session'],
      });
      flash('Data pemerahan berhasil disimpan ✓');
    }
    resetMilkingForm();
    setModalOpen(null);
    setEditingMilking(null);
  };

  const handleAddEvent = () => {
    if (!eventForm.cowId || !eventForm.description) {
      flash('⚠ Pilih sapi dan tambahkan deskripsi');
      return;
    }
    const cow = cows.find((c) => c.id === eventForm.cowId);
    if (editingEvent) {
      updateEvent({
        ...editingEvent,
        ...eventForm,
        cowName: cow?.name || editingEvent.cowName,
        type: eventForm.type as FarmEvent['type'],
      });
      flash('Kegiatan berhasil diperbarui ✓');
    } else {
      addEvent({
        ...eventForm,
        cowName: cow?.name || '',
        type: eventForm.type as FarmEvent['type'],
      });
      flash('Kegiatan berhasil dicatat ✓');
    }
    resetEventForm();
    setModalOpen(null);
    setEditingEvent(null);
  };

  const resetCowForm = () => {
    setCowForm({
      name: '',
      breed: BREEDS[0],
      gender: 'Betina',
      dob: '',
      weight: '',
      status: STATUSES[0],
      tag: '',
      sire: '',
      dam: '',
    });
  };

  const resetMilkingForm = () => {
    setMilkingForm({
      cowId: '',
      date: todayStr(),
      session: SESSIONS[0],
      volume: '',
      fat: '',
      protein: '',
      notes: '',
    });
  };

  const resetEventForm = () => {
    setEventForm({
      cowId: '',
      date: todayStr(),
      type: ETYPES[0],
      description: '',
      vet: '',
      followUp: '',
    });
  };

  const handleDeleteCow = (cow: Cow) => {
    setDeleteConfirm({ type: 'cow', id: cow.id, name: cow.name });
  };

  const handleDeleteMilking = (id: string) => {
    const record = milking.find(r => r.id === id);
    setDeleteConfirm({ type: 'milking', id, name: `Pemerahan ${record?.cowName || ''}` });
  };

  const handleDeleteEvent = (id: string) => {
    const event = events.find(e => e.id === id);
    setDeleteConfirm({ type: 'event', id, name: `${event?.type || ''} - ${event?.cowName || ''}` });
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'cow') {
      deleteCow(deleteConfirm.id);
      flash('Sapi berhasil dihapus ✓');
    } else if (deleteConfirm.type === 'milking') {
      deleteMilking(deleteConfirm.id);
      flash('Data pemerahan berhasil dihapus ✓');
    } else if (deleteConfirm.type === 'event') {
      deleteEvent(deleteConfirm.id);
      flash('Kegiatan berhasil dihapus ✓');
    }
    setDeleteConfirm(null);
  };

  const tabsWithCount = TABS.map((tab) => ({
    ...tab,
    count: tab.key === 'cows' ? cows.length : tab.key === 'milking' ? milking.length : events.length,
  }));

  const femaleCows = cows.filter((c) => c.gender === 'Betina');

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // Don't render if not authenticated (redirecting)
  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        tabs={tabsWithCount}
        onOpenUsers={() => setShowUserManagement(true)}
      />

      <div className="page-container" style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 28px', width: '100%', overflowX: 'hidden' }}>
        <StatsSection />

        {activeTab === 'cows' && (
          <HerdTab
            onAddCow={() => { setEditingCow(null); resetCowForm(); setModalOpen('cow'); }}
            onEditCow={openEditCow}
            onDeleteCow={handleDeleteCow}
          />
        )}
        {activeTab === 'milking' && (
          <MilkingTab
            onAddMilking={() => { setEditingMilking(null); resetMilkingForm(); setModalOpen('milk'); }}
            onEditMilking={openEditMilking}
            onDeleteMilking={handleDeleteMilking}
          />
        )}
        {activeTab === 'events' && (
          <EventsTab
            onAddEvent={() => { setEditingEvent(null); resetEventForm(); setModalOpen('event'); }}
            onEditEvent={openEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>

      {/* Cow Modal - Add */}
      <Modal
        isOpen={modalOpen === 'cow'}
        onClose={() => { setModalOpen(null); setEditingCow(null); resetCowForm(); }}
        title="🐄 Daftarkan Sapi Baru"
        subtitle="Tambahkan hewan ke registri ternak"
      >
        <AddCowForm
          formData={cowForm}
          onChange={setCowForm}
          onSubmit={handleAddCow}
          onCancel={() => { setModalOpen(null); setEditingCow(null); resetCowForm(); }}
          initialData={null}
        />
      </Modal>

      {/* Cow Modal - Edit */}
      <Modal
        isOpen={modalOpen === 'cow-edit'}
        onClose={() => { setModalOpen(null); setEditingCow(null); resetCowForm(); }}
        title="🐄 Edit Data Sapi"
        subtitle="Perbarui informasi ternak"
      >
        <AddCowForm
          formData={cowForm}
          onChange={setCowForm}
          onSubmit={handleAddCow}
          onCancel={() => { setModalOpen(null); setEditingCow(null); resetCowForm(); }}
          initialData={editingCow}
        />
      </Modal>

      {/* Milking Modal - Add */}
      <Modal
        isOpen={modalOpen === 'milk'}
        onClose={() => { setModalOpen(null); setEditingMilking(null); resetMilkingForm(); }}
        title="🥛 Catat Session Pemerahan"
        subtitle="Rekam data produksi susu"
      >
        <AddMilkingForm
          formData={milkingForm}
          onChange={setMilkingForm}
          onSubmit={handleAddMilking}
          onCancel={() => { setModalOpen(null); setEditingMilking(null); resetMilkingForm(); }}
          femaleCows={femaleCows}
          initialData={null}
        />
      </Modal>

      {/* Milking Modal - Edit */}
      <Modal
        isOpen={modalOpen === 'milk-edit'}
        onClose={() => { setModalOpen(null); setEditingMilking(null); resetMilkingForm(); }}
        title="🥛 Edit Data Pemerahan"
        subtitle="Perbarui catatan pemerahan"
      >
        <AddMilkingForm
          formData={milkingForm}
          onChange={setMilkingForm}
          onSubmit={handleAddMilking}
          onCancel={() => { setModalOpen(null); setEditingMilking(null); resetMilkingForm(); }}
          femaleCows={femaleCows}
          initialData={editingMilking}
        />
      </Modal>

      {/* Event Modal - Add */}
      <Modal
        isOpen={modalOpen === 'event'}
        onClose={() => { setModalOpen(null); setEditingEvent(null); resetEventForm(); }}
        title="📋 Catat Kegiatan Peternakan"
        subtitle="Rekam kegiatan kesehatan atau peternakan"
      >
        <AddEventForm
          formData={eventForm}
          onChange={setEventForm}
          onSubmit={handleAddEvent}
          onCancel={() => { setModalOpen(null); setEditingEvent(null); resetEventForm(); }}
          cows={cows}
          initialData={null}
        />
      </Modal>

      {/* Event Modal - Edit */}
      <Modal
        isOpen={modalOpen === 'event-edit'}
        onClose={() => { setModalOpen(null); setEditingEvent(null); resetEventForm(); }}
        title="📋 Edit Kegiatan Peternakan"
        subtitle="Perbarui catatan kegiatan"
      >
        <AddEventForm
          formData={eventForm}
          onChange={setEventForm}
          onSubmit={handleAddEvent}
          onCancel={() => { setModalOpen(null); setEditingEvent(null); resetEventForm(); }}
          cows={cows}
          initialData={editingEvent}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="⚠️ Konfirmasi Hapus"
        subtitle="Tindakan ini tidak dapat dibatalkan"
      >
        <div style={{ padding: '20px 0' }}>
          <p style={{ fontSize: 'var(--fs-lg)', color: '#3a2e20', marginBottom: 20 }}>
            Apakah Anda yakin ingin menghapus <strong>{deleteConfirm?.name}</strong>?
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Batal</Button>
            <Button onClick={confirmDelete} style={{ background: '#c0392b' }}>Ya, Hapus</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />

      {/* User Management Modal - Admin Only */}
      <UserManagement 
        isOpen={showUserManagement}
        onClose={() => setShowUserManagement(false)}
      />
    </div>
  );
}
