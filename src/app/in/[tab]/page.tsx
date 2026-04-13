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
import { AddCowForm, AddMilkingForm, AddEventForm, DailyMilkingForm, MilkCollectionForm, AssetForm, FeedForm, PlotForm, HarvestForm } from '@/components/forms';
import { DailyMilkReport, MonthlyMilkReport } from '@/components/reports';
import { DataImport } from '@/components/DataImport';
import { UserManagement } from '@/components/UserManagement';
import { AssetInventory } from '@/components/AssetInventory';
import { FeedInventory } from '@/components/FeedInventory';
import { InventoryDashboard } from '@/components/InventoryDashboard';
import { LandManagement } from '@/components/LandManagement';
import { ProductionTrends, HerdPerformance, ReproductiveTracking } from '@/components/analytics';
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

interface AssetFormData {
  name: string;
  category: string;
  purchaseDate: string;
  quantity: string;
  unit: string;
  notes: string;
  status: string;
}

interface FeedFormData {
  name: string;
  purchaseDate: string;
  quantity: string;
  weightKg: string;
  unit: string;
  unitPrice: string;
  totalPrice: string;
  expiryDate: string;
  supplier: string;
  notes: string;
  minStock: string;
}

interface PlotFormData {
  plotName: string;
  location: string;
  area: string;
  areaUnit: string;
  cropType: string;
  cropVariety: string;
  plantingDate: string;
  currentCutCycle: string;
  lastCutDate: string;
  nextCutDate: string;
  status: string;
  assignedTo: string;
  barnLocation: string;
  notes: string;
}

interface HarvestFormData {
  plotId: string;
  plotName: string;
  harvestDate: string;
  cutNumber: string;
  quantity: string;
  quantityUnit: string;
  quality: string;
  height: string;
  heightUnit: string;
  usedFor: string;
  storageLocation: string;
  notes: string;
}

