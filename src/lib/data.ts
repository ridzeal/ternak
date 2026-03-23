import { Cow, MilkingRecord, FarmEvent } from '@/types';

export const INIT_COWS: Cow[] = [
  { id: 'C-001', name: 'Mentari', breed: 'Friesian Holstein', dob: '2020-03-12', gender: 'Betina', weight: 480, status: 'Laktasi', tag: 'FH-4821' },
  { id: 'C-002', name: 'Melati',  breed: 'Limousin',          dob: '2019-07-04', gender: 'Betina', weight: 510, status: 'Kering',  tag: 'LM-2219' },
  { id: 'C-003', name: 'Bumi',    breed: 'Simmental',         dob: '2021-01-20', gender: 'Jantan', weight: 620, status: 'Aktif',   tag: 'SM-3301' },
];

export const INIT_MILKING: MilkingRecord[] = [
  { id: 'M-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Pagi', volume: 12.5, fat: 3.8, protein: 3.2, notes: '' },
  { id: 'M-002', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-20', session: 'Malam', volume: 10.2, fat: 3.9, protein: 3.1, notes: 'Sedikit kurang dari biasanya' },
  { id: 'M-003', cowId: 'C-002', cowName: 'Melati',  date: '2024-11-19', session: 'Pagi', volume: 14.1, fat: 4.1, protein: 3.4, notes: '' },
];

export const INIT_EVENTS: FarmEvent[] = [
  { id: 'E-001', cowId: 'C-001', cowName: 'Mentari', date: '2024-11-15', type: 'Pemeriksaan Kesehatan', description: 'Vaksinasi rutin - booster FMD', vet: 'drh. Santoso', followUp: '2024-12-15' },
  { id: 'E-002', cowId: 'C-002', cowName: 'Melati',  date: '2024-11-10', type: 'Pengawinan',     description: 'Inseminasi buatan dilakukan', vet: 'drh. Lestari',  followUp: '2024-12-10' },
  { id: 'E-003', cowId: 'C-003', cowName: 'Bumi',    date: '2024-11-08', type: 'Penimbangan',     description: 'Penimbangan bulanan - naik 12kg', vet: '-',             followUp: '-' },
];
