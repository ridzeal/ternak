export type UserRole = 'admin' | 'manager' | 'worker';
export type CowStatus = 'Laktasi' | 'Kering' | 'Hamil' | 'Aktif' | 'Karantina' | 'Terjual';
export type MilkingSession = 'Pagi' | 'Siang' | 'Malam';
export type EventType = 'Pemeriksaan Kesehatan' | 'Pengawinan' | 'Penimbangan' | 'Vaksinasi' | 'Pengobatan' | 'Melahirkan' | 'Pemberian Cacing' | 'Pemotongan Kuku';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

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
  length?: number; // Body length in cm (Panjang)
  chestCircumference?: number; // Chest circumference in cm (Lingkar dada)
  reproductiveNotes?: string; // Reproductive status notes (Keterangan)
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
  lactose?: number;
  totalSolids?: number;
  notes?: string;
}

export interface CowMeasurement {
  id: string;
  cowId: string;
  date: string;
  weight: number;
  length?: number;
  chestCircumference?: number;
  notes?: string;
}

export interface EnvironmentalData {
  id: string;
  date: string;
  tempMin?: number;
  tempMax?: number;
  humidity?: number;
  thi?: number;
  thunderstorm?: boolean;
  notes?: string;
}

export interface MilkCollection {
  id: string;
  date: string;
  buyerName: string;
  totalQuantity: number;
  fatAverage?: number;
  proteinAverage?: number;
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
  updateCow: (cow: Cow) => void;
  deleteCow: (id: string) => void;
  addMilking: (record: Omit<MilkingRecord, 'id'>) => void;
  updateMilking: (record: MilkingRecord) => void;
  deleteMilking: (id: string) => void;
  addEvent: (event: Omit<FarmEvent, 'id'>) => void;
  updateEvent: (event: FarmEvent) => void;
  deleteEvent: (id: string) => void;
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
