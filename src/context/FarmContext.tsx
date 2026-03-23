'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { Cow, MilkingRecord, FarmEvent, FarmContextType, FarmState } from '@/types';
import { todayStr } from '@/lib/utils';

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const genId = (prefix: string, list: { id: string }[]) => `${prefix}-${String(list.length + 1).padStart(3, '0')}`;

export function FarmProvider({ children }: { children: ReactNode }) {
  const [cows, setCows] = useState<Cow[]>([]);
  const [milking, setMilking] = useState<MilkingRecord[]>([]);
  const [events, setEvents] = useState<FarmEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [cowsRes, milkingRes, eventsRes] = await Promise.all([
          fetch('/api/cows'),
          fetch('/api/milking'),
          fetch('/api/events'),
        ]);

        if (cowsRes.ok) {
          const cowsData = await cowsRes.json();
          setCows(cowsData);
        }

        if (milkingRes.ok) {
          const milkingData = await milkingRes.json();
          setMilking(milkingData);
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }
      } catch (error) {
        console.error('Error fetching farm data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const addCow = useCallback(async (cow: Omit<Cow, 'id'>) => {
    const newCow = { ...cow, id: genId('C', cows) };
    const response = await fetch('/api/cows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCow),
    });

    if (response.ok) {
      const savedCow = await response.json();
      setCows(prev => [...prev, savedCow]);
    }
  }, [cows]);

  const updateCow = useCallback(async (cow: Cow) => {
    const response = await fetch('/api/cows', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cow),
    });

    if (response.ok) {
      setCows(prev => prev.map(c => c.id === cow.id ? cow : c));
    }
  }, []);

  const deleteCow = useCallback(async (id: string) => {
    const response = await fetch(`/api/cows?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setCows(prev => prev.filter(c => c.id !== id));
    }
  }, []);

  const addMilking = useCallback(async (record: Omit<MilkingRecord, 'id'>) => {
    const newRecord = { ...record, id: genId('M', milking) };
    const response = await fetch('/api/milking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    });

    if (response.ok) {
      const savedRecord = await response.json();
      setMilking(prev => [...prev, savedRecord]);
    }
  }, [milking]);

  const updateMilking = useCallback(async (record: MilkingRecord) => {
    const response = await fetch('/api/milking', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });

    if (response.ok) {
      setMilking(prev => prev.map(r => r.id === record.id ? record : r));
    }
  }, []);

  const deleteMilking = useCallback(async (id: string) => {
    const response = await fetch(`/api/milking?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setMilking(prev => prev.filter(r => r.id !== id));
    }
  }, []);

  const addEvent = useCallback(async (event: Omit<FarmEvent, 'id'>) => {
    const newEvent = { ...event, id: genId('E', events) };
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEvent),
    });

    if (response.ok) {
      const savedEvent = await response.json();
      setEvents(prev => [...prev, savedEvent]);
    }
  }, [events]);

  const updateEvent = useCallback(async (event: FarmEvent) => {
    const response = await fetch('/api/events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });

    if (response.ok) {
      setEvents(prev => prev.map(e => e.id === event.id ? event : e));
    }
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const response = await fetch(`/api/events?id=${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  }, []);

  const stats = useMemo(() => {
    const femaleCows = cows.filter(c => c.gender === 'Betina');
    const totalMilk = milking.reduce((sum, m) => sum + parseFloat(String(m.volume)), 0);
    const overdueCount = events.filter(e => e.followUp && e.followUp !== '-' && e.followUp < todayStr()).length;

    return {
      totalHerd: cows.length,
      femaleCount: femaleCows.length,
      lactatingCount: cows.filter(c => c.status === 'Laktasi').length,
      totalMilk,
      milkingSessions: milking.length,
      overdueCount,
    };
  }, [cows, milking, events]);

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <FarmContext.Provider value={{ cows, milking, events, addCow, updateCow, deleteCow, addMilking, updateMilking, deleteMilking, addEvent, updateEvent, deleteEvent, stats }}>
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
