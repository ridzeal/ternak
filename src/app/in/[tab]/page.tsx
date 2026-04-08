'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useFarm } from '@/context/FarmContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { SideNav } from '@/components/SideNav';
import { StatsSection } from '@/components/StatsSection';
import { DataTable } from '@/components/DataTable';
import { Modal, FormSidebar } from '@/components';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { AddCowForm, AddMilkingForm, AddEventForm, DailyMilkingForm, MilkCollectionForm } from '@/components/forms';
import { DailyMilkReport } from '@/components/reports/DailyMilkReport';
import { UserManagement } from '@/components/UserManagement';
import { todayStr } from '@/lib/utils';
import { BREEDS, STATUSES, SESSIONS, ETYPES, Cow, MilkingRecord, FarmEvent, MilkCollection } from '@/types';
import { statusStyle, sessionStyle, eventIcon } from '@/styles/theme';

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
  length: string;
  chestCircumference: string;
  reproductiveNotes: string;
}

interface MilkingFormData {
  cowId: string;
  date: string;
  session: string;
  volume: string;
  fat: string;
  protein: string;
  lactose: string;
  totalSolids: string;
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
  { key: 'herd', label: 'Ternak', icon: '🐄', count: 0 },
  { key: 'milking', label: 'Pemerahan', icon: '🥛', count: 0 },
  { key: 'daily', label: 'Input Harian', icon: '📝', count: 0 },
  { key: 'reports', label: 'Laporan', icon: '📊', count: 0 },
  { key: 'collection', label: 'Penjualan', icon: '🚛', count: 0 },
  { key: 'events', label: 'Kegiatan', icon: '📋', count: 0 },
];

interface InPageProps {
  params: { tab: string };
}

