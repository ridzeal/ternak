'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { Cow, MilkingRecord, FarmEvent, FarmContextType, FarmState } from '@/types';
import { todayStr } from '@/lib/utils';

const INIT_COWS: Cow[] = [
  { id: 'C-001', name: 'Mentari', breed: 'Friesian Holstein', dob: '2020-03-12', gender: 'Female', weight: 480, status: 'Lactating', tag: 'FH-4821' },
  { id: 'C-002', name: 'Melati', breed: 'Limousin', dob: '2019-07-04', gender: 'Female', weight: 510, status: 'Dry', tag: 'LM-2219' },
  { id: 'C-003', name: 'Bumi', breed: 'Simmental', dob: '2021-01-20', gender: 'Male', weight: 620, status: 'Active', tag: 'SM-3301' },
];

const INIT_MILKING: MilkingRecord[] = [
  { id: 'M-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Morning', volume: 12.5, fat: 3.8, protein: 3.2, notes: '' },
  { id: 'M-002', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Evening', volume: 10.2, fat: 3.9, protein: 3.1, notes: 'Slightly less than usual' },
  { id: 'M-003', cowId: 'C-002', cowName: 'Melati', date: '2024-11-19', session: 'Morning', volume: 14.1, fat: 4.1, protein: 3.4, notes: '' },
];

const INIT_EVENTS: FarmEvent[] = [
  { id: 'E-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-15', type: 'Health Check', description: 'Routine vaccination - FMD booster', vet: 'drh. Santoso', followUp: '2024-12-15' },
  { id: 'E-002', cowId: 'C-002', cowName: 'Melati', date: '2024-11-10', type: 'Breeding', description: 'Artificial insemination performed', vet: 'drh. Lestari', followUp: '2024-12-10' },
  { id: 'E-003', cowId: 'C-003', cowName: 'Bumi', date: '2024-11-08', type: 'Weighing', description: 'Monthly weight check - gained 12kg', vet: '-', followUp: '-' },
];

const FarmContext = createContext<FarmContextType | undefined>(undefined);

const genId = (prefix: string, list: { id: string }[]) => `${prefix}-${String(list.length + 1).padStart(3, '0')}`;

export function FarmProvider({ children }: { children: ReactNode }) {
  const [cows, setCows] = useState<Cow[]>(INIT_COWS);
  const [milking, setMilking] = useState<MilkingRecord[]>(INIT_MILKING);
  const [events, setEvents] = useState<FarmEvent[]>(INIT_EVENTS);

  const addCow = useCallback((cow: Omit<Cow, 'id'>) => {
    setCows(prev => [...prev, { ...cow, id: genId('C', prev) }]);
  }, []);

  const addMilking = useCallback((record: Omit<MilkingRecord, 'id'>) => {
    setMilking(prev => [...prev, { ...record, id: genId('M', prev) }]);
  }, []);

  const addEvent = useCallback((event: Omit<FarmEvent, 'id'>) => {
    setEvents(prev => [...prev, { ...event, id: genId('E', prev) }]);
  }, []);

  const stats = useMemo(() => {
    const femaleCows = cows.filter(c => c.gender === 'Female');
    const totalMilk = milking.reduce((sum, m) => sum + m.volume, 0);
    const overdueCount = events.filter(e => e.followUp && e.followUp !== '-' && e.followUp < todayStr()).length;

    return {
      totalHerd: cows.length,
      femaleCount: femaleCows.length,
      lactatingCount: cows.filter(c => c.status === 'Lactating').length,
      totalMilk,
      milkingSessions: milking.length,
      overdueCount,
    };
  }, [cows, milking, events]);

  return (
    <FarmContext.Provider value={{ cows, milking, events, addCow, addMilking, addEvent, stats }}>
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
