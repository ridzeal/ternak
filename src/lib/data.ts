import { Cow, MilkingRecord, FarmEvent } from '@/types';

export const INIT_COWS: Cow[] = [
  { id: 'C-001', name: 'Mentari', breed: 'Friesian Holstein', dob: '2020-03-12', gender: 'Female', weight: 480, status: 'Lactating', tag: 'FH-4821' },
  { id: 'C-002', name: 'Melati',  breed: 'Limousin',          dob: '2019-07-04', gender: 'Female', weight: 510, status: 'Dry',       tag: 'LM-2219' },
  { id: 'C-003', name: 'Bumi',    breed: 'Simmental',         dob: '2021-01-20', gender: 'Male',   weight: 620, status: 'Active',    tag: 'SM-3301' },
];

export const INIT_MILKING: MilkingRecord[] = [
  { id: 'M-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Morning', volume: 12.5, fat: 3.8, protein: 3.2, notes: '' },
  { id: 'M-002', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Evening', volume: 10.2, fat: 3.9, protein: 3.1, notes: 'Slightly less than usual' },
  { id: 'M-003', cowId: 'C-002', cowName: 'Melati',  date: '2024-11-19', session: 'Morning', volume: 14.1, fat: 4.1, protein: 3.4, notes: '' },
];

export const INIT_EVENTS: FarmEvent[] = [
  { id: 'E-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-15', type: 'Health Check', description: 'Routine vaccination - FMD booster', vet: 'drh. Santoso', followUp: '2024-12-15' },
  { id: 'E-002', cowId: 'C-002', cowName: 'Melati',  date: '2024-11-10', type: 'Breeding',     description: 'Artificial insemination performed', vet: 'drh. Lestari',  followUp: '2024-12-10' },
  { id: 'E-003', cowId: 'C-003', cowName: 'Bumi',    date: '2024-11-08', type: 'Weighing',     description: 'Monthly weight check - gained 12kg', vet: '-',             followUp: '-' },
];
