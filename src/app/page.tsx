'use client';

import React, { useState } from 'react';
import { useFarm } from '@/context/FarmContext';
import { Navigation } from '@/components/Navigation';
import { StatsSection } from '@/components/StatsSection';
import { HerdTab, MilkingTab, EventsTab } from '@/components/tabs';
import { Modal } from '@/components/Modal';
import { Toast } from '@/components/Toast';
import { AddCowForm, AddMilkingForm, AddEventForm } from '@/components/forms';
import { todayStr } from '@/lib/utils';
import { BREEDS, STATUSES, SESSIONS, ETYPES, Cow, MilkingRecord, FarmEvent } from '@/types';

interface CowFormData {
  name: string;
  breed: string;
  gender: 'Female' | 'Male';
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
  { key: 'cows', label: '🐄 Herd', count: 0 },
  { key: 'milking', label: '🥛 Milking', count: 0 },
  { key: 'events', label: '📋 Events', count: 0 },
];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('cows');
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const { cows, milking, events, addCow, addMilking, addEvent } = useFarm();

  // Form states
  const [cowForm, setCowForm] = useState<CowFormData>({
    name: '',
    breed: BREEDS[0],
    gender: 'Female',
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

  const handleAddCow = () => {
    if (!cowForm.name || !cowForm.tag || !cowForm.dob) {
      flash('⚠ Name, tag and DOB required');
      return;
    }
    addCow({
      ...cowForm,
      weight: +cowForm.weight || 0,
      status: cowForm.status as Cow['status'],
    });
    setCowForm({
      name: '',
      breed: BREEDS[0],
      gender: 'Female',
      dob: '',
      weight: '',
      status: STATUSES[0],
      tag: '',
      sire: '',
      dam: '',
    });
    setModalOpen(null);
    flash('Cow registered ✓');
  };

  const handleAddMilking = () => {
    if (!milkingForm.cowId || !milkingForm.volume) {
      flash('⚠ Select cow and enter volume');
      return;
    }
    const cow = cows.find((c) => c.id === milkingForm.cowId);
    addMilking({
      ...milkingForm,
      cowName: cow?.name || '',
      volume: +milkingForm.volume,
      fat: +milkingForm.fat || 0,
      protein: +milkingForm.protein || 0,
      session: milkingForm.session as MilkingRecord['session'],
    });
    setMilkingForm({
      cowId: '',
      date: todayStr(),
      session: SESSIONS[0],
      volume: '',
      fat: '',
      protein: '',
      notes: '',
    });
    setModalOpen(null);
    flash('Milking session saved ✓');
  };

  const handleAddEvent = () => {
    if (!eventForm.cowId || !eventForm.description) {
      flash('⚠ Select cow and add description');
      return;
    }
    const cow = cows.find((c) => c.id === eventForm.cowId);
    addEvent({
      ...eventForm,
      cowName: cow?.name || '',
      type: eventForm.type as FarmEvent['type'],
    });
    setEventForm({
      cowId: '',
      date: todayStr(),
      type: ETYPES[0],
      description: '',
      vet: '',
      followUp: '',
    });
    setModalOpen(null);
    flash('Event logged ✓');
  };

  const tabsWithCount = TABS.map((tab) => ({
    ...tab,
    count: tab.key === 'cows' ? cows.length : tab.key === 'milking' ? milking.length : events.length,
  }));

  const femaleCows = cows.filter((c) => c.gender === 'Female');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} tabs={tabsWithCount} />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: '28px 28px' }}>
        <StatsSection />

        {activeTab === 'cows' && <HerdTab onAddCow={() => setModalOpen('cow')} />}
        {activeTab === 'milking' && <MilkingTab onAddMilking={() => setModalOpen('milk')} />}
        {activeTab === 'events' && <EventsTab onAddEvent={() => setModalOpen('event')} />}
      </div>

      {/* Cow Modal */}
      <Modal
        isOpen={modalOpen === 'cow'}
        onClose={() => setModalOpen(null)}
        title="🐄 Register New Cow"
        subtitle="Add animal to herd registry"
      >
        <AddCowForm
          formData={cowForm}
          onChange={setCowForm}
          onSubmit={handleAddCow}
          onCancel={() => setModalOpen(null)}
        />
      </Modal>

      {/* Milking Modal */}
      <Modal
        isOpen={modalOpen === 'milk'}
        onClose={() => setModalOpen(null)}
        title="🥛 Log Milking Session"
        subtitle="Record production data"
      >
        <AddMilkingForm
          formData={milkingForm}
          onChange={setMilkingForm}
          onSubmit={handleAddMilking}
          onCancel={() => setModalOpen(null)}
          femaleCows={femaleCows}
        />
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={modalOpen === 'event'}
        onClose={() => setModalOpen(null)}
        title="📋 Log Farm Event"
        subtitle="Record health or farm event"
      >
        <AddEventForm
          formData={eventForm}
          onChange={setEventForm}
          onSubmit={handleAddEvent}
          onCancel={() => setModalOpen(null)}
          cows={cows}
        />
      </Modal>

      <Toast message={toast} onClose={() => setToast(null)} />
    </div>
  );
}