const TABS = [
  { key: 'herd', label: 'Ternak', icon: '🐄', count: 0 },
  { key: 'milking', label: 'Pemerahan', icon: '🥛', count: 0 },
  { key: 'daily', label: 'Input Harian', icon: '📝', count: 0 },
  { key: 'reports', label: 'Laporan', icon: '📊', count: 0 },
  { key: 'collection', label: 'Penjualan', icon: '🚛', count: 0 },
  { key: 'events', label: 'Kegiatan', icon: '📋', count: 0 },
  { key: 'inventory', label: 'Inventaris', icon: '📦', count: 0 },
  { key: 'assets', label: 'Aset', icon: '🔧', count: 0 },
  { key: 'feed', label: 'Pakan', icon: '🌾', count: 0 },
  { key: 'land', label: 'Lahan', icon: '🌱', count: 0 },
  { key: 'analytics', label: 'Analitik', icon: '📈', count: 0 },
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
  const [editingAsset, setEditingAsset] = useState<any | null>(null);
  const [editingFeed, setEditingFeed] = useState<any | null>(null);
  const [editingPlot, setEditingPlot] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [pendingDeleteFromSidebar, setPendingDeleteFromSidebar] = useState<Cow | null>(null);
  const [collectionRecords, setCollectionRecords] = useState<MilkCollection[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [analyticsType, setAnalyticsType] = useState<'trends' | 'herd' | 'repro'>('trends');

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

  const [assetForm, setAssetForm] = useState<AssetFormData>({
    name: '', category: '', purchaseDate: '', quantity: '', unit: '', notes: '', status: 'Active',
  });

  const [feedForm, setFeedForm] = useState<FeedFormData>({
    name: '', purchaseDate: '', quantity: '', weightKg: '', unit: '', unitPrice: '', totalPrice: '', expiryDate: '', supplier: '', notes: '', minStock: '',
  });

  const [plotForm, setPlotForm] = useState<PlotFormData>({
    plotName: '', location: '', area: '', areaUnit: 'ha', cropType: '', cropVariety: '', plantingDate: '', currentCutCycle: '', lastCutDate: '', nextCutDate: '', status: 'Growing', assignedTo: '', barnLocation: '', notes: '',
  });

  const [harvestForm, setHarvestForm] = useState<HarvestFormData>({
    plotId: '', plotName: '', harvestDate: new Date().toISOString().split('T')[0], cutNumber: '1', quantity: '', quantityUnit: 'kg', quality: 'Good', height: '', heightUnit: 'cm', usedFor: '', storageLocation: '', notes: '',
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

  // --- Asset handlers ---
  const handleAddAsset = async () => {
    if (!assetForm.name) {
      flash('⚠ Nama barang harus diisi');
      return;
    }
    const payload = {
      id: editingAsset?.id || `asset_${Date.now()}`,
      ...assetForm,
      quantity: parseInt(assetForm.quantity) || 0,
    };
    try {
      const url = '/api/assets';
      const method = editingAsset ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to save asset');
      flash('Asset berhasil disimpan ✓');
      setEditingAsset(null);
      closeSidebar();
      // Refresh data if we're using external data source
      window.location.reload();
    } catch (error) {
      console.error('Error saving asset:', error);
      flash('❌ Gagal menyimpan asset');
    }
  };

  const handleDeleteAssetFromSidebar = async () => {
    if (editingAsset) {
      try {
        const res = await fetch(`/api/assets?id=${editingAsset.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete asset');
        flash('Asset berhasil dihapus ✓');
        setEditingAsset(null);
        closeSidebar();
        window.location.reload();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  // --- Feed handlers ---
  const handleAddFeed = async () => {
    if (!feedForm.name) {
      flash('⚠ Nama pakan harus diisi');
      return;
    }
    let calculatedTotal = feedForm.totalPrice;
    if (feedForm.unitPrice && feedForm.quantity) {
      calculatedTotal = String(parseFloat(feedForm.unitPrice) * parseFloat(feedForm.quantity));
    }
    const payload = {
      id: editingFeed?.id || `feed_${Date.now()}`,
      ...feedForm,
      quantity: feedForm.quantity ? parseInt(feedForm.quantity) : null,
      weightKg: feedForm.weightKg ? parseFloat(feedForm.weightKg) : null,
      unitPrice: feedForm.unitPrice ? parseFloat(feedForm.unitPrice) : null,
      totalPrice: calculatedTotal ? parseFloat(calculatedTotal) : null,
      minStock: feedForm.minStock ? parseInt(feedForm.minStock) : null,
    };
    try {
      const res = await fetch('/api/feed-inventory', { method: editingFeed ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to save feed');
      flash('Pakan berhasil disimpan ✓');
      setEditingFeed(null);
      closeSidebar();
      window.location.reload();
    } catch (error) {
      console.error('Error saving feed:', error);
      flash('❌ Gagal menyimpan pakan');
    }
  };

  const handleDeleteFeedFromSidebar = async () => {
    if (editingFeed) {
      try {
        const res = await fetch(`/api/feed-inventory?id=${editingFeed.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete feed');
        flash('Pakan berhasil dihapus ✓');
        setEditingFeed(null);
        closeSidebar();
        window.location.reload();
      } catch (error) {
        console.error('Error deleting feed:', error);
      }
    }
  };

  // --- Plot handlers ---
  const handleAddPlot = async () => {
    if (!plotForm.plotName) {
      flash('⚠ Nama plot harus diisi');
      return;
    }
    const payload = {
      id: editingPlot?.id || `plot_${Date.now()}`,
      ...plotForm,
      area: plotForm.area ? parseFloat(plotForm.area) : null,
      currentCutCycle: plotForm.currentCutCycle ? parseInt(plotForm.currentCutCycle) : null,
    };
    try {
      const res = await fetch('/api/land', { method: editingPlot ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to save plot');
      flash('Plot lahan berhasil disimpan ✓');
      setEditingPlot(null);
      closeSidebar();
      window.location.reload();
    } catch (error) {
      console.error('Error saving plot:', error);
      flash('❌ Gagal menyimpan plot');
    }
  };

  const handleDeletePlotFromSidebar = async () => {
    if (editingPlot) {
      try {
        const res = await fetch(`/api/land?id=${editingPlot.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete plot');
        flash('Plot berhasil dihapus ✓');
        setEditingPlot(null);
        closeSidebar();
        window.location.reload();
      } catch (error) {
        console.error('Error deleting plot:', error);
      }
    }
  };

  // --- Harvest handlers ---
  const handleAddHarvest = async () => {
    if (!harvestForm.plotId) {
      flash('⚠ Pilih plot terlebih dahulu');
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
      const res = await fetch('/api/forage-harvests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error('Failed to record harvest');
      flash('Panen berhasil dicatat ✓');
      closeSidebar();
      window.location.reload();
    } catch (error) {
      console.error('Error recording harvest:', error);
      flash('❌ Gagal mencatat panen');
    }
  };

  // --- Generic row click → sidebar ---
  const onRowClick = (item: any) => {
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
    } else if ('category' in item && 'purchaseDate' in item) {
      // Asset
      const asset = item as any;
      setEditingAsset(asset);
      setAssetForm({ name: asset.name || '', category: asset.category || '', purchaseDate: asset.purchaseDate || '', quantity: String(asset.quantity || ''), unit: asset.unit || '', notes: asset.notes || '', status: asset.status || 'Active' });
      setUrlParamsState({ showDetail: true, mode: 'edit', id: asset.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${asset.id}`);
    } else if ('weightKg' in item && 'supplier' in item) {
      // Feed
      const feed = item as any;
      setEditingFeed(feed);
      setFeedForm({ name: feed.name || '', purchaseDate: feed.purchaseDate || '', quantity: String(feed.quantity || ''), weightKg: String(feed.weightKg || ''), unit: feed.unit || '', unitPrice: String(feed.unitPrice || ''), totalPrice: String(feed.totalPrice || ''), expiryDate: feed.expiryDate || '', supplier: feed.supplier || '', notes: feed.notes || '', minStock: String(feed.minStock || '') });
      setUrlParamsState({ showDetail: true, mode: 'edit', id: feed.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${feed.id}`);
    } else if ('plotName' in item && 'area' in item) {
      // Land Plot
      const plot = item as any;
      setEditingPlot(plot);
      setPlotForm({ plotName: plot.plotName || '', location: plot.location || '', area: String(plot.area || ''), areaUnit: plot.areaUnit || 'ha', cropType: plot.cropType || '', cropVariety: plot.cropVariety || '', plantingDate: plot.plantingDate || '', currentCutCycle: String(plot.currentCutCycle || ''), lastCutDate: plot.lastCutDate || '', nextCutDate: plot.nextCutDate || '', status: plot.status || 'Growing', assignedTo: plot.assignedTo || '', barnLocation: plot.barnLocation || '', notes: plot.notes || '' });
      setUrlParamsState({ showDetail: true, mode: 'edit', id: plot.id });
      router.push(`/in/${activeTab}?showDetail=true&mode=edit&id=${plot.id}`);
    }
  };

  const openNew = () => {
    setEditingCow(null); resetCowForm();
    setEditingMilking(null); resetMilkingForm();
    setEditingEvent(null); resetEventForm();
    setEditingCollection(null);
    setEditingAsset(null); setAssetForm({ name: '', category: '', purchaseDate: '', quantity: '', unit: '', notes: '', status: 'Active' });
    setEditingFeed(null); setFeedForm({ name: '', purchaseDate: '', quantity: '', weightKg: '', unit: '', unitPrice: '', totalPrice: '', expiryDate: '', supplier: '', notes: '', minStock: '' });
    setEditingPlot(null); setPlotForm({ plotName: '', location: '', area: '', areaUnit: 'ha', cropType: '', cropVariety: '', plantingDate: '', currentCutCycle: '', lastCutDate: '', nextCutDate: '', status: 'Growing', assignedTo: '', barnLocation: '', notes: '' });
    setUrlParamsState({ showDetail: true, mode: 'new', id: null });
    router.push(`/in/${activeTab}?showDetail=true&mode=new`);
  };

  const closeSidebar = () => {
    setUrlParamsState({ showDetail: false, mode: null, id: null });
    setEditingCow(null); setEditingMilking(null); setEditingEvent(null); setEditingCollection(null);
    setEditingAsset(null); setEditingFeed(null); setEditingPlot(null);
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
              <div>
                {/* Report sub-tabs */}
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => setReportType('daily')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: reportType === 'daily' ? '#8b5a2b' : '#f0ead8',
                        color: reportType === 'daily' ? '#fff' : '#8a7d6b',
                        fontWeight: 600,
                        fontSize: 'var(--fs-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      📋 Harian
                    </button>
                    <button
                      onClick={() => setReportType('monthly')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        border: 'none',
                        background: reportType === 'monthly' ? '#8b5a2b' : '#f0ead8',
                        color: reportType === 'monthly' ? '#fff' : '#8a7d6b',
                        fontWeight: 600,
                        fontSize: 'var(--fs-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      📊 Bulanan
                    </button>
                  </div>
                  <DataImport onComplete={refreshData} />
                </div>
                {reportType === 'daily' ? <DailyMilkReport /> : <MonthlyMilkReport />}
              </div>
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

            {activeTab === 'inventory' && (
              <InventoryDashboard
                onAddAsset={() => router.push('/in/assets?showDetail=true&mode=new')}
                onAddFeed={() => router.push('/in/feed?showDetail=true&mode=new')}
              />
            )}

            {activeTab === 'assets' && (
              <AssetInventory
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeleteAssetFromSidebar}
              />
            )}

            {activeTab === 'feed' && (
              <FeedInventory
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeleteFeedFromSidebar}
              />
            )}

            {activeTab === 'land' && (
              <LandManagement
                onAdd={openNew}
                onRowClick={onRowClick}
                onDelete={handleDeletePlotFromSidebar}
                onAddHarvest={() => {
                  setHarvestForm({ plotId: '', plotName: '', harvestDate: new Date().toISOString().split('T')[0], cutNumber: '1', quantity: '', quantityUnit: 'kg', quality: 'Good', height: '', heightUnit: 'cm', usedFor: '', storageLocation: '', notes: '' });
                  setUrlParamsState({ showDetail: true, mode: 'new', id: null });
                  router.push(`/in/land?showDetail=true&mode=new&form=harvest`);
                }}
              />
            )}

            {activeTab === 'analytics' && (
              <div>
                {/* Analytics sub-tabs */}
                <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setAnalyticsType('trends')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: analyticsType === 'trends' ? '#8b5a2b' : '#f0ead8',
                      color: analyticsType === 'trends' ? '#fff' : '#8a7d6b',
                      fontWeight: 600,
                      fontSize: 'var(--fs-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    📈 Tren Produksi
                  </button>
                  <button
                    onClick={() => setAnalyticsType('herd')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: analyticsType === 'herd' ? '#8b5a2b' : '#f0ead8',
                      color: analyticsType === 'herd' ? '#fff' : '#8a7d6b',
                      fontWeight: 600,
                      fontSize: 'var(--fs-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    🐄 Performa Ternak
                  </button>
                  <button
                    onClick={() => setAnalyticsType('repro')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      background: analyticsType === 'repro' ? '#8b5a2b' : '#f0ead8',
                      color: analyticsType === 'repro' ? '#fff' : '#8a7d6b',
                      fontWeight: 600,
                      fontSize: 'var(--fs-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    🤰 Reproduksi
                  </button>
                </div>
                {analyticsType === 'trends' ? <ProductionTrends /> : analyticsType === 'herd' ? <HerdPerformance /> : <ReproductiveTracking />}
              </div>
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

        {/* Inline Form Sidebar - Assets */}
        <FormSidebar
          isOpen={showDetail && (sidebarMode === 'edit' || sidebarMode === 'new') && activeTab === 'assets'}
          onToggle={closeSidebar}
          title="🔧 Rincian Asset"
          subtitle={sidebarMode === 'edit' ? 'Perbarui informasi asset' : 'Tambahkan asset baru'}
        >
          <AssetForm
            formData={assetForm}
            onChange={setAssetForm}
            onSubmit={handleAddAsset}
            onCancel={closeSidebar}
            onDelete={editingAsset ? handleDeleteAssetFromSidebar : undefined}
            initialData={editingAsset}
          />
        </FormSidebar>

        {/* Inline Form Sidebar - Feed */}
        <FormSidebar
          isOpen={showDetail && (sidebarMode === 'edit' || sidebarMode === 'new') && activeTab === 'feed'}
          onToggle={closeSidebar}
          title="🌾 Rincian Pakan"
          subtitle={sidebarMode === 'edit' ? 'Perbarui informasi pakan' : 'Tambahkan pakan baru'}
        >
          <FeedForm
            formData={feedForm}
            onChange={setFeedForm}
            onSubmit={handleAddFeed}
            onCancel={closeSidebar}
            onDelete={editingFeed ? handleDeleteFeedFromSidebar : undefined}
            initialData={editingFeed}
          />
        </FormSidebar>

        {/* Inline Form Sidebar - Land Plot */}
        <FormSidebar
          isOpen={showDetail && (sidebarMode === 'edit' || sidebarMode === 'new') && activeTab === 'land' && !new URLSearchParams(window.location.search).get('form')}
          onToggle={closeSidebar}
          title="🌱 Rincian Plot Lahan"
          subtitle={sidebarMode === 'edit' ? 'Perbarui informasi plot' : 'Tambahkan plot baru'}
        >
          <PlotForm
            formData={plotForm}
            onChange={setPlotForm}
            onSubmit={handleAddPlot}
            onCancel={closeSidebar}
            onDelete={editingPlot ? handleDeletePlotFromSidebar : undefined}
            initialData={editingPlot}
          />
        </FormSidebar>

        {/* Inline Form Sidebar - Harvest */}
        <FormSidebar
          isOpen={showDetail && (sidebarMode === 'edit' || sidebarMode === 'new') && activeTab === 'land' && new URLSearchParams(window.location.search).get('form') === 'harvest'}
          onToggle={closeSidebar}
          title="🌿 Catat Panen Pakan"
          subtitle="Catat hasil panen pakan ternak"
        >
          <HarvestForm
            formData={harvestForm}
            onChange={setHarvestForm}
            onSubmit={handleAddHarvest}
            onCancel={closeSidebar}
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
