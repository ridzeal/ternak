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

export interface Asset {
  id: string;
  name: string;
  category?: string;
  purchaseDate?: string;
  quantity: number;
  unit?: string;
  notes?: string;
  status?: 'Active' | 'Maintenance' | 'Retired' | 'Lost';
  createdAt: string;
  updatedAt: string;
}

export interface FeedInventory {
  id: string;
  name: string;
  purchaseDate?: string;
  quantity?: number;
  weightKg?: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
  expiryDate?: string;
  supplier?: string;
  notes?: string;
  currentStock?: number;
  minStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryUsage {
  id: string;
  itemId: string;
  itemType: 'feed' | 'asset';
  date: string;
  quantity: number;
  weightKg?: number;
  purpose?: string;
  notes?: string;
  recordedBy?: string;
}

export interface AssetMaintenance {
  id: string;
  assetId: string;
  date: string;
  type: 'Routine' | 'Repair' | 'Inspection' | 'Replacement';
  description: string;
  cost?: number;
  vendor?: string;
  nextMaintenance?: string;
  notes?: string;
}

export interface LandPlot {
  id: string;
  plotName: string;
  location?: string;
  area?: number;
  areaUnit?: string;
  cropType?: 'Pakchong' | 'Red Napier' | 'Telang' | 'Millet' | 'Mombassa' | 'Other';
  cropVariety?: string;
  plantingDate?: string;
  currentCutCycle?: number;
  lastCutDate?: string;
  nextCutDate?: string;
  status?: 'Growing' | 'Ready' | 'Harvested' | 'Fallow' | 'Other';
  assignedTo?: string;
  barnLocation?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ForageHarvest {
  id: string;
  plotId: string;
  plotName: string;
  harvestDate: string;
  cutNumber: number;
  quantity?: number;
  quantityUnit?: string;
  quality?: 'Excellent' | 'Good' | 'Average' | 'Poor';
  height?: number;
  heightUnit?: string;
  usedFor?: string;
  storageLocation?: string;
  notes?: string;
  createdAt: string;
}

export interface ReproductiveEvent {
  id: string;
  cowId: string;
  cowName: string;
  eventType: 'Heat' | 'Insemination' | 'Pregnancy Check' | 'Pregnant' | 'Miscarriage' | 'Calving' | 'Edema';
  eventDate: string;
  expectedDate?: string;
  actualDate?: string;
  semenId?: string;
  semenSource?: string;
  technician?: string;
  pregnancyStatus?: 'Open' | 'Pregnant' | 'Uncertain';
  pregnancyDays?: number;
  calfGender?: 'Male' | 'Female' | 'Twins';
  calfWeight?: number;
  calvingEase?: 'Easy' | 'Assisted' | 'Difficult';
  status?: string;
  notes?: string;
  createdAt: string;
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
  refreshData: () => Promise<void>;
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
export const ASSET_CATEGORIES = ['Machinery', 'Vehicle', 'Equipment', 'Building', 'Tool'] as const;
export const ASSET_STATUSES = ['Active', 'Maintenance', 'Retired', 'Lost'] as const;
export const FEED_UNITS = ['Kg', 'Ton', 'Bag', 'Sack'] as const;
export const MAINTENANCE_TYPES = ['Routine', 'Repair', 'Inspection', 'Replacement'] as const;
export const CROP_TYPES = ['Pakchong', 'Red Napier', 'Telang', 'Millet', 'Mombassa', 'Other'] as const;
export const PLOT_STATUSES = ['Growing', 'Ready', 'Harvested', 'Fallow', 'Other'] as const;
export const HARVEST_QUALITY = ['Excellent', 'Good', 'Average', 'Poor'] as const;
export const REPRODUCTIVE_EVENT_TYPES = ['Heat', 'Insemination', 'Pregnancy Check', 'Pregnant', 'Miscarriage', 'Calving', 'Edema'] as const;
export const PREGNANCY_STATUSES = ['Open', 'Pregnant', 'Uncertain'] as const;
export const CALVING_EASE = ['Easy', 'Assisted', 'Difficult'] as const;
