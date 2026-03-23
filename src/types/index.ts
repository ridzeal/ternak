export type CowStatus = 'Laktasi' | 'Kering' | 'Hamil' | 'Aktif' | 'Karantina' | 'Terjual';
export type MilkingSession = 'Pagi' | 'Siang' | 'Malam';
export type EventType = 'Pemeriksaan Kesehatan' | 'Pengawinan' | 'Penimbangan' | 'Vaksinasi' | 'Pengobatan' | 'Melahirkan' | 'Pemberian Cacing' | 'Pemotongan Kuku';

export interface Cow {
  id: string;
  name: string;
  breed: string;
  dob: string;
  gender: 'Betina' | 'Jantan';
  weight: number;
  status: CowStatus;
  tag: string;
  sire?: string;
  dam?: string;
}

export interface MilkingRecord {
  id: string;
  cowId: string;
  cowName: string;
  date: string;
  session: MilkingSession;
  volume: number;
  fat: number;
  protein: number;
  notes?: string;
}

export interface FarmEvent {
  id: string;
  cowId: string;
  cowName: string;
  date: string;
  type: EventType;
  description: string;
  vet: string;
  followUp: string;
}

export interface FarmState {
  cows: Cow[];
  milking: MilkingRecord[];
  events: FarmEvent[];
}

export interface FarmContextType extends FarmState {
  addCow: (cow: Omit<Cow, 'id'>) => void;
  addMilking: (record: Omit<MilkingRecord, 'id'>) => void;
  addEvent: (event: Omit<FarmEvent, 'id'>) => void;
  stats: {
    totalHerd: number;
    femaleCount: number;
    lactatingCount: number;
    totalMilk: number;
    milkingSessions: number;
    overdueCount: number;
  };
}

// Constants
export const BREEDS = ['Friesian Holstein', 'Limousin', 'Simmental', 'Brahman', 'Ongole', 'Madura', 'Bali'];
export const STATUSES = ['Laktasi', 'Kering', 'Hamil', 'Aktif', 'Karantina', 'Terjual'] as const;
export const SESSIONS = ['Pagi', 'Siang', 'Malam'] as const;
export const ETYPES = ['Pemeriksaan Kesehatan', 'Pengawinan', 'Penimbangan', 'Vaksinasi', 'Pengobatan', 'Melahirkan', 'Pemberian Cacing', 'Pemotongan Kuku'] as const;
