import { pgTable, text, integer, decimal, date, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: text('role', {
    enum: ['admin', 'manager', 'worker']
  }).default('worker').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastLoginAt: text('last_login_at'),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const cows = pgTable('cows', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  breed: text('breed').notNull(),
  dob: text('dob').notNull(),
  gender: text('gender', { enum: ['Betina', 'Jantan'] }).notNull(),
  weight: integer('weight').notNull(),
  status: text('status', {
    enum: ['Laktasi', 'Kering', 'Hamil', 'Aktif', 'Karantina', 'Terjual']
  }).notNull(),
  tag: text('tag').notNull(),
  sire: text('sire'),
  dam: text('dam'),
  length: integer('length'), // Body length in cm (Panjang)
  chestCircumference: integer('chest_circumference'), // Chest circumference in cm (Lingkar dada)
  reproductiveNotes: text('reproductive_notes'), // Reproductive status notes (Keterangan)
});

export const milkingRecords = pgTable('milking_records', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  cowName: text('cow_name').notNull(),
  date: text('date').notNull(),
  session: text('session', { enum: ['Pagi', 'Siang', 'Malam'] }).notNull(),
  volume: decimal('volume').notNull(),
  fat: decimal('fat').notNull(),
  protein: decimal('protein').notNull(),
  lactose: decimal('lactose'),
  totalSolids: decimal('total_solids'),
  notes: text('notes'),
});

export const cowMeasurements = pgTable('cow_measurements', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  date: text('date').notNull(),
  weight: integer('weight').notNull(),
  length: integer('length'),
  chestCircumference: integer('chest_circumference'),
  notes: text('notes'),
});

export const environmentalData = pgTable('environmental_data', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(),
  tempMin: decimal('temp_min'),
  tempMax: decimal('temp_max'),
  humidity: integer('humidity'),
  thi: decimal('thi'), // Temperature Humidity Index (auto-calculated)
  thunderstorm: boolean('thunderstorm').default(false),
  notes: text('notes'),
});

export const milkCollection = pgTable('milk_collection', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  buyerName: text('buyer_name').notNull(), // e.g., "Kansas"
  totalQuantity: decimal('total_quantity').notNull(),
  fatAverage: decimal('fat_average'),
  proteinAverage: decimal('protein_average'),
  notes: text('notes'),
});

export const farmEvents = pgTable('farm_events', {
  id: text('id').primaryKey(),
  cowId: text('cow_id').notNull(),
  cowName: text('cow_name').notNull(),
  date: text('date').notNull(),
  type: text('type', {
    enum: ['Pemeriksaan Kesehatan', 'Pengawinan', 'Penimbangan', 'Vaksinasi', 'Pengobatan', 'Melahirkan', 'Pemberian Cacing', 'Pemotongan Kuku']
  }).notNull(),
  description: text('description').notNull(),
  vet: text('vet').notNull(),
  followUp: text('follow_up').notNull(),
});

// Asset Inventory
export const assets = pgTable('assets', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),           // "Mesin cooling", "Motor Roda 2", etc.
  category: text('category'),             // "Machinery", "Vehicle", "Equipment"
  purchaseDate: text('purchase_date'),    // "Tanggal Pembelian"
  quantity: integer('quantity').notNull(),
  unit: text('unit'),                     // "Unit", "Set", "Piece"
  notes: text('notes'),                   // "Keterangan"
  status: text('status', {
    enum: ['Active', 'Maintenance', 'Retired', 'Lost']
  }).default('Active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Feed Inventory
export const feedInventory = pgTable('feed_inventory', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),           // Feed name
  purchaseDate: text('purchase_date'),    // "Tanggal Pembelian"
  quantity: integer('quantity'),          // Number of bags/units
  weightKg: decimal('weight_kg'),         // "Jumlah (Kg/Ton)"
  unit: text('unit'),                     // "Kg", "Ton", "Bag"
  unitPrice: decimal('unit_price'),       // Price per unit (optional)
  totalPrice: decimal('total_price'),     // Total cost (optional)
  expiryDate: text('expiry_date'),        // Track freshness
  supplier: text('supplier'),             // Supplier name (optional)
  notes: text('notes'),                   // "Keterangan"
  currentStock: integer('current_stock'), // Remaining quantity
  minStock: integer('min_stock'),         // Reorder point
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Inventory Usage Tracking
export const inventoryUsage = pgTable('inventory_usage', {
  id: text('id').primaryKey(),
  itemId: text('item_id').notNull(),
  itemType: text('item_type', {
    enum: ['feed', 'asset']
  }).notNull(),
  date: text('date').notNull(),
  quantity: integer('quantity').notNull(),
  weightKg: decimal('weight_kg'),
  purpose: text('purpose'),              // What was it used for
  notes: text('notes'),
  recordedBy: text('recorded_by'),
});

// Asset Maintenance Tracking
export const assetMaintenance = pgTable('asset_maintenance', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  date: text('date').notNull(),
  type: text('type', {
    enum: ['Routine', 'Repair', 'Inspection', 'Replacement']
  }).notNull(),
  description: text('description').notNull(),
  cost: decimal('cost'),
  vendor: text('vendor'),
  nextMaintenance: text('next_maintenance'),
  notes: text('notes'),
});

// Land & Pasture Management (Phase 3)
export const landPlots = pgTable('land_plots', {
  id: text('id').primaryKey(),
  plotName: text('plot_name').notNull(),    // Plot identifier (A, B, etc.)
  location: text('location'),                // Location description
  area: decimal('area'),                     // Area in hectares/m²
  areaUnit: text('area_unit'),               // "ha", "m²", "acre"

  // Crop information
  cropType: text('crop_type', {
    enum: ['Pakchong', 'Red Napier', 'Telang', 'Millet', 'Mombassa', 'Other']
  }),
  cropVariety: text('crop_variety'),         // Full variety name
  plantingDate: text('planting_date'),

  // Cut cycle tracking
  currentCutCycle: integer('cut_cycle'),     // Current cycle number
  lastCutDate: text('last_cut_date'),
  nextCutDate: text('next_cut_date'),

  // Status
  status: text('status', {
    enum: ['Growing', 'Ready', 'Harvested', 'Fallow', 'Other']
  }).default('Growing'),

  // Assignment
  assignedTo: text('assigned_to'),           // Animal group (e.g., "Anak")
  barnLocation: text('barn_location'),       // Barn/Kandan location

  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const forageHarvests = pgTable('forage_harvests', {
  id: text('id').primaryKey(),
  plotId: text('plot_id').notNull(),
  plotName: text('plot_name').notNull(),

  // Harvest details
  harvestDate: text('harvest_date').notNull(),
  cutNumber: integer('cut_number').notNull(),  // 1st Cut, 2nd Cut, 3rd Cut
  quantity: decimal('quantity'),               // Harvested amount
  quantityUnit: text('quantity_unit'),         // "kg", "ton", "bundle"

  // Quality
  quality: text('quality', {
    enum: ['Excellent', 'Good', 'Average', 'Poor']
  }),
  height: decimal('height'),                   // Grass height at harvest
  heightUnit: text('height_unit'),             // "cm"

  // Usage
  usedFor: text('used_for'),                   // Which animals
  storageLocation: text('storage_location'),

  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});
