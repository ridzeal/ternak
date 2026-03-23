export type CowStatus = 'Lactating' | 'Dry' | 'Pregnant' | 'Active' | 'Quarantine' | 'Sold';
export type MilkingSession = 'Morning' | 'Afternoon' | 'Evening';
export type EventType = 'Health Check' | 'Breeding' | 'Weighing' | 'Vaccination' | 'Treatment' | 'Calving' | 'Deworming' | 'Hoof Trim';

export interface Cow {
  id: string;
  name: string;
  breed: string;
  dob: string;
  gender: 'Female' | 'Male';
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
export const STATUSES = ['Lactating', 'Dry', 'Pregnant', 'Active', 'Quarantine', 'Sold'] as const;
export const SESSIONS = ['Morning', 'Afternoon', 'Evening'] as const;
export const ETYPES = ['Health Check', 'Breeding', 'Weighing', 'Vaccination', 'Treatment', 'Calving', 'Deworming', 'Hoof Trim'] as const;