function InPageContent({ params }: InPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(params.tab || 'herd');

  // Read URL parameters for sidebar state
  const [urlParamsState, setUrlParamsState] = useState({
    showDetail: false,
    mode: null as 'view' | 'new' | 'edit' | null,
    id: null as string | null,
  });

  // Update URL params state only on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setUrlParamsState({
      showDetail: searchParams.get('showDetail') === 'true',
      mode: (searchParams.get('mode') as 'view' | 'new' | 'edit') || null,
      id: searchParams.get('id') || null,
    });
  }, []);

  const showDetail = urlParamsState.showDetail;
  const sidebarMode = urlParamsState.mode;
  const selectedId = urlParamsState.id;

  // Sync active tab with URL params
  useEffect(() => {
    if (TABS.some(t => t.key === params.tab)) {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const [toast, setToast] = useState<string | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [editingMilking, setEditingMilking] = useState<MilkingRecord | null>(null);
  const [editingEvent, setEditingEvent] = useState<FarmEvent | null>(null);
  const [editingCollection, setEditingCollection] = useState<MilkCollection | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [pendingDeleteFromSidebar, setPendingDeleteFromSidebar] = useState<Cow | null>(null);
  const [collectionRecords, setCollectionRecords] = useState<MilkCollection[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);

  const { cows, milking, events, addCow, updateCow, deleteCow, addMilking, updateMilking, deleteMilking, addEvent, updateEvent, deleteEvent, refreshData } = useFarm();

  // Track if we have an active sidebar session
  const hasActiveSession = showDetail && (sidebarMode === 'new' || sidebarMode === 'edit');

  // Fetch collection records
  const refreshCollection = useCallback(async () => {
    try {
      const res = await fetch('/api/milk-collection');
      if (res.ok) {
        const data = await res.json();
        setCollectionRecords(data);
      }
    } catch (error) {
      console.error('Error fetching milk collection:', error);
    }
  }, []);

  useEffect(() => {
    refreshCollection();
  }, [refreshCollection]);

  // Sync URL params with sidebar state
  useEffect(() => {
    if (!showDetail || !sidebarMode) return;

    if (sidebarMode === 'new') {
      setEditingCow(null);
      resetCowForm();
      setEditingMilking(null);
      resetMilkingForm();
      setEditingEvent(null);
      resetEventForm();
      setEditingCollection(null);
    }

    if (sidebarMode === 'edit' && selectedId) {
      // Try to find the record in each type
      const cow = cows.find(c => c.id === selectedId);
      if (cow) {
        setEditingCow(cow);
        setCowForm({
          name: cow.name, breed: cow.breed, gender: cow.gender, dob: cow.dob,
          weight: String(cow.weight), status: cow.status, tag: cow.tag,
          sire: cow.sire || '', dam: cow.dam || '',
          length: String(cow.length || ''), chestCircumference: String(cow.chestCircumference || ''),
          reproductiveNotes: cow.reproductiveNotes || '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDetail, sidebarMode, selectedId]);

  // Form states
  const [cowForm, setCowForm] = useState<CowFormData>({
    name: '', breed: BREEDS[0], gender: 'Betina', dob: '', weight: '',
    status: STATUSES[0], tag: '', sire: '', dam: '',
    length: '', chestCircumference: '', reproductiveNotes: '',
  });

  const [milkingForm, setMilkingForm] = useState<MilkingFormData>({
    cowId: '', date: todayStr(), session: SESSIONS[0], volume: '',
    fat: '', protein: '', lactose: '', totalSolids: '', notes: '',
  });

  const [eventForm, setEventForm] = useState<EventFormData>({
    cowId: '', date: todayStr(), type: ETYPES[0], description: '', vet: '', followUp: '',
  });

  const flash = (message: string) => setToast(message);

  const resetCowForm = () => setCowForm({
    name: '', breed: BREEDS[0], gender: 'Betina', dob: '', weight: '',
    status: STATUSES[0], tag: '', sire: '', dam: '',
    length: '', chestCircumference: '', reproductiveNotes: '',
  });

  const resetMilkingForm = () => setMilkingForm({
    cowId: '', date: todayStr(), session: SESSIONS[0], volume: '',
    fat: '', protein: '', lactose: '', totalSolids: '', notes: '',
  });

  const resetEventForm = () => setEventForm({
    cowId: '', date: todayStr(), type: ETYPES[0], description: '', vet: '', followUp: '',
  });

  const handleTabChange = (tab: string) => {
    router.push(`/in/${tab}`);
  };

  // --- Cow handlers ---
  const handleAddCow = () => {
    if (!cowForm.name || !cowForm.tag || !cowForm.dob) {
      flash('⚠ Nama, nomor telinga, dan tanggal lahir harus diisi');
      return;
    }
    if (editingCow) {
      updateCow({ ...editingCow, name: cowForm.name, breed: cowForm.breed, gender: cowForm.gender, dob: cowForm.dob, weight: +cowForm.weight || 0, status: cowForm.status as Cow['status'], tag: cowForm.tag, sire: cowForm.sire, dam: cowForm.dam, length: cowForm.length ? +cowForm.length : undefined, chestCircumference: cowForm.chestCircumference ? +cowForm.chestCircumference : undefined, reproductiveNotes: cowForm.reproductiveNotes || undefined });
      flash('Data sapi berhasil diperbarui ✓');
    } else {
      addCow({ name: cowForm.name, breed: cowForm.breed, gender: cowForm.gender, dob: cowForm.dob, weight: +cowForm.weight || 0, status: cowForm.status as Cow['status'], tag: cowForm.tag, sire: cowForm.sire, dam: cowForm.dam, length: cowForm.length ? +cowForm.length : undefined, chestCircumference: cowForm.chestCircumference ? +cowForm.chestCircumference : undefined, reproductiveNotes: cowForm.reproductiveNotes || undefined });
      flash('Sapi berhasil didaftarkan ✓');
    }
    setEditingCow(null);
    resetCowForm();
    closeSidebar();
  };

  const handleDeleteCowFromSidebar = () => {
    if (editingCow) setPendingDeleteFromSidebar(editingCow);
  };

  const confirmDeleteFromSidebar = () => {
    if (pendingDeleteFromSidebar) {
      deleteCow(pendingDeleteFromSidebar.id);
      flash('Sapi berhasil dihapus ✓');
      setEditingCow(null);
      setPendingDeleteFromSidebar(null);
      setUrlParamsState({ showDetail: true, mode: 'new', id: null });
      router.push('/in/herd?showDetail=true&mode=new');
    }
  };

  // --- Milking handlers ---
  const handleAddMilking = () => {
    if (!milkingForm.cowId || !milkingForm.volume) {
      flash('⚠ Pilih sapi dan masukkan volume susu');
      return;
    }
    const cow = cows.find((c) => c.id === milkingForm.cowId);
    if (editingMilking) {
      updateMilking({ ...editingMilking, cowId: milkingForm.cowId, cowName: cow?.name || editingMilking.cowName, date: milkingForm.date, session: milkingForm.session as MilkingRecord['session'], volume: +milkingForm.volume, fat: +milkingForm.fat || 0, protein: +milkingForm.protein || 0, lactose: milkingForm.lactose ? +milkingForm.lactose : undefined, totalSolids: milkingForm.totalSolids ? +milkingForm.totalSolids : undefined, notes: milkingForm.notes });
      flash('Data pemerahan berhasil diperbarui ✓');
    } else {
      addMilking({ cowId: milkingForm.cowId, cowName: cow?.name || '', date: milkingForm.date, session: milkingForm.session as MilkingRecord['session'], volume: +milkingForm.volume, fat: +milkingForm.fat || 0, protein: +milkingForm.protein || 0, lactose: milkingForm.lactose ? +milkingForm.lactose : undefined, totalSolids: milkingForm.totalSolids ? +milkingForm.totalSolids : undefined, notes: milkingForm.notes });
      flash('Data pemerahan berhasil disimpan ✓');
    }
    setEditingMilking(null);
    closeSidebar();
  };

  // --- Event handlers ---
  const handleAddEvent = () => {
    if (!eventForm.cowId || !eventForm.description) {
      flash('⚠ Pilih sapi dan tambahkan deskripsi');
      return;
    }
    const cow = cows.find((c) => c.id === eventForm.cowId);
    if (editingEvent) {
      updateEvent({ ...editingEvent, ...eventForm, cowName: cow?.name || editingEvent.cowName, type: eventForm.type as FarmEvent['type'] });
      flash('Kegiatan berhasil diperbarui ✓');
    } else {
      addEvent({ ...eventForm, cowName: cow?.name || '', type: eventForm.type as FarmEvent['type'] });
      flash('Kegiatan berhasil dicatat ✓');
    }
    setEditingEvent(null);
    closeSidebar();
  };

  // --- Collection handlers ---
  const handleAddCollection = async () => {
    // handled by MilkCollectionForm directly
  };

  // --- Generic row click → sidebar ---
  const onRowClick = (item: Cow | MilkingRecord | FarmEvent | MilkCollection) => {
    if ('name' in item && 'breed' in item && 'gender' in item) {
      // Cow
      const cow = item as Cow;
      setEditingCow(cow);
      setCowForm({ name: cow.name, breed: cow.breed, gender: cow.gender, dob: cow.dob, weight: String(cow.weight), status: cow.status, tag: cow.tag, sire: cow.sire || '', dam: cow.dam || '', length: String(cow.length || ''), chestCircumference: String(cow.chestCircumference || ''), reproductiveNotes: cow.reproductiveNotes || '' });
      setUrlParamsState({ showDetail: true, mode: 'edit', id: cow.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${cow.id}`);
    } else if ('session' in item) {
      // MilkingRecord
      const rec = item as MilkingRecord;
      setEditingMilking(rec);
      setMilkingForm({ cowId: rec.cowId, date: rec.date, session: rec.session, volume: String(rec.volume), fat: String(rec.fat), protein: String(rec.protein), lactose: String(rec.lactose || ''), totalSolids: String(rec.totalSolids || ''), notes: rec.notes || '' });
      setUrlParamsState({ showDetail: true, mode: 'edit', id: rec.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${rec.id}`);
    } else if ('type' in item && 'vet' in item) {
      // FarmEvent
      const ev = item as FarmEvent;
      setEditingEvent(ev);
      setEventForm({ cowId: ev.cowId, date: ev.date, type: ev.type, description: ev.description, vet: ev.vet, followUp: ev.followUp });
      setUrlParamsState({ showDetail: true, mode: 'edit', id: ev.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${ev.id}`);
    } else if ('buyerName' in item) {
      // MilkCollection
      const col = item as MilkCollection;
      setEditingCollection(col);
      setUrlParamsState({ showDetail: true, mode: 'edit', id: col.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${col.id}`);
    }
  };

  const openNew = () => {
    setEditingCow(null); resetCowForm();
    setEditingMilking(null); resetMilkingForm();
    setEditingEvent(null); resetEventForm();
    setEditingCollection(null);
    setUrlParamsState({ showDetail: true, mode: 'new', id: null });
    router.push(`/in/${activeTab}?showDetail=true&mode=new`);
  };

  const closeSidebar = () => {
    setUrlParamsState({ showDetail: false, mode: null, id: null });
    setEditingCow(null); setEditingMilking(null); setEditingEvent(null); setEditingCollection(null);
    resetCowForm(); resetMilkingForm(); resetEventForm();
    router.push(`/in/${activeTab}`);
  };

  // --- Delete handlers ---
  const handleDeleteCow = (cow: Cow) => setDeleteConfirm({ type: 'cow', id: cow.id, name: cow.name });
  const handleDeleteMilking = (record: MilkingRecord) => setDeleteConfirm({ type: 'milking', id: record.id, name: `Milking ${record.cowName}` });
  const handleDeleteEvent = (event: FarmEvent) => setDeleteConfirm({ type: 'event', id: event.id, name: `${event.type} - ${event.cowName}` });
  const handleDeleteCollection = (record: MilkCollection) => setDeleteConfirm({ type: 'collection', id: record.id, name: `${record.buyerName} (${record.date})` });

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'cow') { deleteCow(deleteConfirm.id); flash('Sapi berhasil dihapus ✓'); }
    else if (deleteConfirm.type === 'milking') { deleteMilking(deleteConfirm.id); flash('Data pemerahan berhasil dihapus ✓'); }
    else if (deleteConfirm.type === 'event') { deleteEvent(deleteConfirm.id); flash('Kegiatan berhasil dihapus ✓'); }
    else if (deleteConfirm.type === 'collection') { const res = await fetch(`/api/milk-collection?id=${deleteConfirm.id}`, { method: 'DELETE' }); if (res.ok) { flash('Data penjualan berhasil dihapus ✓'); refreshCollection(); } }
    setDeleteConfirm(null);
  };

  const tabsWithCount = TABS.map((tab) => ({
    ...tab,
    count: tab.key === 'herd' ? cows.length : tab.key === 'milking' ? milking.length : tab.key === 'collection' ? collectionRecords.length : tab.key === 'events' ? events.length : 0,
  }));

  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0ead8' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🐄</div>
          <div style={{ color: '#8a7d6b', fontFamily: 'monospace' }}>Loading...</div>
        </div>
      </div>
    );
  }
  if (!user) return null;

  // Determine which form/sidebar to show based on active tab
  const showFormSidebar = showDetail && (activeTab === 'milking' || activeTab === 'events' || activeTab === 'collection');

  return (
    <>
      <SideNav activeTab={activeTab} onTabChange={handleTabChange} tabs={tabsWithCount} onOpenUsers={() => setShowUserManagement(true)} />

      <div className="main-with-sidenav" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f0ead8' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px', transition: 'margin-right 0.25s ease' }}>
          <div style={{ maxWidth: hasActiveSession ? 'none' : 1060, margin: '0 auto', width: '100%' }}>
            <StatsSection />

            {activeTab === 'herd' && (
              <DataTable
                title="Registri Ternak"
                subtitle="Semua sapi yang terdaftar"
                data={cows}
                columns={[
                  { header: 'Sapi', key: 'name', width: '1fr', render: (cow: Cow) => (<><div className="table-cell-bold">{cow.name}</div><div style={{ fontFamily: 'monospace', fontSize: 'var(--fs-md)', color: '#8a7d6b', marginTop: 2 }}>{cow.id} · {cow.tag}</div></>) },
                  { header: 'Jenis', key: 'breed', width: '150px' },
                  { header: 'Lahir', key: 'dob', width: '100px' },
                  { header: 'Berat', key: 'weight', width: '90px', render: (cow: Cow) => <span className="table-cell">{cow.weight} kg</span> },
                  { header: 'Status', key: 'status', width: '110px', render: (cow: Cow) => <span className="status-badge" style={statusStyle[cow.status]}>{cow.status}</span> },
                ]}
                rowIcon={(cow: Cow) => cow.gender === 'Betina' ? '🐄' : '🐂'}
                rowTitle={(cow: Cow) => cow.name}
                rowSubtitle={(cow: Cow) => `${cow.id} · ${cow.tag}`}
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeleteCow}
              />
            )}

            {activeTab === 'milking' && (
              <DataTable
                title="Rekaman Pemerahan"
                subtitle="Log produksi per sesi"
                data={milking}
                columns={[
                  { header: 'Tanggal', key: 'date', width: '110px' },
                  { header: 'Sesi', key: 'session', width: '100px', render: (r: MilkingRecord) => <span className="session-badge" style={sessionStyle[r.session]}>{r.session}</span> },
                  { header: 'Volume', key: 'volume', width: '90px', render: (r: MilkingRecord) => <span className="table-cell-bold">{r.volume}L</span> },
                  { header: 'Lemak %', key: 'fat', width: '80px' },
                  { header: 'Protein %', key: 'protein', width: '90px' },
                  { header: 'Catatan', key: 'notes', width: '1fr', render: (r: MilkingRecord) => <span className="table-cell" style={{ fontStyle: 'italic' }}>{r.notes || '—'}</span> },
                ]}
                rowIcon={() => '🥛'}
                rowTitle={(r: MilkingRecord) => r.cowName}
                rowSubtitle={(r: MilkingRecord) => r.cowId}
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeleteMilking}
              />
            )}

            {activeTab === 'daily' && (
              <DailyMilkingForm onSaveComplete={() => flash('Data harian berhasil disimpan ✓')} onRefresh={refreshData} />
            )}
            {activeTab === 'reports' && (
              <DailyMilkReport />
            )}

            {activeTab === 'collection' && (
              <DataTable<MilkCollection>
                title="Penjualan Susu"
                subtitle="Catatan penjualan susu ke pembeli"
                data={collectionRecords}
                loading={collectionLoading}
                columns={[
                  { header: 'Tanggal', key: 'date', width: '120px' },
                  { header: 'Pembeli', key: 'buyerName', width: '1fr', render: (r: MilkCollection) => <div className="table-cell-bold">{r.buyerName}</div> },
                  { header: 'Jumlah (L)', key: 'totalQuantity', width: '100px', render: (r: MilkCollection) => <span className="table-cell-bold" style={{ color: '#2e7d32' }}>{Number(r.totalQuantity).toFixed(1)} L</span> },
                  { header: 'Lemak %', key: 'fatAverage', width: '90px', render: (r: MilkCollection) => <span className="table-cell">{r.fatAverage ? Number(r.fatAverage).toFixed(1) + '%' : '—'}</span> },
                  { header: 'Protein %', key: 'proteinAverage', width: '90px', render: (r: MilkCollection) => <span className="table-cell">{r.proteinAverage ? Number(r.proteinAverage).toFixed(1) + '%' : '—'}</span> },
                  { header: 'Catatan', key: 'notes', width: '1fr', render: (r: MilkCollection) => <span className="table-cell" style={{ fontStyle: 'italic' }}>{r.notes || '—'}</span> },
                ]}
                rowIcon={() => '🚛'}
                rowTitle={(r: MilkCollection) => r.buyerName}
                rowSubtitle={(r: MilkCollection) => r.date}
                emptyMessage="Belum ada data penjualan susu."
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeleteCollection}
              />
            )}

            {activeTab === 'events' && (
              <DataTable
                title="Catatan Kegiatan"
                subtitle="Kegiatan kesehatan, pengawinan, dan peternakan"
                data={events}
                columns={[
                  { header: 'Jenis', key: 'type', width: '1fr', render: (ev: FarmEvent) => <span className="event-type" style={{ background: '#f0e4d0', color: '#7a5a3a', border: '1px solid #e0d0b8', padding: '5px 16px', borderRadius: 100, fontFamily: 'monospace', fontSize: 'var(--fs-sm)' }}>{ev.type}</span> },
                  { header: 'Tanggal', key: 'date', width: '100px' },
                  { header: 'Tindak Lanjut', key: 'followUp', width: '120px', render: (ev: FarmEvent) => { const overdue = ev.followUp && ev.followUp !== '-' && ev.followUp < todayStr(); return ev.followUp && ev.followUp !== '-' ? <div style={{ padding: '7px 16px', borderRadius: 8, fontFamily: 'monospace', background: overdue ? '#fdecea' : '#f0e8da', color: overdue ? '#c0392b' : '#8a7d6b', border: `1px solid ${overdue ? '#f1a1a1' : '#e0d4c0'}`, fontSize: 'var(--fs-sm)' }}>{overdue ? '⚠️ ' : '📅 '}{ev.followUp}</div> : <span style={{ color: '#a0a0a0' }}>—</span>; } },
                  { header: 'Catatan', key: 'description', width: '1fr', render: (ev: FarmEvent) => <span className="table-cell" style={{ fontStyle: 'italic' }}>{ev.description}</span> },
                ]}
                rowIcon={(ev: FarmEvent) => eventIcon[ev.type] || '📋'}
                rowTitle={(ev: FarmEvent) => ev.cowName}
                rowSubtitle={(ev: FarmEvent) => ev.id}
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeleteEvent}
              />
            )}
          </div>
        </main>

        {/* Inline Form Sidebar - Cow */}
        <FormSidebar
          isOpen={showDetail && (sidebarMode === 'new' || sidebarMode === 'edit') && activeTab === 'herd'}
          onToggle={closeSidebar}
          title="🐄 Rincian Data Sapi"
          subtitle={sidebarMode === 'edit' ? 'Perbarui informasi ternak' : 'Tambahkan hewan ke registri ternak'}
        >
          <AddCowForm formData={cowForm} onChange={setCowForm} onSubmit={handleAddCow} onCancel={closeSidebar} onDelete={handleDeleteCowFromSidebar} initialData={sidebarMode === 'edit' ? editingCow : null} />
        </FormSidebar>

        {/* Inline Form Sidebar - Milking */}
        <FormSidebar
          isOpen={showFormSidebar && activeTab === 'milking'}
          onToggle={closeSidebar}
          title="🥛 Data Pemerahan"
          subtitle={sidebarMode === 'edit' ? 'Perbarui catatan pemerahan' : 'Catat session pemerahan baru'}
        >
          <AddMilkingForm formData={milkingForm} onChange={setMilkingForm} onSubmit={handleAddMilking} onCancel={closeSidebar} femaleCows={cows.filter(c => c.gender === 'Betina')} initialData={editingMilking} />
        </FormSidebar>

        {/* Inline Form Sidebar - Events */}
        <FormSidebar
          isOpen={showFormSidebar && activeTab === 'events'}
          onToggle={closeSidebar}
          title="📋 Data Kegiatan"
          subtitle={sidebarMode === 'edit' ? 'Perbarui catatan kegiatan' : 'Catat kegiatan baru'}
        >
          <AddEventForm formData={eventForm} onChange={setEventForm} onSubmit={handleAddEvent} onCancel={closeSidebar} cows={cows} initialData={editingEvent} />
        </FormSidebar>

        {/* Inline Form Sidebar - Collection */}
        <FormSidebar
          isOpen={showFormSidebar && activeTab === 'collection'}
          onToggle={closeSidebar}
          title="🚛 Data Penjualan"
          subtitle={sidebarMode === 'edit' ? 'Perbarui data penjualan' : 'Catat penjualan susu baru'}
        >
          <MilkCollectionForm
            onSubmitComplete={() => { flash(sidebarMode === 'edit' ? 'Data penjualan berhasil diperbarui ✓' : 'Data penjualan berhasil disimpan ✓'); setEditingCollection(null); closeSidebar(); refreshCollection(); }}
            onCancel={closeSidebar}
            initialData={sidebarMode === 'edit' ? editingCollection : null}
          />
        </FormSidebar>

        {/* Toggle button when sidebar is collapsed */}
        {!hasActiveSession && showDetail && (
          <button
            onClick={() => {
              const mode = editingCow || editingMilking || editingEvent || editingCollection ? 'edit' : 'new';
              const id = editingCow?.id || editingMilking?.id || editingEvent?.id || editingCollection?.id || '';
              router.push(`/in/${activeTab}?showDetail=true&mode=${mode}&id=${id}`);
            }}
            style={{
              position: 'fixed', right: 0, top: '50%', transform: 'translateY(-50%)',
              background: '#faf6ee', border: '1px solid #e0d4c0', borderRight: 'none',
              borderRadius: '8px 0 0 8px', padding: '12px 8px', cursor: 'pointer',
              color: '#8a7d6b', fontSize: '1.125rem', zIndex: 100,
              boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
            }}
            title="Buka sidebar"
          >
            ▶
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="⚠️ Konfirmasi Hapus" subtitle="Tindakan ini tidak dapat dibatalkan">
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

      {/* Delete Confirmation Modal - From Sidebar */}
      <Modal isOpen={!!pendingDeleteFromSidebar} onClose={() => setPendingDeleteFromSidebar(null)} title="⚠️ Konfirmasi Hapus" subtitle="Tindakan ini tidak dapat dibatalkan">
        <div style={{ padding: '20px 0' }}>
          <p style={{ fontSize: 'var(--fs-lg)', color: '#3a2e20', marginBottom: 20 }}>
            Apakah Anda yakin ingin menghapus <strong>{pendingDeleteFromSidebar?.name}</strong>?
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setPendingDeleteFromSidebar(null)}>Batal</Button>
            <Button onClick={confirmDeleteFromSidebar} style={{ background: '#c0392b' }}>Ya, Hapus</Button>
          </div>
        </div>
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
      <UserManagement isOpen={showUserManagement} onClose={() => setShowUserManagement(false)} />
    </>
  );
}

export default function InPage(props: InPageProps) {
  return <InPageContent {...props} />;
}
